/**
 * Public runtime configuration for statically hosted pages.
 * This file must contain only non-secret browser settings.
 */
const staticSiteHosts = new Set(['kfsquare.com', 'www.kfsquare.com']);
window.KF_API_BASE = staticSiteHosts.has(window.location.hostname)
  ? 'https://kfsquare.onrender.com'
  : '';
