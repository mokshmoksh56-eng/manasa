// ==========================================
// firebase-config.js
// منصة احجزلي - إعدادات Firebase
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, query, where, orderBy, serverTimestamp,
    onSnapshot, writeBatch, limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// 🎯 إدارة حالة المصادقة - نسخة محسّنة
// ==========================================
let currentUser = null;
let authInitialized = false;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authInitialized = true;
    if (user) {
        console.log('✅ Firebase Auth - User:', user.uid);
    } else {
        console.log('ℹ️ Firebase Auth - No user');
    }
});

// ✅ دالة آمنة لا تعلّق أبداً
function waitForAuth() {
    return new Promise((resolve) => {
        // ✅ لو auth جاهز → ارجع فوراً
        if (authInitialized) {
            resolve(currentUser);
            return;
        }
        
        // ⏱️ انتظر أول إشارة فقط + Timeout 3 ثواني
        let resolved = false;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (resolved) return;
            resolved = true;
            unsubscribe();
            resolve(user);
        });

        setTimeout(() => {
            if (resolved) return;
            resolved = true;
            unsubscribe();
            resolve(auth.currentUser);
        }, 3000);
    });
}

function getCurrentUid() {
    return currentUser ? currentUser.uid : null;
}

function isLoggedIn() {
    return currentUser !== null;
}

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

export { 
    db, auth, 
    currentUser, waitForAuth, getCurrentUid, isLoggedIn, logoutUser,
    collection, doc, addDoc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, query, where, orderBy, serverTimestamp,
    onSnapshot, writeBatch, limit,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
};
