// Import the required Firebase functions from the modular SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCRSlkuYRiF7LAVxka_sLpwck9Z28co5H8",
    authDomain: "issue-tracker-4088c.firebaseapp.com",
    projectId: "issue-tracker-4088c",
    storageBucket: "issue-tracker-4088c.appspot.com",
    messagingSenderId: "813120061356",
    appId: "1:813120061356:web:b5c4e0cb2084920f030409"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
