/* ═══════════════════════════════════════
   OurDedication — Firebase Config
   প্রজেক্ট: ourdedication-2a2d5
═══════════════════════════════════════ */

const firebaseConfig = {
    apiKey: "AIzaSyDlX6M5hjDzRw7s7pjkQnWgPLx7IrFKR9M",
    authDomain: "ourdedication-2a2d5.firebaseapp.com",
    databaseURL: "https://ourdedication-2a2d5-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ourdedication-2a2d5",
    storageBucket: "ourdedication-2a2d5.firebasestorage.app",
    messagingSenderId: "620500408191",
    appId: "1:620500408191:web:36d62348fda845e36dec4a",
    measurementId: "G-9NKSGHD7XQ"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db   = firebase.database();

// books-live.js এই URL ব্যবহার করে Firebase থেকে সরাসরি (SDK ছাড়া) বইয়ের লিস্ট আনে
window.OD_DB_URL = firebaseConfig.databaseURL;
