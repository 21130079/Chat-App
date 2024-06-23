import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC9_v4xj7fg3_tk_P-uk9Sh9wiMT_GDGiw",
    authDomain: "chat-app-e8a8b.firebaseapp.com",
    projectId: "chat-app-e8a8b",
    storageBucket: "chat-app-e8a8b.appspot.com",
    messagingSenderId: "136083794875",
    appId: "1:136083794875:web:2feafbeaad5b624fba329e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
