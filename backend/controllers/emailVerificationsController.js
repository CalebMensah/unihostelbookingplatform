import jwt from "jsonwebtoken"
import pool from "../connections/db.cjs";
import nodemailer from "nodemailer";

// Create transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const verifyEmail = async (req,res) => {
try {
    const { token } = req.params;  // Get token from URL params
    console.log('Received verification request with token:', token);
    
    if (!token) {
        console.log('No token provided in request');
        return res.status(400).json({ message: "No verification token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', { email: decoded.email, userId: decoded.userId });

    // Update the user's verification status using both email and userId for extra security
    const updateResult = await pool.query(
        "UPDATE users SET is_verified = TRUE WHERE email = $1 AND id = $2 RETURNING is_verified", 
        [decoded.email, decoded.userId]
    );
    console.log('Database update result:', updateResult.rows);

    // Check if any row was updated
    if (updateResult.rowCount === 0) {
        console.log('No rows updated in database');
        return res.status(404).json({ message: "User not found or already verified" });
    }

    // Verify the update was successful
    const verificationCheck = await pool.query(
        "SELECT is_verified FROM users WHERE email = $1 AND id = $2",
        [decoded.email, decoded.userId]
    );
    console.log('Verification check result:', verificationCheck.rows);

    if (!verificationCheck.rows[0]?.is_verified) {
        console.error("Verification status not updated correctly");
        return res.status(500).json({ message: "Failed to verify email" });
    }

    console.log(`Email verified successfully for user ID ${decoded.userId}: ${decoded.email}`);
    
    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/email-verification-success`);
} catch (error) {
    console.error("Email verification error:", error);
    // Redirect to frontend error page
    res.redirect(`${process.env.FRONTEND_URL}/email-verification-error`);
}
};

export const sendResetEmail = async (email, token) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const mailOptions = {
            from: `"Support Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request",
            html: `
                <h3>Password Reset Request</h3>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p>This link is valid for 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Reset email sent to:", email);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Could not send reset email.");
    }
};

export const checkEmailVerification = async (req, res) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "No authorization token provided" });
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid authorization format" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Checking verification status for user:', decoded.id);

        const result = await pool.query(
            "SELECT is_verified FROM users WHERE id = $1",
            [decoded.id]
        );

        if (!result.rows[0]) {
            console.log('User not found:', decoded.id);
            return res.status(404).json({ message: "User not found" });
        }

        const isVerified = result.rows[0].is_verified === true;
        console.log('Verification status:', isVerified);

        res.json({ isVerified });
    } catch (error) {
        console.error("Error checking email verification:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Server error checking verification status" });
    }
};

// Function to send emails
export const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Hostel Booking" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};

export const requestVerificationEmail = async (req, res) => {
  try {
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get user's email and check current verification status
    const userResult = await pool.query("SELECT email, is_verified FROM users WHERE id = $1", [userId]);
    if (!userResult.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    const { email, is_verified } = userResult.rows[0];

    if (is_verified) {
      return res.status(400).json({ 
        message: "Email is already verified",
        redirectUrl: `${process.env.FRONTEND_URL}/email-verification-success`
      });
    }

    // Generate verification token with both email and userId
    const verificationToken = jwt.sign({ email, userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log('Generated verification token with data:', { email, userId });

    // Create verification link - ensure no double slashes
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash if present
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;
    
    console.log('Generated verification link:', verificationLink);

    await transporter.sendMail({
      from: `"Hostel Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h3>Email Verification</h3>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    console.log(`Verification email sent to: ${email}`);
    res.json({ 
      message: "Verification email sent successfully. Please check your email to complete verification.",
      email: email
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    res.status(500).json({ message: "Failed to send verification email" });
  }
};