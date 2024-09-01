import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB4RhYpGlsEzHXPo7klJTXUSCSBHgtgb_I",
  authDomain: "quality-hi-tech-74e77.firebaseapp.com",
  databaseURL: "https://quality-hi-tech-74e77-default-rtdb.firebaseio.com",
  projectId: "quality-hi-tech-74e77",
  storageBucket: "quality-hi-tech-74e77.appspot.com",
  messagingSenderId: "690281832227",
  appId: "1:690281832227:web:0898a5bb93ed8124deb696",
  measurementId: "G-S8WJHLGC2V",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { storage, auth, analytics, db, functions };
