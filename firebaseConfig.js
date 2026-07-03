/**
 * Firebase Config - Nível Sênior Diretor
 * Features: Hot reload safe, AsyncStorage persistência, Analytics opcional,
 * Validação de env, Singleton pattern, Tratamento de erro
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// 1. VALIDAÇÃO DAS ENVS - Falha rápido se faltar chave
const requiredEnvs = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`[Firebase Config] Variável de ambiente ${key} não definida no.env`);
  }
});

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID, // opcional
};

// 2. SINGLETON - Evita "app already exists" no hot reload do Expo
const app = getApps().length === 0? initializeApp(firebaseConfig) : getApp();

// 3. AUTH COM PERSISTÊNCIA - Safe para hot reload
let auth;
try {
  // Tenta inicializar com AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // Se já foi inicializado, pega a instância existente
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error; // Outro erro, deixa estourar
  }
}

// 4. FIRESTORE
const db = getFirestore(app);

// 5. STORAGE
const storage = getStorage(app);

// 6. ANALYTICS - Só ativa se for suportado e tiver measurementId
let analytics = null;
if (firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
export default app;
