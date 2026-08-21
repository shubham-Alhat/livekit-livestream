import { cookies } from "next/headers";
import { cache } from "react";
import jwt from "jsonwebtoken";

export interface SessionPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
});
