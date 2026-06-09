import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAFP0E8o4m-04-OYyl91UPKlEWOMQFJ1SI",
  authDomain: "vetconnect-e0fee.firebaseapp.com",
  projectId: "vetconnect-e0fee",
  storageBucket: "vetconnect-e0fee.firebasestorage.app",
  messagingSenderId: "10833075492",
  appId: "1:10833075492:web:7bbd6baf198408858767b1",
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const vapidKey =
  "BMorvp0jblIasYKevFHz346EZzIpYALP4pofY7Tckh4EsLeBapTen6bWbLSFGQ504Ny7I8lPvtgErYNmUmBBaSE";
