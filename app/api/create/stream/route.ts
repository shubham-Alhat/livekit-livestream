import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {}

  console.log(token);

  console.log("body:", body);
  return NextResponse.json({ body, message: "Hellow world" });
}
