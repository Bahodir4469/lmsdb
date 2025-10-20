const getBaseUrl = (req) => {
  const protocol = req.protocol;
  const host = req.get('host'); // e.g., localhost:3000 yoki domain.com
  return `${protocol}://${host}`;
};

module.exports = getBaseUrl;
