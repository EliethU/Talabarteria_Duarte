import { initializeApp } from "firebase/app";
import firebase from 'firebase/compat/app';

const firebaseConfig = {
    apiKey: "AIzaSyBk-r8Q3vUNEfQ402rpCvLFXvoBcBbHQxw",
    authDomain: "talabateria-7e73a.firebaseapp.com",
    projectId: "talabateria-7e73a",
    storageBucket: "talabateria-7e73a.firebasestorage.app",
    messagingSenderId: "517710672388",
    appId: "1:517710672388:web:6cf58e0d34be6ff8647b51",
    measurementId: "G-LVVLDET8S6"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
    }

    const appFirebase = initializeApp(firebaseConfig);

    export {appFirebase, firebase}