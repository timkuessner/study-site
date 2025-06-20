// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC17zxzUTKZKgMzbPI316H3wioVtHRup3I",
  authDomain: "study-site-ccbe3.firebaseapp.com",
  databaseURL: "https://study-site-ccbe3-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "study-site-ccbe3",
  storageBucket: "study-site-ccbe3.firebasestorage.app",
  messagingSenderId: "944883504439",
  appId: "1:944883504439:web:7d90e2dc7f1554894676b2",
  measurementId: "G-P5JRJ8342J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getDatabase(app);

export { app, analytics, auth, googleProvider, db };
