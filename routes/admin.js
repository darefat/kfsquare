'use strict';

const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Basic-Auth middleware
// Credentials are read exclusively from .env — never hardcoded
// ─────────────────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const base64     = authHeader.startsWith('Basic ') ? authHeader.slice(6) : '';
    const decoded    = Buffer.from(base64, 'base64').toString('utf8');
    const colonIdx   = decoded.indexOf(':');
    const user       = decoded.slice(0, colonIdx);
    const pass       = decoded.slice(colonIdx + 1);

    const validUser  = process.env.ADMIN_USERNAME;
    const validPass  = process.env.ADMIN_PASSWORD;

    if (!validUser || !validPass) {
        return res.status(503).json({
            error: 'Admin credentials not configured — add ADMIN_USERNAME and ADMIN_PASSWORD to .env'
        });
    }

    if (user === validUser && pass === validPass) return next();

    res.set('WWW-Authenticate', 'Basic realm="KFSQUARE Admin"');
    return res.status(401).json({ error: 'Invalid admin credentials' });
}

// Apply auth to every route below
router.use(requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// Safe model getter
// ─────────────────────────────────────────────────────────────────────────────
function getContact() {
    try   { return mongoose.model('Contact'); }
    catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const Contact = getContact();
        if (!Contact) return res.status(503).json({ error: 'Contact model not loaded' });

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [total, byStatus, byService, byPriority, lastWeek, collections] =
            await Promise.all([
                Contact.countDocuments(),
                Contact.aggregate([{ $group: { _id: '$status',          count: { $sum: 1 } } }]),
                Contact.aggregate([{ $group: { _id: '$serviceInterest', count: { $sum: 1 } } }]),
                Contact.aggregate([{ $group: { _id: '$priority',        count: { $sum: 1 } } }]),
                Contact.countDocuments({ createdAt: { $gte: weekAgo } }),
                mongoose.connection.db.listCollections().toArray()
            ]);

        res.json({
            database:    mongoose.connection.name,
            collections: collections.map(c => c.name),
            contacts: {
                total,
                lastWeek,
                byStatus:   Object.fromEntries(byStatus.map(x   => [x._id || 'unknown', x.count])),
                byService:  Object.fromEntries(byService.map(x  => [x._id || 'unknown', x.count])),
                byPriority: Object.fromEntries(byPriority.map(x => [x._id || 'unknown', x.count]))
            },
            connection: {
                host:  mongoose.connection.host,
                port:  mongoose.connection.port,
                state: ['disconnected','connected','connecting','disconnecting']
                            [mongoose.connection.readyState] ?? 'unknown'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/contacts
// Query: status, serviceInterest, priority, search, page, limit
// ─────────────────────────────────────────────────────────────────────────────
router.get('/contacts', async (req, res) => {
    try {
        const Contact = getContact();
        if (!Contact) return res.status(503).json({ error: 'Contact model not loaded' });

        const page  = Math.max(1,   parseInt(req.query.page  || '1',  10));
        const limit = Math.min(100, parseInt(req.query.limit || '15', 10));
        const skip  = (page - 1) * limit;
        const filter = {};

        if (req.query.status)          filter.status          = req.query.status;
        if (req.query.serviceInterest) filter.serviceInterest = req.query.serviceInterest;
        if (req.query.priority)        filter.priority        = req.query.priority;
        if (req.query.search) {
            const rx = new RegExp(
                req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'
            );
            filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { message: rx }];
        }

        const [contacts, total] = await Promise.all([
            Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Contact.countDocuments(filter)
        ]);

        res.json({ contacts, total, page, pages: Math.ceil(total / limit), limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/contacts/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/contacts/:id', async (req, res) => {
    try {
        const Contact = getContact();
        if (!Contact) return res.status(503).json({ error: 'Contact model not loaded' });
        const doc = await Contact.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ error: 'Contact not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/contacts/:id/status
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/contacts/:id/status', async (req, res) => {
    try {
        const Contact = getContact();
        if (!Contact) return res.status(503).json({ error: 'Contact model not loaded' });

        const allowed = ['new','contacted','qualified','proposal','converted','closed'];
        const { status } = req.body;
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
        }
        const doc = await Contact.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        ).lean();
        if (!doc) return res.status(404).json({ error: 'Contact not found' });
        res.json({ success: true, contact: doc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/contacts/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/contacts/:id', async (req, res) => {
    try {
        const Contact = getContact();
        if (!Contact) return res.status(503).json({ error: 'Contact model not loaded' });
        const doc = await Contact.findByIdAndDelete(req.params.id).lean();
        if (!doc) return res.status(404).json({ error: 'Contact not found' });
        res.json({ success: true, deleted: doc._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;