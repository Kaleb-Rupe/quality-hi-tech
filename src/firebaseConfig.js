import { initializeApp } from "firebase/app";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

const stripePublishableKey = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY_DEV
  : process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY_PROD;

const stripeSecretKey = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_STRIPE_SECRET_KEY_DEV
  : process.env.REACT_APP_STRIPE_SECRET_KEY_PROD;

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:8888');
  
  const functions = getFunctions(app);
  connectFunctionsEmulator(functions, 'localhost', 9001);

  const storage = getStorage(app);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export {
  storage,
  auth,
  analytics,
  stripeSecretKey,
  stripePublishableKey,
};