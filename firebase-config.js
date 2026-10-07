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

export async function checkTeacherDevice(phone) {
    const teacher = await getTeacher(phone);
    if (!teacher) return { ok: false, locked: false, reason: 'not_found' };

    if (teacher.isLocked === true) {
        return { ok: false, locked: true, reason: 'locked', teacher };
    }

    const currentDeviceId = generateDeviceId();

    if (!teacher.activeDeviceId) {
        return { ok: true, locked: false, isFirst: true, teacher };
    }

    if (teacher.activeDeviceId === currentDeviceId) {
        return { ok: true, locked: false, isSame: true, teacher };
    }

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

export async function checkStudentDevice(accountKey) {
    const student = await getStudentByKey(accountKey);
    if (!student) return { ok: false, locked: false, reason: 'not_found' };

    if (student.isLocked === true) {
        return { ok: false, locked: true, reason: 'locked', student };
    }

    const currentDeviceId = generateDeviceId();
    
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

export async function isTeacherLocked(phone) {
    try {
        const teacher = await getTeacher(phone);
        if (!teacher) return false;

        if (teacher.isLocked === true) return true;

        if (teacher.unlockUntil) {
            const until = typeof teacher.unlockUntil === 'number'
                ? teacher.unlockUntil
                : (teacher.unlockUntil.seconds ? teacher.unlockUntil.seconds * 1000 : 0);
            if (until && until <= Date.now()) return true;
        }

        return false;
    } catch (e) {
        console.error('خطأ في فحص حالة الحظر:', e);
        return false;
    }
}

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
// دوال المزامنة السحابية
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
// 💳 نظام الاشتراكات (بدون Google Play - تفعيل يدوي عبر الإيميل)
// ==========================================================

export const ADMIN_EMAIL = 'mmoksh162@gmail.com';

export const SUBSCRIPTION_PLANS = {
    trial: {
        id: 'trial',
        name: 'الباقة التجريبية',
        icon: '🎁',
        durationDays: 60,
        price: 0,
        priceText: 'مجاناً',
        requiresActivation: false,
        color: '#8B5CF6',
        features: [
            'كل المميزات مفتوحة لمدة 60 يوم',
            'بدون أي رسوم',
            'مرة واحدة فقط لكل حساب',
            'تفعيل فوري تلقائي'
        ]
    },
    free: {
        id: 'free',
        name: 'الباقة المجانية',
        icon: '🆓',
        durationDays: null,
        price: 0,
        priceText: 'مجاناً',
        requiresActivation: false,
        color: '#64748B',
        features: [
            'مجموعة واحدة فقط',
            'حتى 15 طالب',
            'مفتوح للأبد',
            'تفعيل فوري تلقائي'
        ]
    },
    '3months': {
        id: '3months',
        name: 'باقة 3 شهور',
        icon: '⭐',
        durationDays: 90,
        price: 99,
        priceText: '99 جنيه',
        requiresActivation: true,
        color: '#10B981',
        features: [
            'مجموعات غير محدودة',
            'طلاب غير محدود',
            'إحصائيات متقدمة',
            'تفعيل بعد التواصل بالإيميل'
        ]
    },
    '6months': {
        id: '6months',
        name: 'باقة 6 شهور',
        icon: '💎',
        durationDays: 180,
        price: 179,
        priceText: '179 جنيه',
        requiresActivation: true,
        popular: true,
        color: '#3B82F6',
        features: [
            'كل مميزات 3 شهور',
            'خصم 10%',
            'أولوية في الدعم',
            'تفعيل بعد التواصل بالإيميل'
        ]
    },
    '1year': {
        id: '1year',
        name: 'باقة سنة كاملة',
        icon: '👑',
        durationDays: 365,
        price: 299,
        priceText: '299 جنيه',
        requiresActivation: true,
        color: '#F59E0B',
        features: [
            'كل مميزات 6 شهور',
            'خصم 20%',
            'ميزات مستقبلية مجاناً',
            'دعم VIP',
            'تفعيل بعد التواصل بالإيميل'
        ]
    }
};

export async function requestSubscription(phone, planId, teacherInfo = {}) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) throw new Error('خطة غير صحيحة');

    const requestId = `req_${phone}_${Date.now()}`;
    const reqRef = doc(db, "subscription_requests", requestId);
    
    await setDoc(reqRef, {
        id: requestId,
        phone,
        planId,
        planName: plan.name,
        price: plan.price,
        priceText: plan.priceText,
        teacherName: teacherInfo.name || '',
        teacherTitle: teacherInfo.title || '',
        status: 'pending',
        requestedAt: serverTimestamp(),
        approvedAt: null,
        rejectedAt: null,
        adminNote: ''
    });

    return requestId;
}

