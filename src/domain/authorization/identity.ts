import type { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { firebaseAdminAuth } from "@/lib/firebase/admin";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AuthError("Missing authentication token.", 401);
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new AuthError("Missing authentication token.", 401);
  return token;
}

export async function requireAppUser(
  request: Request,
  allowedRoles?: UserRole[],
) {
  let decoded;
  try {
    decoded = await firebaseAdminAuth.verifyIdToken(bearerToken(request));
  } catch {
    throw new AuthError("Invalid or expired authentication token.", 401);
  }

  const email = decoded.email?.trim().toLowerCase();
  if (!email) {
    throw new AuthError("This account does not have an email address.", 403);
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ firebaseUid: decoded.uid }, { email }],
    },
  });

  if (!user) {
    throw new AuthError(
      "Your sign-in worked, but this account has not been invited to That's Tuff Player Development yet.",
      403,
    );
  }

  if (!user.firebaseUid) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { firebaseUid: decoded.uid },
    });
  } else if (user.firebaseUid !== decoded.uid) {
    throw new AuthError("This email is already linked to another identity.", 403);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("You do not have access to this area.", 403);
  }

  return user;
}
