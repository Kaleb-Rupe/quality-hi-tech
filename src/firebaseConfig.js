import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDF3IZ7fge2iCpXYIEFaKGtdopXuoe3TUw",
  authDomain: "quality-hi-tech.firebaseapp.com",
  projectId: "quality-hi-tech",
  storageBucket: "quality-hi-tech.appspot.com",
  messagingSenderId: "461156867744",
  appId: "1:461156867744:web:82acd30f465c912654b3c5",
  measurementId: "G-B2EXS4FS59"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { storage, auth, analytics };