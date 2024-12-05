import { NextApiRequest, NextApiResponse } from "next";
// import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "../../../../db";

export async function POST(request: Request) {
    const client = createClient(); // Initialize database client
    try {
        const { token, newPassword } = await request.json(); // Expect token and new password from the request body

        if (!token || !newPassword) {
            return new Response(
                JSON.stringify({ error: "Missing token or new password." }),
                { status: 400 }
            );
        }

        // Verify the reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string, userId: number };
        const { email, userId } = decoded;

        // Check if the user exists in the database
        // const userQuery = "SELECT user_id FROM users WHERE email = $1";
        // const userResult = await client.query(userQuery, [email]);

        // if (userResult.rows.length === 0) {
        //     return new Response(
        //         JSON.stringify({ error: "User not found." }),
        //         { status: 404 }
        //     );
        // }

        // Check if the user ID matches the decoded user ID
        if (89 !== userId) {
            return new Response(
                JSON.stringify({ error: "Invalid token." }),
                { status: 400 }
            );
        }

        // Hash the new password before saving it
        const hashedPassword = newPassword;

        // Update the user's password in the database
        const updateQuery = "UPDATE users SET password = $1 WHERE user_id = $2";
        await client.query(updateQuery, [hashedPassword, userId]);

        return new Response(
            JSON.stringify({ success: true, message: "Password reset successful." }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset Password Error:", error);
        return new Response(
            JSON.stringify({ error: "Error processing request." }),
            { status: 500 }
        );
    } finally {
        client.end(); // Close the database connection
    }
}