import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export const auth = betterAuth({
    trustedOrigins: [
        "http://localhost:3000",
        "http://10.32.180.24:3000",
        "http://10.32.178.6:3000",
        "https://*.trycloudflare.com",
        "https://simta-pendikom.vercel.app"
    ],
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await resend.emails.send({
                from: "SIMTA Pendikom <onboarding@resend.dev>",
                to: user.email,
                subject: "Reset Password — SIMTA Pendikom",
                html: `
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                        <h2 style="color: #2563eb;">Reset Password</h2>
                        <p>Halo <strong>${user.name}</strong>,</p>
                        <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk membuat password baru:</p>
                        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Reset Password</a>
                        <p style="font-size: 12px; color: #6b7280;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="font-size: 11px; color: #9ca3af;">SIMTA Pendikom — Sistem Informasi Manajemen Tugas Akhir</p>
                    </div>
                `,
            });
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
            await resend.emails.send({
                from: "SIMTA Pendikom <onboarding@resend.dev>",
                to: user.email,
                subject: "Verifikasi Email — SIMTA Pendikom",
                html: `
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                        <h2 style="color: #2563eb;">Verifikasi Email</h2>
                        <p>Halo <strong>${user.name}</strong>,</p>
                        <p>Klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
                        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Verifikasi Email</a>
                        <p style="font-size: 12px; color: #6b7280;">Jika Anda tidak meminta verifikasi ini, abaikan email ini.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="font-size: 11px; color: #9ca3af;">SIMTA Pendikom — Sistem Informasi Manajemen Tugas Akhir</p>
                    </div>
                `,
            });
        },
        sendOnSignUp: false,
        autoSignInAfterVerification: true,
    },
    socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID ? {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            }
        } : {}),
        ...(process.env.LINKEDIN_CLIENT_ID ? {
            linkedin: {
                clientId: process.env.LINKEDIN_CLIENT_ID,
                clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
            }
        } : {}),
    },
    plugins: [
        username()
    ],
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ user, newEmail, url }) => {
                await resend.emails.send({
                    from: "SIMTA Pendikom <onboarding@resend.dev>",
                    to: newEmail,
                    subject: "Verifikasi Email Baru — SIMTA Pendikom",
                    html: `
                        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                            <h2 style="color: #2563eb;">Verifikasi Email Baru</h2>
                            <p>Halo <strong>${user.name}</strong>,</p>
                            <p>Klik tombol di bawah ini untuk memverifikasi email baru Anda:</p>
                            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Verifikasi Email</a>
                            <p style="font-size: 12px; color: #6b7280;">Jika Anda tidak meminta perubahan email, abaikan email ini.</p>
                        </div>
                    `,
                });
            },
        },
        additionalFields: {
            username: { type: "string" },
            role: { type: "string" },
            signature: { type: "string", required: false },
        },
    },
});
