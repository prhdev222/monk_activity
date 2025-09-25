import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { userCreateSchema } from "@/types/schemas";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = userCreateSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    const passwordHash = createHash("sha256").update(data.password).digest("hex");
    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        hn: data.hn,
        monkName: data.monkName,
        templeName: data.templeName ?? "",
        weightKg: data.weightKg,
        heightCm: data.heightCm,
        smokes: data.smokes,
        consentPdpa: data.consentPdpa,
      },
      select: { id: true, phone: true, monkName: true, smokes: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    // Prisma unique constraint error
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "phone_exists" }, { status: 409 });
    }
    console.error("/api/users POST error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}


