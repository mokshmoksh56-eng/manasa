// ==========================================
// 🔥 firebase-config.js - النسخة المُحسّنة والمضمونة
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { 
    getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, 
    collection, addDoc, getDocs, query, where, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyABNlQQpyIw3k_ziw_-xT7SUrMV_v8Tt1Y",
    authDomain: "manasa-2e9bd.firebaseapp.com",
    projectId: "manasa-2e9bd",
    storageBucket: "manasa-2e9bd.firebasestorage.app",
    messagingSenderId: "603553286689",
    appId: "1:603553286689:web:dbc6db83d6c1eee1feb160",
    measurementId: "G-VG0KN2RMS0"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 👨‍🏫 دوال المعلمين
// ==========================================
export async function saveTeacher(teacher) {
    await setDoc(doc(db, "teachers", teacher.phone), {
        ...teacher,
        createdAt: serverTimestamp()
    });
    return true;
}

export async function getTeacher(phone) {
    const snap = await getDoc(doc(db, "teachers", phone));
    return snap.exists() ? snap.data() : null;
}

export async function getAllTeachers() {
    const snap = await getDocs(collection(db, "teachers"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteTeacher(phone) {
    await deleteDoc(doc(db, "teachers", phone));
    return true;
}

// ⭐ دالة تحديث اختيارات المعلم (يستخدمها mester1.html)
export async function updateTeacherSelections(phone, selections) {
    await updateDoc(doc(db, "teachers", phone), {
        selections: selections,
        selectionsUpdatedAt: serverTimestamp()
    });
    return true;
}

// ==========================================
// 🎓 دوال الطلاب
// ==========================================
export async function saveStudent(student) {
    const key = `${student.phone}_${student.pin}`;
    await setDoc(doc(db, "students", key), {
        ...student,
        registeredAt: serverTimestamp()
    });
    return true;
}

export async function getStudent(phone, pin) {
    const snap = await getDoc(doc(db, "students", `${phone}_${pin}`));
    return snap.exists() ? snap.data() : null;
}

export async function getStudentsByPhone(phone) {
    const q = query(collection(db, "students"), where("phone", "==", phone));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllStudents() {
    const snap = await getDocs(collection(db, "students"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteStudentsByPhone(phone) {
    const students = await getStudentsByPhone(phone);
    for (const s of students) {
        await deleteDoc(doc(db, "students", s.id));
    }
    return true;
}

// ==========================================
// 📚 دوال المجموعات (published_slots)
// ==========================================
export async function publishGroup(group) {
    const ref = doc(collection(db, "groups"));
    await setDoc(ref, {
        ...group,
        id: ref.id,
        publishedAt: serverTimestamp()
    });
    return ref.id;
}

export async function updateGroup(groupId, data) {
    await updateDoc(doc(db, "groups", groupId), data);
    return true;
}

export async function deleteGroup(groupId) {
    await deleteDoc(doc(db, "groups", groupId));
    return true;
}

export async function getAllGroups() {
    const snap = await getDocs(collection(db, "groups"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getGroupsByTeacher(teacherPhone) {
    const q = query(collection(db, "groups"), where("teacherPhone", "==", teacherPhone));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ==========================================
// 📅 دوال المواعيد (appointments)
// ==========================================
export async function saveAppointment(appt) {
    const ref = doc(collection(db, "appointments"));
    await setDoc(ref, { ...appt, id: ref.id, createdAt: serverTimestamp() });
    return ref.id;
}

export async function getAppointmentsByTeacher(teacherPhone) {
    const q = query(collection(db, "appointments"), where("teacherPhone", "==", teacherPhone));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteAppointment(id) {
    await deleteDoc(doc(db, "appointments", id));
    return true;
}

// ==========================================
// 📊 دوال الإحصائيات (school.html)
// ==========================================
export async function getDashboardStats() {
    const [students, teachers, groups] = await Promise.all([
        getAllStudents(),
        getAllTeachers(),
        getAllGroups()
    ]);
    return { students, teachers, groups };
}

// ==========================================
// 📈 دوال إضافية
// ==========================================
export async function incrementWhatsappClicks() {
    const ref = doc(db, "stats", "whatsapp");
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data().count || 0) : 0;
    await setDoc(ref, { count: current + 1 });
}

export async function getWhatsappClicks() {
    const snap = await getDoc(doc(db, "stats", "whatsapp"));
    return snap.exists() ? (snap.data().count || 0) : 0;
}

// ==========================================
// 🎯 التصدير
// ==========================================
export { app, db };
