import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import CryptoJS from 'crypto-js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

let currentSecretKey = null;
let unsubscribe = null;

const db = getFirestore();
const auth = getAuth();

export const initializeSecureStorage = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const initializeSecretKey = httpsCallable(getFunctions(), 'initializeSecretKey');
          await initializeSecretKey();

          const keyDoc = doc(db, 'secretKeys', 'current');
          unsubscribe = onSnapshot(keyDoc, (snapshot) => {
            if (snapshot.exists()) {
              currentSecretKey = snapshot.data().key;
              console.log("Secret key set successfully");
              resolve();
            } else {
              console.error('Secret key not found in Firestore');
              reject(new Error('Secret key not found'));
            }
          }, (error) => {
            console.error('Error fetching secret key:', error);
            reject(error);
          });
        } catch (error) {
          console.error('Error initializing secret key:', error);
          reject(error);
        }
      } else {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        currentSecretKey = null;
        console.log("No user logged in, secret key cleared");
        resolve();
      }
    });
  });
};

export const secureSet = (key, data) => {
  if (!currentSecretKey) {
    console.error('Secret key not available, unable to encrypt data');
    return;
  }
  try {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), currentSecretKey).toString();
    localStorage.setItem(key, encryptedData);
  } catch (error) {
    console.error('Error encrypting data:', error);
  }
};

export const secureGet = (key) => {
  if (!currentSecretKey) {
    console.error('Secret key not available, unable to decrypt data');
    return null;
  }
  try {
    const encryptedData = localStorage.getItem(key);
    if (encryptedData) {
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, currentSecretKey).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    }
  } catch (error) {
    console.error('Error decrypting data:', error);
  }
  return null;
};

// New function to securely cache invoices
export const cacheInvoices = (invoices, queryParams) => {
  const cacheKey = `cachedInvoices_${JSON.stringify(queryParams)}`;
  secureSet(cacheKey, invoices);
};

// New function to retrieve cached invoices
export const getCachedInvoices = (queryParams) => {
  const cacheKey = `cachedInvoices_${JSON.stringify(queryParams)}`;
  return secureGet(cacheKey);
};

// New function to clear the invoice cache
export const clearInvoiceCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('cachedInvoices_')) {
      localStorage.removeItem(key);
    }
  });
};

// New function to check if the cache is valid (e.g., not older than 1 hour)
export const isCacheValid = (queryParams) => {
  if (!getSecretKey()) {
    return false;
  }
  const cacheKey = `cachedInvoices_${JSON.stringify(queryParams)}`;
  const cacheTimestamp = secureGet(`${cacheKey}_timestamp`);
  if (!cacheTimestamp) return false;
  
  const now = new Date().getTime();
  const cacheAge = now - cacheTimestamp;
  const maxCacheAge = 60 * 60 * 1000; // 1 hour in milliseconds
  
  return cacheAge < maxCacheAge;
};

// New function to set the cache timestamp
export const setCacheTimestamp = (queryParams) => {
  const cacheKey = `cachedInvoices_${JSON.stringify(queryParams)}`;
  secureSet(`${cacheKey}_timestamp`, new Date().getTime());
};

export const getSecretKey = () => {
  return currentSecretKey;
};
