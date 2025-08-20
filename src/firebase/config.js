import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Replace these values with your actual Firebase config
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyComnh09sa_fTAIeY5jVvHxc1lH5vph8po",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "her-13a74.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "her-13a74",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "her-13a74.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "356704544247",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:356704544247:web:84eeed95f8cbd3369b3af2",
    measurementId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "G-SHMGF9RJPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };