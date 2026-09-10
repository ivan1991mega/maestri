import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      hourlyRate: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const body = await req.json();
  const email = String(body.email || "").toLowerCase().trim();
  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  const role = body.role === "ADMIN" ? "ADMIN" : "INSTRUCTOR";
  const hourlyRate = Number(body.hourlyRate ?? 25);

  if (!email || !name || password.length < 6) {
    return NextResponse.json(
      { error: "Nome, email e password (min 6 caratteri) obbligatori" },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      role,
      hourlyRate,
    },
  });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
}
