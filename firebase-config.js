// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, 
    collection, addDoc, getDocs, query, where, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
    getAuth, signInWithPhoneNumber, RecaptchaVerifier, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyABNlQQpyIw3k_ziw_-xT7SUrMV_v8Tt1Y",
    authDomain: "manasa-2e9bd.firebaseapp.com",
    projectId: "manasa-2e9bd",
    storageBucket: "manasa-2e9bd.firebasestorage.app",
    messagingSenderId: "603553286689",
    appId: "1:603553286689:web:dbc6db83d6c1eee1feb160",
    measurementId: "G-VG0KN2RMS0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// ============ دوال المعلمين ============
export async function saveTeacher(teacher) {
    await setDoc(doc(db, "teachers", teacher.phone), {
        ...teacher,
        createdAt: serverTimestamp()
    });
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
}

export async function teacherExists(phone) {
    const snap = await getDoc(doc(db, "teachers", phone));
    return snap.exists();
}

// ============ دوال الطلاب ============
export async function saveStudent(student) {
    const key = `${student.phone}_${student.pin}`;
    await setDoc(doc(db, "students", key), {
        ...student,
        id: key,
        registeredAt: serverTimestamp()
    });
    return key;
}

export async function getStudent(phone, pin) {
    const snap = await getDoc(doc(db, "students", `${phone}_${pin}`));
    return snap.exists() ? snap.data() : null;
}

export async function getStudentByKey(key) {
    const snap = await getDoc(doc(db, "students", key));
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
    return students.length;
}

export async function deleteStudentByKey(key) {
    await deleteDoc(doc(db, "students", key));
}

// ✅ دالة جديدة: تحديث بيانات الطالب (الاسم، النوع، المرحلة، الصف، الموقع)
export async function updateStudentProfile(accountKey, data) {
    const allowed = ['name', 'gender', 'stage', 'grade', 'phone', 'lat', 'lng', 'address'];
    const updates = {};
    for (const k of allowed) {
        if (data[k] !== undefined && data[k] !== null && data[k] !== '') {
            updates[k] = data[k];
        }
    }
    if (Object.keys(updates).length === 0) return;
    updates.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, "students", accountKey), updates);
}

// ============ دوال المجموعات ============
export async function publishGroup(group) {
    const ref = doc(collection(db, "groups"));
    await setDoc(ref, {
        teacherName: group.teacherName || '',
        teacherTitle: group.teacherTitle || 'مستر',
        subject: group.subject || '',
        grade: group.grade || '',
        groupName: group.groupName || '',
        maxCapacity: group.maxCapacity || 20,
        bookedBoys: group.bookedBoys || 0,
        bookedGirls: group.bookedGirls || 0,
        gender: group.gender || 'all',
        type: group.type || 'center',
        location: group.location || '',
        address: group.address || '',
        fullAddress: group.fullAddress || group.address || '',
        detailedAddress: group.detailedAddress || '',
        lat: group.lat || null,
        lng: group.lng || null,
        startTime: group.startTime || '',
        endTime: group.endTime || '',
        daysNames: group.daysNames || [],
        apptType: group.apptType || 'normal',
        date: group.date || '',
        phone: group.phone || '',
        isActive: group.isActive !== false,
        id: ref.id,
        publishedAt: serverTimestamp()
    });
    return ref.id;
}

export async function updateGroup(groupId, data) {
    await updateDoc(doc(db, "groups", groupId), data);
}

export async function deleteGroup(groupId) {
    await deleteDoc(doc(db, "groups", groupId));
}

