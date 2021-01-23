import firebase from "firebase/app";
import "firebase/auth";

const config = {
  apliKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
}

export default function initFirebase() {
  if (!firebase.app.length) {
    firebase.initializeApp(config)
  }
}
