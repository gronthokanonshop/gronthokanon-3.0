/* ═══════════════════════════════════════
   গ্রন্থকানন — Firebase Config
═══════════════════════════════════════ */

const firebaseConfig = {
    apiKey: "AIzaSyBQMZ3x2d-2ELopI-3w78EFrcWnfIh2xg0",
    authDomain: "gronthokanon-8573e.firebaseapp.com",
    databaseURL: "https://gronthokanon-8573e-default-rtdb.firebaseio.com",
    projectId: "gronthokanon-8573e",
    storageBucket: "gronthokanon-8573e.firebasestorage.app",
    messagingSenderId: "192907327925",
    appId: "1:192907327925:web:1c469a312aa02bf2fe81fc",
    measurementId: "G-KFQF4ND0KF"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// App Check
const appCheck = firebase.appCheck();
appCheck.activate('6Ldh1gMtAAAAOb15gX3zTqLni_ke6eEmDlknbNV', true);

const auth = firebase.auth();
const db   = firebase.database();

// Firestore — শুধু book.html এ load হবে
if (typeof firebase.firestore === 'function') {
    window.fsdb = firebase.firestore();
}
