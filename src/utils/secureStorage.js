import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import CryptoJS from 'crypto-js';

let currentSecretKey = null;

const db = getFirestore();
const keyDoc = doc(db, 'secretKeys', 'current');

onSnapshot(keyDoc, (snapshot) => {
  if (snapshot.exists()) {
    currentSecretKey = snapshot.data().key;
  }
});

export const secureSet = (key, data) => {
  if (!currentSecretKey) {
    console.error('Secret key not available');
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
    console.error('Secret key not available');
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
