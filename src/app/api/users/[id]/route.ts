import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name) data.name = String(body.name).trim();
  if (body.email) data.email = String(body.email).toLowerCase().trim();
  if (body.role === "ADMIN" || body.role === "INSTRUCTOR") data.role = body.role;
  if (body.hourlyRate !== undefined) data.hourlyRate = Number(body.hourlyRate);
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.password && String(body.password).length >= 6) {
    data.passwordHash = await hashPassword(String(body.password));
  }
  const user = await prisma.user.update({ where: { id: params.id }, data });
  return NextResponse.json({ user });
}
