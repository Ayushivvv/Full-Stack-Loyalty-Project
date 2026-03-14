WINDOW_MINUTE = 60 * 1000; // 60 seconds
lastSuccessByIp = new Map();

function resetRequestRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const last = lastSuccessByIp.get(ip) || 0;

  if (now - last < WINDOW_MINUTE) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
  }
  next();
}

function markResetSuccess(req) {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';;
  lastSuccessByIp.set(ip, Date.now());
}

module.exports = { resetRequestRateLimiter, markResetSuccess };