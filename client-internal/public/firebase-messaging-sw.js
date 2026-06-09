importScripts(
  "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAFP0E8o4m-04-OYyl91UPKlEWOMQFJ1SI",
  authDomain: "vetconnect-e0fee.firebaseapp.com",
  projectId: "vetconnect-e0fee",
  storageBucket: "vetconnect-e0fee.firebasestorage.app",
  messagingSenderId: "10833075492",
  appId: "1:10833075492:web:7bbd6baf198408858767b1",
});
const messaging = firebase.messaging();
