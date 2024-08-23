const admin = require("firebase-admin");

const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

const getCache = async (key) => {
  const cacheRef = admin.database().ref(`cache/${key}`);
  const snapshot = await cacheRef.once("value");
  const cache = snapshot.val();

  if (cache && Date.now() - cache.timestamp < CACHE_EXPIRATION) {
    return cache.data;
  }

  return null;
};

const setCache = async (key, data) => {
  const cacheRef = admin.database().ref(`cache/${key}`);
  await cacheRef.set({
    data,
    timestamp: Date.now(),
  });
};

module.exports = {getCache, setCache};
