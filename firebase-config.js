// ==========================================
// firebase-config.js
// منصة احجزلي - إعدادات Firebase الموحدة (v12.19.0)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import { 
    getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, query, where, orderBy, serverTimestamp,
    onSnapshot, writeBatch, limit
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC9EXJnOL6ReTB41Kc8SXMcnK657_h2Mwc",
    authDomain: "tagroba-fbe9b.firebaseapp.com",
    databaseURL: "https://tagroba-fbe9b-default-rtdb.firebaseio.com",
    projectId: "tagroba-fbe9b",
    storageBucket: "tagroba-fbe9b.firebasestorage.app",
    messagingSenderId: "238106301728",
    appId: "1:238106301728:web:549602e55f7fe8a7b0b345",
    measurementId: "G-CRVE7VMZMS"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// 🎯 إدارة حالة المصادقة
// ==========================================
let currentUser = null;
let authReadyResolve;
const authReadyPromise = new Promise(res => { authReadyResolve = res; });

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log('✅ Firebase Auth - User:', user.uid);
    } else {
        console.log('ℹ️ Firebase Auth - No user');
    }
    if (authReadyResolve) {
        authReadyResolve(user);
        authReadyResolve = null;
    }
});

async function waitForAuth() {
    if (currentUser !== null) return currentUser;
    return authReadyPromise;
}

// دالة لتسجيل الخروج الموحد
async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('current_teacher_profile');
        localStorage.removeItem('current_student_profile');
        console.log('✅ تم تسجيل الخروج');
        return true;
    } catch (e) {
        console.error('❌ فشل تسجيل الخروج:', e);
        return false;
    }
}

// تصدير جميع الدوال والمتغيرات لاستخدامها في باقي الصفحات
export { 
    app, analytics, db, auth, 
    currentUser, waitForAuth, logoutUser,
    collection, doc, addDoc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, query, where, orderBy, serverTimestamp,
    onSnapshot, writeBatch, limit,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signOut
};
