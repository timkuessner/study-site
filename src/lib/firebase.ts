// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC17zxzUTKZKgMzbPI316H3wioVtHRup3I",
  authDomain: "study-site-ccbe3.firebaseapp.com",
  projectId: "study-site-ccbe3",
  storageBucket: "study-site-ccbe3.firebasestorage.app",
  messagingSenderId: "944883504439",
  appId: "1:944883504439:web:7d90e2dc7f1554894676b2",
  measurementId: "G-P5JRJ8342J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };