import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app =
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault(),
    projectId: "thats-tuff-player-development",
  });

export const firebaseAdminAuth = getAuth(app);
