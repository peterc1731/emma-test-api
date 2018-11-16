const buildUrl = (domain, params) => `${domain
}?${Object.keys(params).map(k => (
  `${encodeURIComponent(k)}=${encodeURIComponent(Array.isArray(params[k]) ? params[k].join(' ') : params[k])}`
)).join('&')}`;

module.exports = {
  buildUrl,
};
