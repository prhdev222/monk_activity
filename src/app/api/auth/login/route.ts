import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();
  if (!phone || !password) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.passwordHash) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  const hash = createHash("sha256").update(password).digest("hex");
  if (hash !== user.passwordHash) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  return NextResponse.json({ id: user.id, phone: user.phone, monkName: user.monkName, smokes: user.smokes });
}


