"use client";

import { firebaseAuth } from "@/lib/firebase/client";

const ACTIVE_ORGANIZATION_KEY = "activeOrganizationId";

export function getActiveOrganizationId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_ORGANIZATION_KEY);
}

export function setActiveOrganizationId(organizationId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ORGANIZATION_KEY, organizationId);
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You are not signed in.");

  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const activeOrganizationId = getActiveOrganizationId();
  if (activeOrganizationId && !headers.has("x-organization-id")) {
    headers.set("x-organization-id", activeOrganizationId);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });
}
