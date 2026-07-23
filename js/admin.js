/**
 * KFSQUARE contact-administration dashboard.
 *
 * The browser supplies HTTP Basic Auth credentials after /admin challenges the
 * user. This module never reads or stores those credentials; it only calls the
 * protected /api/admin endpoints on the same origin.
 */
(function () {
  'use strict';

  const API_ROOT = `${window.location.origin}/api/admin`;
  const PAGE_SIZE = 15;
  const STATUS_COLORS = {
    new: 'primary',
    contacted: 'info',
    qualified: 'success',
    proposal: 'warning',
    converted: 'success',
    closed: 'secondary'
  };

  let currentPage = 1;
  let selectedContact = null;
  let searchTimer;

  const byId = (id) => document.getElementById(id);

  // Encode untrusted contact data before inserting it into HTML templates.
  function escapeHtml(value) {
    const node = document.createElement('div');
    node.textContent = String(value ?? '');
    return node.innerHTML;
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatLabel(value) {
    return escapeHtml(value || '—').replace(/-/g, ' ');
  }

  function statusBadge(status) {
    const safeStatus = String(status || 'new');
    const color = STATUS_COLORS[safeStatus] || 'secondary';
    return `<span class="badge bg-${color}">${escapeHtml(safeStatus)}</span>`;
  }

  function priorityLabel(priority) {
    const safePriority = String(priority || 'medium');
    return `<span class="pri-${escapeHtml(safePriority)}">${escapeHtml(safePriority)}</span>`;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast show text-white ${type === 'success' ? 'bg-success' : 'bg-danger'} border-0 mb-2`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button></div>`;
    toast.querySelector('.toast-body').textContent = message;
    toast.querySelector('button').addEventListener('click', () => toast.remove());
    byId('toasts').appendChild(toast);
    window.setTimeout(() => toast.remove(), 3500);
  }

  // Read text first so proxy/server HTML errors produce a useful fallback.
  async function request(path, options = {}) {
    const response = await fetch(`${API_ROOT}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const text = await response.text();

    try {
      return { ok: response.ok, status: response.status, data: JSON.parse(text) };
    } catch {
      return {
        ok: false,
        status: response.status,
        data: { error: text || 'The server returned an invalid response.' }
      };
    }
  }

  async function loadStats() {
    const { ok, data } = await request('/stats');
    if (!ok) {
      byId('db-badge').innerHTML = '<i class="fas fa-circle text-danger me-1"></i> Disconnected';
      return;
    }

    byId('s-total').textContent = data.contacts.total;
    byId('s-new').textContent = data.contacts.byStatus.new || 0;
    byId('s-qualified').textContent = data.contacts.byStatus.qualified || 0;
    byId('s-week').textContent = data.contacts.lastWeek;
    byId('db-badge').innerHTML = `<i class="fas fa-circle text-success me-1"></i><strong>${escapeHtml(data.database)}</strong> @ ${escapeHtml(data.connection.host)}:${escapeHtml(data.connection.port)}`;

    const collectionBadges = data.collections
      .map((collection) => `<span class="badge bg-secondary me-1">${escapeHtml(collection)}</span>`)
      .join('');
    const serviceBadges = Object.entries(data.contacts.byService)
      .sort((left, right) => right[1] - left[1])
      .map(([service, count]) => `<span class="badge bg-primary bg-opacity-75 me-1 mb-1">${formatLabel(service)}: ${escapeHtml(count)}</span>`)
      .join('');

    byId('db-info').innerHTML = `
      <div class="row g-3 small">
        <div class="col-md-3"><div class="dl">Database</div><div class="dv fw-bold">${escapeHtml(data.database)}</div></div>
        <div class="col-md-3"><div class="dl">Host</div><div class="dv">${escapeHtml(data.connection.host)}:${escapeHtml(data.connection.port)}</div></div>
        <div class="col-md-3"><div class="dl">State</div><div class="dv">${escapeHtml(data.connection.state)}</div></div>
        <div class="col-md-3"><div class="dl">Collections</div><div class="dv">${collectionBadges}</div></div>
        <div class="col-12"><div class="dl">Submissions by Service</div><div class="dv mt-1">${serviceBadges}</div></div>
      </div>`;
  }

  function contactQuery(page) {
    const query = new URLSearchParams({ page, limit: PAGE_SIZE });
    const filters = {
      status: byId('sel-status').value,
      priority: byId('sel-priority').value,
      serviceInterest: byId('sel-service').value,
      search: byId('inp-search').value.trim()
    };
    Object.entries(filters).forEach(([name, value]) => {
      if (value) query.set(name, value);
    });
    return query;
  }

  async function loadContacts(page = 1) {
    currentPage = page;
    const tableBody = byId('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4"><i class="fas fa-circle-notch fa-spin me-2"></i>Loading...</td></tr>';

    const { ok, data } = await request(`/contacts?${contactQuery(page)}`);
    if (!ok) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${escapeHtml(data.error || 'Failed to load contacts.')}</td></tr>`;
      return;
    }

    if (!data.contacts.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No records found</td></tr>';
    } else {
      tableBody.innerHTML = data.contacts.map((contact) => `
        <tr class="tbl-row" data-contact-id="${escapeHtml(contact._id)}" tabindex="0">
          <td class="ps-3 fw-semibold">${escapeHtml(contact.name)}</td>
          <td class="text-muted">${escapeHtml(contact.email)}</td>
          <td>${formatLabel(contact.serviceInterest)}</td>
          <td>${priorityLabel(contact.priority)}</td>
          <td>${statusBadge(contact.status)}</td>
          <td class="text-muted">${escapeHtml(formatDate(contact.createdAt))}</td>
        </tr>`).join('');
    }

    const pages = Math.max(1, data.pages || 1);
    byId('pg-info').textContent = `Page ${data.page} of ${pages} — ${data.total} total`;
    byId('btn-prev').disabled = data.page <= 1;
    byId('btn-next').disabled = data.page >= pages;
  }

  async function openDetail(id) {
    const { ok, data } = await request(`/contacts/${encodeURIComponent(id)}`);
    if (!ok) {
      showToast(data.error || 'Failed to load contact.', 'error');
      return;
    }

    selectedContact = data;
    byId('sel-new-status').value = data.status || 'new';
    byId('detail-col').style.display = 'block';
    byId('detail-body').innerHTML = `
      <div class="dl">ID</div><div class="dv font-monospace text-muted small">${escapeHtml(data._id)}</div>
      <div class="dl">Name</div><div class="dv">${escapeHtml(data.name)}</div>
      <div class="dl">Email</div><div class="dv"><a href="mailto:${encodeURIComponent(data.email)}">${escapeHtml(data.email)}</a></div>
      ${data.phone ? `<div class="dl">Phone</div><div class="dv">${escapeHtml(data.phone)}</div>` : ''}
      ${data.company ? `<div class="dl">Company</div><div class="dv">${escapeHtml(data.company)}</div>` : ''}
      <div class="dl">Service Interest</div><div class="dv">${formatLabel(data.serviceInterest)}</div>
      <div class="dl">Priority</div><div class="dv">${priorityLabel(data.priority)}</div>
      <div class="dl">Message</div><div class="dv msg-box mt-1">${escapeHtml(data.message)}</div>
      <div class="dl">Status</div><div class="dv">${statusBadge(data.status)}</div>
      <div class="dl">Submitted</div><div class="dv text-muted small">${escapeHtml(formatDate(data.createdAt))}</div>`;
  }

  function closeDetail() {
    byId('detail-col').style.display = 'none';
    selectedContact = null;
  }

  async function saveStatus() {
    if (!selectedContact) return;
    const status = byId('sel-new-status').value;
    const { ok, data } = await request(`/contacts/${selectedContact._id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });

    if (!ok) {
      showToast(data.error || 'Update failed.', 'error');
      return;
    }
    showToast(`Status updated to "${status}".`);
    await Promise.all([loadContacts(currentPage), loadStats()]);
  }

  async function deleteContact() {
    if (!selectedContact) return;
    if (!window.confirm(`Delete contact from ${selectedContact.name}?\nThis cannot be undone.`)) return;

    const { ok, data } = await request(`/contacts/${selectedContact._id}`, { method: 'DELETE' });
    if (!ok) {
      showToast(data.error || 'Delete failed.', 'error');
      return;
    }
    showToast('Contact deleted.');
    closeDetail();
    await Promise.all([loadContacts(currentPage), loadStats()]);
  }

  function initializeEvents() {
    byId('tbody').addEventListener('click', (event) => {
      const row = event.target.closest('[data-contact-id]');
      if (row) openDetail(row.dataset.contactId);
    });
    byId('tbody').addEventListener('keydown', (event) => {
      const row = event.target.closest('[data-contact-id]');
      if (row && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openDetail(row.dataset.contactId);
      }
    });
    byId('inp-search').addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => loadContacts(1), 350);
    });
    ['sel-status', 'sel-priority', 'sel-service'].forEach((id) => {
      byId(id).addEventListener('change', () => loadContacts(1));
    });
    byId('btn-refresh').addEventListener('click', () => Promise.all([loadStats(), loadContacts(currentPage)]));
    byId('btn-prev').addEventListener('click', () => loadContacts(currentPage - 1));
    byId('btn-next').addEventListener('click', () => loadContacts(currentPage + 1));
    byId('btn-close').addEventListener('click', closeDetail);
    byId('btn-save-status').addEventListener('click', saveStatus);
    byId('btn-delete').addEventListener('click', deleteContact);
  }

  initializeEvents();
  Promise.all([loadStats(), loadContacts()]);
}());