export async function getAllGroups() {
    const snap = await getDocs(collection(db, "groups"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getGroupsByTeacher(teacherPhone) {
    const q = query(collection(db, "groups"), where("phone", "==", teacherPhone));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============ دوال المواعيد ============
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
}

// ============ دوال الإحصائيات ============
export async function getDashboardStats() {
    const [students, teachers, groups] = await Promise.all([
        getAllStudents(),
        getAllTeachers(),
        getAllGroups()
    ]);
    return { students, teachers, groups };
}

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

// ============ دوال Single Device Login ============
export function generateDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

// ==========================================================
// ✅ محدّثة: checkTeacherDevice مع دعم حالة الحظر (isLocked)
// ==========================================================
export async function checkTeacherDevice(phone) {
    const teacher = await getTeacher(phone);
    if (!teacher) return { ok: false, locked: false, reason: 'not_found' };

    // 🚫 الحالة الأولى: المعلم محظور من قبل الإدارة
    if (teacher.isLocked === true) {
        return { 
            ok: false, 
            locked: true, 
            reason: 'locked',
            teacher 
        };
    }

    const currentDeviceId = generateDeviceId();

    // ✅ أول تسجيل دخول (لا يوجد جهاز مسجل)
    if (!teacher.activeDeviceId) {
        return { ok: true, locked: false, isFirst: true, teacher };
    }

    // ✅ نفس الجهاز
    if (teacher.activeDeviceId === currentDeviceId) {
        return { ok: true, locked: false, isSame: true, teacher };
    }

    // ⚠️ جهاز مختلف
    return { ok: false, locked: false, reason: 'different_device', teacher };
}

export async function updateTeacherDevice(phone) {
    const deviceId = generateDeviceId();
    await updateDoc(doc(db, "teachers", phone), {
        activeDeviceId: deviceId,
        lastLoginAt: new Date().toISOString()
    });
    return deviceId;
}

// ==========================================================
// ✅ محدّثة: checkStudentDevice مع دعم حالة الحظر (isLocked)
// ==========================================================
export async function checkStudentDevice(accountKey) {
    const student = await getStudentByKey(accountKey);
    if (!student) return { ok: false, locked: false, reason: 'not_found' };

    // 🚫 الحالة الأولى: الطالب مقفول من قبل الإدارة
    if (student.isLocked === true) {
        return { 
            ok: false, 
            locked: true, 
            reason: 'locked',
            student 
        };
    }

    const currentDeviceId = generateDeviceId();
    
    // ✅ مزامنة بيانات localStorage مع Firestore (للحسابات القديمة)
    try {
        const profile = JSON.parse(localStorage.getItem('current_student_profile') || '{}');
        if (profile.id === accountKey) {
            const updates = {};
            if (profile.grade && student.grade !== profile.grade) updates.grade = profile.grade;
            if (profile.stage && student.stage !== profile.stage) updates.stage = profile.stage;
            if (profile.gender && student.gender !== profile.gender) updates.gender = profile.gender;
            if (profile.name && student.name !== profile.name) updates.name = profile.name;
            
            if (Object.keys(updates).length > 0) {
                await updateDoc(doc(db, "students", accountKey), updates);
                console.log('✅ تمت مزامنة بيانات الطالب مع Firestore');
            }
        }
    } catch (e) {
        console.warn('⚠️ فشل المزامنة (تم تجاهله):', e);
    }
    
    if (!student.activeDeviceId) return { ok: true, locked: false, isFirst: true, student };
    if (student.activeDeviceId === currentDeviceId) return { ok: true, locked: false, isSame: true, student };
    return { ok: false, locked: false, reason: 'different_device', student };
}

export async function updateStudentDevice(accountKey) {
    const deviceId = generateDeviceId();
    await updateDoc(doc(db, "students", accountKey), {
        activeDeviceId: deviceId,
        lastLoginAt: new Date().toISOString()
    });
    return deviceId;
}

// ==========================================================
// ✅ دالة جديدة: فحص حالة حظر المعلم فقط (بدون فحص الجهاز)
// ==========================================================
export async function isTeacherLocked(phone) {
    try {
        const teacher = await getTeacher(phone);
        if (!teacher) return false;
        return teacher.isLocked === true;
    } catch (e) {
        console.error('خطأ في فحص حالة الحظر:', e);
        return false;
    }
}

// ✅ دالة جديدة: فحص حالة قفل الطالب فقط
export async function isStudentLocked(accountKey) {
    try {
        const student = await getStudentByKey(accountKey);
        if (!student) return false;
        return student.isLocked === true;
    } catch (e) {
        console.error('خطأ في فحص حالة قفل الطالب:', e);
        return false;
    }
}

// ==========================================================
// دوال المزامنة السحابية (school.html + mester1.html)
// ==========================================================

const SETTINGS_COLLECTION = "settings";

export const DEFAULT_CURRICULUM = {
    kg: {
        name: '🧸 رياض الأطفال',
        grades: [
            { name: 'KG1', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','لغة فرنسية','تربية دينية'] },
            { name: 'KG2', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','لغة فرنسية','تربية دينية'] }
        ]
    },
    primary: {
        name: '📗 المرحلة الابتدائية',
        grades: [
            { name: 'الأول الابتدائي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','تربية دينية','تربية فنية'] },
            { name: 'الثاني الابتدائي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','تربية دينية','تربية فنية'] },
            { name: 'الثالث الابتدائي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','علوم','دراسات اجتماعية','تربية دينية'] },
            { name: 'الرابع الابتدائي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','علوم','دراسات اجتماعية','تربية دينية','تكنولوجيا المعلومات'] },
            { name: 'الخامس الابتدائي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','علوم','دراسات اجتماعية','تربية دينية','تكنولوجيا المعلومات'] },
            { name: 'السادس الابتدائي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','علوم','دراسات اجتماعية','تربية دينية','تكنولوجيا المعلومات'] }
        ]
    },
    prep: {
        name: '📘 المرحلة الإعدادية',
        grades: [
            { name: 'الأول الإعدادي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','علوم','دراسات اجتماعية','تربية دينية','تكنولوجيا المعلومات'] },
            { name: 'الثاني الإعدادي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','علوم','دراسات اجتماعية','تربية دينية','تكنولوجيا المعلومات'] },
            { name: 'الثالث الإعدادي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','علوم','دراسات اجتماعية','تربية دينية','تكنولوجيا المعلومات'] }
        ]
    },
    secondary: {
        name: '📙 المرحلة الثانوية',
        grades: [
            { name: 'الأول الثانوي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','فيزياء','كيمياء','أحياء','تاريخ','فلسفة ومنطق'] },
            { name: 'الثاني الثانوي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','فيزياء','كيمياء','أحياء','تاريخ','جغرافيا'] },
            { name: 'الثالث الثانوي', subjects: ['لغة عربية','لغة إنجليزية','رياضيات','فيزياء','كيمياء','أحياء','تاريخ','جغرافيا','إحصاء'] }
        ]
    }
};

