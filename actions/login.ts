"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { success: false, message: "Invalid username or password" };
  }

  //   check password as it is
  const isCorrectPass = user.password === password;

  if (!isCorrectPass) {
    return { success: false, message: "Invalid password" };
  }

  // issue your JWT / session here
  const token = jwt.sign(
    { userId: user.id, username: username },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    },
  );

  (await cookies()).set("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/"); // throws internally, Next.js handles it
}

export async function signUpUser(username: string, password: string) {
  // check if username already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "user with this username already exists",
    };
  }

  // create new entry in db
  const newUser = await prisma.user.create({
    data: {
      username: username,
      password: password,
    },
  });

  // issue your JWT / session here
  const token = jwt.sign(
    { userId: newUser.id, username: username },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    },
  );

  (await cookies()).set("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/"); // throws internally, Next.js handles it
}
