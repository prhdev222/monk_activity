import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Authorization code not found" }, { status: 400 });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || "",
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || "",
        client_secret: process.env.LINE_CHANNEL_SECRET || "",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile from LINE
    const profileResponse = await axios.get("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const lineProfile = profileResponse.data;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { lineUserId: lineProfile.userId }
    });

    if (!user) {
      // Create new user with LINE profile
      user = await prisma.user.create({
        data: {
          lineUserId: lineProfile.userId,
          lineDisplayName: lineProfile.displayName,
          linePictureUrl: lineProfile.pictureUrl,
          monkName: lineProfile.displayName || "พระ",
          templeName: "วัดที่ยังไม่ระบุ",
          consentPdpa: true, // Assume consent when using LINE Login
        },
      });
    } else {
      // Update existing user's LINE profile
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lineDisplayName: lineProfile.displayName,
          linePictureUrl: lineProfile.pictureUrl,
        },
      });
    }

    // Redirect to dashboard with user info
    const redirectUrl = new URL("/dashboard", req.url);
    redirectUrl.searchParams.set("lineLogin", "success");
    redirectUrl.searchParams.set("userId", user.id);
    redirectUrl.searchParams.set("smokes", user.smokes.toString());

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("LINE Login callback error:", error);
    
    // Redirect to login page with error
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("error", "line_login_failed");
    
    return NextResponse.redirect(redirectUrl);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 });
    }

    // Get user profile from LINE using access token
    const profileResponse = await axios.get("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const lineProfile = profileResponse.data;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { lineUserId: lineProfile.userId },
    });

    if (!user) {
      // Create new user with LINE profile
      user = await prisma.user.create({
        data: {
          lineUserId: lineProfile.userId,
          lineDisplayName: lineProfile.displayName,
          linePictureUrl: lineProfile.pictureUrl,
          monkName: lineProfile.displayName || "พระ",
          templeName: "วัดที่ยังไม่ระบุ",
          consentPdpa: true,
        },
      });
    } else {
      // Update existing user's LINE profile
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lineDisplayName: lineProfile.displayName,
          linePictureUrl: lineProfile.pictureUrl,
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      lineUserId: user.lineUserId,
      displayName: user.lineDisplayName,
      pictureUrl: user.linePictureUrl,
      monkName: user.monkName,
      smokes: user.smokes,
    });
  } catch (error) {
    console.error("LINE Login API error:", error);
    return NextResponse.json({ error: "LINE login failed" }, { status: 500 });
  }
}