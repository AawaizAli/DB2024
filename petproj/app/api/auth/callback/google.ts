import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["email", "profile"],
      });
      return NextResponse.redirect(authUrl);
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userInfoResponse = await oauth2Client.request({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
    });

    const userInfo = userInfoResponse.data as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    const { email, name } = userInfo;

    const query = "SELECT id, email, role FROM users WHERE email = $1";
    const result = await db.query(query, [email]);

    let user;
    if (result.rowCount === 0) {
      const defaultPassword = await bcrypt.hash("defaultGooglePassword123!", 10);

      const insertQuery = `
        INSERT INTO users (username, name, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, role
      `;
      const insertValues = [
        email.split("@")[0],
        name || "Google User",
        email,
        defaultPassword,
        "regular user",
      ];

      const insertResult = await db.query(insertQuery, insertValues);
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
    }

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `token=${tokens.id_token}; Path=/; HttpOnly; Secure;`
    );

    const redirectUrl = `${process.env.FRONTEND_URL}/browse-pets`;

    return NextResponse.redirect(redirectUrl, { headers });
  } catch (error) {
    console.error("Error with Google OAuth:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Google" },
      { status: 500 }
    );
  }
}