export async function getCurriculumSettings() {
    try {
        const snap = await getDoc(doc(db, SETTINGS_COLLECTION, "curriculum"));
        if (snap.exists()) {
            return snap.data().data || DEFAULT_CURRICULUM;
        }
        return DEFAULT_CURRICULUM;
    } catch (e) {
        console.error('خطأ قراءة المناهج:', e);
        return DEFAULT_CURRICULUM;
    }
}

export async function saveCurriculumSettings(curriculum, adminName = "admin") {
    await setDoc(doc(db, SETTINGS_COLLECTION, "curriculum"), {
        data: curriculum,
        updatedAt: serverTimestamp(),
        updatedBy: adminName,
        version: Date.now()
    });
}

export function subscribeCurriculum(callback) {
    return onSnapshot(doc(db, SETTINGS_COLLECTION, "curriculum"), (snap) => {
        if (snap.exists()) {
            callback(snap.data().data || DEFAULT_CURRICULUM, snap.data());
        } else {
            callback(DEFAULT_CURRICULUM, null);
        }
    }, (error) => {
        console.error('خطأ في الاستماع للمناهج:', error);
        callback(DEFAULT_CURRICULUM, null);
    });
}

// ==========================================================
// ✅ دوال الحظر (Lock/Unlock)
// ==========================================================
export async function setTeacherLock(phone, isLocked) {
    await updateDoc(doc(db, "teachers", phone), {
        isLocked: isLocked,
        lockedAt: isLocked ? new Date().toISOString() : null
    });
}

export async function setStudentLock(studentId, isLocked) {
    await updateDoc(doc(db, "students", studentId), {
        isLocked: isLocked,
        lockedAt: isLocked ? new Date().toISOString() : null
    });
}

export async function deleteTeacherAccount(phone) {
    const groups = await getGroupsByTeacher(phone);
    for (const g of groups) {
        await deleteDoc(doc(db, "groups", g.id));
    }
    await deleteDoc(doc(db, "teachers", phone));
    return { deletedGroups: groups.length };
}

export async function deleteStudentAccount(studentId) {
    await deleteDoc(doc(db, "students", studentId));
}

export function subscribeTeachers(callback) {
    return onSnapshot(collection(db, "teachers"), (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
        console.error('خطأ في الاستماع للمعلمين:', error);
        callback([]);
    });
}

export function subscribeStudents(callback) {
    return onSnapshot(collection(db, "students"), (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
        console.error('خطأ في الاستماع للطلاب:', error);
        callback([]);
    });
}

export function subscribeGroups(callback) {
    return onSnapshot(collection(db, "groups"), (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
        console.error('خطأ في الاستماع للمجموعات:', error);
        callback([]);
    });
}

// ==========================================================
// التصدير النهائي
// ==========================================================
export { 
    app, db, auth, analytics,
    doc, setDoc, getDoc, updateDoc, deleteDoc,
    collection, addDoc, getDocs, query, where, onSnapshot, serverTimestamp
};
