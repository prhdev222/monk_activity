import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { 
      id: true, 
      phone: true, 
      firstName: true, 
      lastName: true, 
      hn: true, 
      templeName: true, 
      weightKg: true, 
      heightCm: true, 
      smokes: true,
      consentPdpa: true,
      createdAt: true
    },
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await req.json();
  const { 
    phone, 
    password, 
    firstName, 
    lastName, 
    hn, 
    templeName, 
    weightKg, 
    heightCm, 
    smokes 
  } = json as { 
    phone?: string; 
    password?: string; 
    firstName?: string; 
    lastName?: string; 
    hn?: string; 
    templeName?: string; 
    weightKg?: number; 
    heightCm?: number; 
    smokes?: boolean; 
  };

  const updateData: any = {};
  
  if (phone !== undefined) updateData.phone = phone;
  if (password !== undefined) {
    updateData.passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  }
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (hn !== undefined) updateData.hn = hn;
  if (templeName !== undefined) updateData.templeName = templeName;
  if (weightKg !== undefined) updateData.weightKg = weightKg;
  if (heightCm !== undefined) updateData.heightCm = heightCm;
  if (smokes !== undefined) updateData.smokes = smokes;

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { 
      id: true, 
      phone: true, 
      firstName: true, 
      lastName: true, 
      hn: true, 
      templeName: true, 
      weightKg: true, 
      heightCm: true, 
      smokes: true 
    },
  });
  return NextResponse.json(updated);
}


