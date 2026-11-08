// The customer application is now part of the unified admin build.
// Keep published /client/ links and project deep links compatible.
const hash = window.location.hash
const knownRoute = /^#\/(projects(?:\/\d+)?|intake|customer-login|customer\/(messages|mine|security))(?:\?.*)?$/.test(hash)
window.location.replace('/' + (knownRoute ? hash : '#/projects'))
