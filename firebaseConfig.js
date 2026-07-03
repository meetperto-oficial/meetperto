// firebaseConfig.js - PROJETO MEETPERTO2112
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAFUucTYq7ZO0ki2UO83vtOvcjLgPEMp9A",
  authDomain: "meetperto2112.firebaseapp.com",
  projectId: "meetperto2112",
  storageBucket: "meetperto2112.firebasestorage.app",
  messagingSenderId: "525891276454",
  appId: "1:525891276454:web:4d81481caa246b668b2e67"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
