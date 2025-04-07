import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-messaging.js";
import firebaseConfig from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

let lastNotificationId = null;

// Registra el Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/js/firebase-messaging-sw.js")
    .then((registration) => {})
    .catch((error) => {});
}

async function tokenExiste(token) {
  try {
    const docRef = doc(db, "tokens", token);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    return false;
  }
}

async function guardarToken(token) {
  try {
    const docRef = doc(db, "tokens", token);
    await setDoc(docRef, { token, timestamp: serverTimestamp() }, { merge: true });
  } catch (e) {}
}

async function obtenerYGuardarToken() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey,
      serviceWorkerRegistration: registration, 
    });

    if (token) {
      await guardarToken(token);
    }
  } catch (error) {}
}

//pemiso sin bootn
window.addEventListener("DOMContentLoaded", async () => {
  if (Notification.permission === "granted") {
    obtenerYGuardarToken();
  } else if (Notification.permission === "denied") {
  } else {
    const permiso = await Notification.requestPermission();
    if (permiso === "granted") {
      obtenerYGuardarToken();
    }
  }
});

// Notificaciones en primer plano
onMessage(messaging, (payload) => {
  const { title, body, icon, image, click_action, notification_id } = payload.data || {};

  if (notification_id === lastNotificationId) {
    return;
  }
  lastNotificationId = notification_id;

  const notificationOptions = { body, icon, image };

  const notification = new Notification(title, notificationOptions);
  notification.onclick = () => {
    window.open(click_action, "_blank");
  };
});
