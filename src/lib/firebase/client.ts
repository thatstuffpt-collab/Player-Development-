import { getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5LsQFL4VfQMU33JLsgQ793D20YyrpBUM",
  authDomain: "thats-tuff-player-development.firebaseapp.com",
  projectId: "thats-tuff-player-development",
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);

export async function ensureBrowserAuthPersistence() {
  await setPersistence(firebaseAuth, browserLocalPersistence);
}