export async function getAllSubscriptionRequests() {
    const snap = await getDocs(collection(db, "subscription_requests"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
            const ta = a.requestedAt?.seconds || 0;
            const tb = b.requestedAt?.seconds || 0;
            return tb - ta;
        });
}

export async function approveSubscription(requestId, adminNote = '') {
    const reqRef = doc(db, "subscription_requests", requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error('الطلب غير موجود');
    
    const req = reqSnap.data();
    const plan = SUBSCRIPTION_PLANS[req.planId];
    if (!plan) throw new Error('الخطة غير صحيحة');

    const now = new Date();
    
    const currentSub = await getTeacherSubscription(req.phone);
    let baseDate = now;
    if (currentSub && currentSub.endDate && new Date(currentSub.endDate) > now && currentSub.status === 'active') {
        baseDate = new Date(currentSub.endDate);
    }

    const endDate = new Date(baseDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    await setDoc(doc(db, "subscriptions", req.phone), {
        phone: req.phone,
        planId: req.planId,
        planName: plan.name,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        paymentMethod: 'manual',
        approvedBy: 'admin',
        approvedAt: now.toISOString(),
        updatedAt: serverTimestamp()
    }, { merge: true });

    await updateDoc(doc(db, "teachers", req.phone), {
        subscriptionPlan: req.planId,
        subscriptionStatus: 'active',
        subscriptionEnd: endDate.toISOString(),
        isPremium: true,
        isLocked: false,
        unlockedAt: now.getTime(),
        unlockUntil: endDate.getTime(),
        lockType: req.planId,
        unlockedBy: 'admin'
    });

    await updateDoc(reqRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        adminNote
    });

    return { phone: req.phone, endDate: endDate.toISOString() };
}

export async function rejectSubscription(requestId, adminNote = '') {
    await updateDoc(doc(db, "subscription_requests", requestId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        adminNote
    });
}

export async function createSubscription(phone, planId) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) throw new Error('خطة غير صحيحة');

    const now = new Date();
    let endDate = null;
    if (plan.durationDays) {
        const end = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
        endDate = end.toISOString();
    }

    const payload = {
        phone,
        planId,
        planName: plan.name,
        startDate: now.toISOString(),
        endDate,
        status: 'active',
        paymentMethod: 'free',
        updatedAt: serverTimestamp()
    };

    if (planId === 'trial') {
        payload.trialUsed = true;
        payload.trialUsedAt = now.toISOString();
    }

    await setDoc(doc(db, "subscriptions", phone), payload, { merge: true });

    await updateDoc(doc(db, "teachers", phone), {
        subscriptionPlan: planId,
        subscriptionStatus: 'active',
        subscriptionEnd: endDate,
        isPremium: planId === 'trial'
    });

    return { planId, startDate: now.toISOString(), endDate };
}

export async function getTeacherSubscription(phone) {
    try {
        const snap = await getDoc(doc(db, "subscriptions", phone));
        if (!snap.exists()) return null;
        const data = snap.data();
        
        if (data.endDate && new Date(data.endDate) < new Date() && data.status === 'active') {
            await updateDoc(doc(db, "subscriptions", phone), {
                status: 'expired',
                updatedAt: serverTimestamp()
            });
            data.status = 'expired';
        }
        return data;
    } catch (e) {
        console.error('خطأ جلب الاشتراك:', e);
        return null;
    }
}

