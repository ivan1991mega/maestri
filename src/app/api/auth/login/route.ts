import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Credenziali mancanti" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Email o password non validi" }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Email o password non validi" }, { status: 401 });
  }
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return NextResponse.json({
    ok: true,
    role: user.role,
    redirect: user.role === "ADMIN" ? "/admin/calendario" : "/dashboard",
  });
}
