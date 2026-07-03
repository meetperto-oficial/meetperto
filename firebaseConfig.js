// firebaseConfig.js - VERSÃO REACT NATIVE/EXPO
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAFUucTYq7ZO0ki2UO83vtOvcjLgPEMp9A",
  authDomain: "meetperto2112.firebaseapp.com",
  projectId: "meetperto2112",
  storageBucket: "meetperto2112.firebasestorage.app",
  messagingSenderId: "525891276454",
  appId: "1:525891276454:web:4d81481caa246b668b2e67"
};

const app = initializeApp(firebaseConfig);

// Auth com persistência pra não deslogar sozinho
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