// ==========================================================
// ✅ دالة فحص الاشتراك النشط (المُحدّثة - تقرأ من المصدرين)
// ==========================================================
export async function isSubscriptionActive(phone) {
    try {
        const teacher = await getTeacher(phone);
        if (teacher) {
            if (teacher.isLocked === true) {
                console.log('🚫 الاشتراك غير نشط — المعلم محظور يدوياً');
                return false;
            }

            if (teacher.lockType === 'permanent_open') {
                console.log('♾️ الاشتراك نشط — فتح دائم من الإدارة');
                return true;
            }

            if (teacher.unlockUntil) {
                const until = typeof teacher.unlockUntil === 'number'
                    ? teacher.unlockUntil
                    : (teacher.unlockUntil.seconds ? teacher.unlockUntil.seconds * 1000 : 0);

                if (until && until > Date.now()) {
                    const daysLeft = Math.ceil((until - Date.now()) / (1000 * 60 * 60 * 24));
                    console.log(`✅ الاشتراك نشط — تفعيل إدارة (باقي ${daysLeft} يوم)`);
                    return true;
                } else if (until && until <= Date.now()) {
                    console.log('⏰ الاشتراك منتهي — انتهت مدة التفعيل من الإدارة');
                }
            }
        }

        const sub = await getTeacherSubscription(phone);

        if (!sub) {
            console.log('⚠️ لا يوجد سجل اشتراك ولا تفعيل إدارة');
            return false;
        }

        if (sub.planId === 'free') {
            console.log('🆓 الباقة المجانية نشطة');
            return true;
        }

        if (sub.status !== 'active') {
            console.log(`❌ الاشتراك غير نشط — الحالة: ${sub.status}`);
            return false;
        }

        if (!sub.endDate) {
            console.log('✅ الاشتراك نشط — بدون تاريخ انتهاء');
            return true;
        }

        const isActive = new Date(sub.endDate) > new Date();
        if (isActive) {
            const daysLeft = Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            console.log(`✅ الاشتراك نشط — باقي ${daysLeft} يوم`);
        } else {
            console.log('⏰ الاشتراك منتهي — التاريخ فات');
        }
        return isActive;

    } catch (e) {
        console.error('خطأ في فحص الاشتراك:', e);
        return false;
    }
}

export async function hasUsedTrial(phone) {
    try {
        const snap = await getDoc(doc(db, "subscriptions", phone));
        if (!snap.exists()) return false;
        const data = snap.data();
        return data.trialUsed === true || data.planId === 'trial';
    } catch {
        return false;
    }
}

export async function getMyPendingRequest(phone) {
    const q = query(
        collection(db, "subscription_requests"), 
        where("phone", "==", phone),
        where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export function subscribeSubscriptionRequests(callback) {
    return onSnapshot(collection(db, "subscription_requests"), (snap) => {
        const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.requestedAt?.seconds || 0) - (a.requestedAt?.seconds || 0));
        callback(requests);
    }, (error) => {
        console.error('خطأ في الاستماع للطلبات:', error);
        callback([]);
    });
}

// ==========================================================
// 💰 إعدادات الأسعار (Pricing Settings)
// ==========================================================

export const DEFAULT_PRICING = {
    '3months': { 
        price: 150, 
        priceText: '150 جنيه', 
        days: 90, 
        label: '3 شهور',
        icon: '📅',
        color: '#3B82F6'
    },
    '6months': { 
        price: 250, 
        priceText: '250 جنيه', 
        days: 180, 
        label: '6 شهور',
        icon: '📅',
        color: '#8B5CF6'
    },
    '1year': { 
        price: 400, 
        priceText: '400 جنيه', 
        days: 365, 
        label: 'سنة كاملة',
        icon: '👑',
        color: '#F59E0B'
    }
};

export async function getPricingSettings() {
    try {
        const snap = await getDoc(doc(db, SETTINGS_COLLECTION, "pricing_settings"));
        if (snap.exists()) {
            return snap.data();
        }
        return null;
    } catch (e) {
        console.error('فشل جلب الأسعار:', e);
        return null;
    }
}

export async function savePricingSettings(pricing) {
    await setDoc(doc(db, SETTINGS_COLLECTION, "pricing_settings"), {
        ...pricing,
        updatedAt: Date.now()
    }, { merge: true });
}

