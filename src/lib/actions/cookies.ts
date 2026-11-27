"use server"

import { cookies } from "next/headers"

const ROLE_COOKIE_NAME = "simta_active_role"

export async function setActiveRoleCookie(role: string) {
    const cookieStore = await cookies()
    cookieStore.set(ROLE_COOKIE_NAME, role, { 
        path: "/", 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30 // 30 days
    })
}

export async function getActiveRoleCookie() {
    const cookieStore = await cookies()
    return cookieStore.get(ROLE_COOKIE_NAME)?.value || null
}

export async function clearActiveRoleCookie() {
    const cookieStore = await cookies()
    cookieStore.delete(ROLE_COOKIE_NAME)
}
