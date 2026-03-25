import nodeMailer from "nodemailer";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REFRESH_TOKEN,
  CLIENT_HOST,
} = process.env;

// 1. Initialize the OAuth2 Client with explicit types
const oauth2Client: OAuth2Client = new google.auth.OAuth2(
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });

/**
 * Sends a password reset email via Google OAuth2
 * @param email - Recipient email string
 * @param resetToken - The nanoid/hex token from the database
 */
const sendResetMail = async (email: string, resetToken: string): Promise<boolean> => {
  try {
    // 2. Generate a fresh Access Token
    const { token: accessToken } = await oauth2Client.getAccessToken();

    if (!accessToken) {
      throw new Error("Failed to generate Google Access Token. Check your Refresh Token.");
    }

    // 3. Configure the Transport with OAuth2
    const transport = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: "boazlimo07@gmail.com",
        clientId: GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
        refreshToken: GOOGLE_OAUTH_REFRESH_TOKEN,
        accessToken: accessToken as string,
      },
    } as any); // Cast as any to bypass complex Nodemailer/OAuth2 type conflicts

    // 4. Construct the URL
    const resetUrl = `${CLIENT_HOST}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Laikipia Canteen" <boazlimo07@gmail.com>`,
      to: email,
      subject: "Password Reset Request - Laikipia Canteen",
      text: `To reset your password, please visit: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #2c3e50; text-align: center;">Secure Password Reset</h2>
          <p>Hello,</p>
          <p>You requested to reset your password for the <strong>Cafeteria Management System</strong>. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
               Reset My Password
            </a>
          </div>
          <p style="color: #7f8c8d; font-size: 0.85em;">
            This link is valid for 1 hour. If you did not make this request, please ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #bdc3c7; font-size: 0.75em; text-align: center;">
            &copy; 2026 Laikipia Canteen. All rights reserved.
          </p>
        </div>
      `,
    };

    // 5. Execute
    const info = await transport.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Reset link delivered to: ${email}`);
    return !!info.messageId; 

  } catch (error: any) {
    console.error("❌ [EMAIL ERROR]:", error.message);
    return false;
  }
};

export default sendResetMail;