export function subscribePricing(callback) {
    return onSnapshot(doc(db, SETTINGS_COLLECTION, "pricing_settings"), (snap) => {
        if (snap.exists()) {
            callback(snap.data());
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('خطأ في subscription الأسعار:', error);
        callback(null);
    });
}

// ==========================================================
// 💾 دوال مزامنة بيانات المعلم (localStorage ↔ Firestore)
// ==========================================================

const TEACHER_DATA_COLLECTION = "teacher_data";

/**
 * حفظ كل بيانات المعلم في Firestore
 */
export async function saveTeacherData(phone, data) {
    if (!phone) throw new Error('رقم الهاتف مطلوب');
    
    const ref = doc(db, TEACHER_DATA_COLLECTION, phone);
    await setDoc(ref, {
        phone: phone,
        teacherSelections: data.teacherSelections || null,
        mester1_selections: data.mester1_selections || null,
        mester1_is_locked: data.mester1_is_locked || false,
        teacher_appointments_summary: data.teacher_appointments_summary || null,
        teacher_groups_count: data.teacher_groups_count || 0,
        last_selected_gender: data.last_selected_gender || null,
        last_selected_location: data.last_selected_location || null,
        updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('☁️ تم حفظ بيانات المعلم في السحابة');
    return true;
}

/**
 * جلب بيانات المعلم من Firestore
 */
export async function getTeacherData(phone) {
    if (!phone) return null;
    
    try {
        const snap = await getDoc(doc(db, TEACHER_DATA_COLLECTION, phone));
        if (snap.exists()) {
            console.log('☁️ تم جلب بيانات المعلم من السحابة');
            return snap.data();
        }
        return null;
    } catch (e) {
        console.error('خطأ في جلب بيانات المعلم:', e);
        return null;
    }
}

/**
 * مزامنة البيانات من Firestore إلى localStorage
 */
export async function syncTeacherDataToLocal(phone) {
    if (!phone) return false;
    
    try {
        const cloudData = await getTeacherData(phone);
        if (!cloudData) {
            console.log('⚠️ لا توجد بيانات سحابية لهذا المعلم');
            return false;
        }
        
        let hasAnyData = false;

        if (cloudData.teacherSelections) {
            localStorage.setItem('teacherSelections', 
                typeof cloudData.teacherSelections === 'string' 
                    ? cloudData.teacherSelections 
                    : JSON.stringify(cloudData.teacherSelections));
            hasAnyData = true;
        }
        
        if (cloudData.mester1_selections) {
            localStorage.setItem('mester1_selections', 
                typeof cloudData.mester1_selections === 'string'
                    ? cloudData.mester1_selections
                    : JSON.stringify(cloudData.mester1_selections));
            hasAnyData = true;
        }
        
        if (cloudData.mester1_is_locked) {
            localStorage.setItem('mester1_is_locked', 'true');
        }
        
        if (cloudData.teacher_appointments_summary) {
            localStorage.setItem('teacher_appointments_summary',
                typeof cloudData.teacher_appointments_summary === 'string'
                    ? cloudData.teacher_appointments_summary
                    : JSON.stringify(cloudData.teacher_appointments_summary));
            hasAnyData = true;
        }
        
        if (cloudData.teacher_groups_count !== undefined && cloudData.teacher_groups_count !== null) {
            localStorage.setItem('teacher_groups_count', String(cloudData.teacher_groups_count));
            hasAnyData = true;
        }
        
        if (cloudData.last_selected_gender) {
            localStorage.setItem('last_selected_gender', cloudData.last_selected_gender);
        }
        
        if (cloudData.last_selected_location) {
            localStorage.setItem('last_selected_location', cloudData.last_selected_location);
        }
        
        console.log('✅ تمت مزامنة البيانات من السحابة للجهاز الجديد');
        return hasAnyData;
    } catch (e) {
        console.error('فشل المزامنة:', e);
        return false;
    }
}

/**
 * مزامنة البيانات من localStorage إلى Firestore
 */
export async function syncLocalDataToCloud(phone) {
    if (!phone) return false;
    
    try {
        const data = {
            teacherSelections: localStorage.getItem('teacherSelections'),
            mester1_selections: localStorage.getItem('mester1_selections'),
            mester1_is_locked: localStorage.getItem('mester1_is_locked') === 'true',
            teacher_appointments_summary: localStorage.getItem('teacher_appointments_summary'),
            teacher_groups_count: parseInt(localStorage.getItem('teacher_groups_count') || '0'),
            last_selected_gender: localStorage.getItem('last_selected_gender'),
            last_selected_location: localStorage.getItem('last_selected_location')
        };
        
        await saveTeacherData(phone, data);
        console.log('☁️ تم رفع البيانات المحلية للسحابة');
        return true;
    } catch (e) {
        console.error('فشل رفع البيانات:', e);
        return false;
    }
}

// ==========================================================
// التصدير النهائي
// ==========================================================
export { 
    app, db, auth, analytics,
    doc, setDoc, getDoc, updateDoc, deleteDoc,
    collection, addDoc, getDocs, query, where, onSnapshot, serverTimestamp
};
