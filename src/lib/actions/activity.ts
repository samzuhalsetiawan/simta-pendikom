"use server";

import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { ActivityCategory, ActivityDescription } from "@/lib/constants/activities";

/**
 * Logs a student activity to the database.
 * 
 * @param studentNim The student's NIM (foreign key).
 * @param category The activity category.
 * @param description The specific activity description, strongly typed based on the category.
 */
export async function logStudentActivity<T extends ActivityCategory>(
    studentNim: string,
    category: T,
    description: ActivityDescription<T>
) {
    const id = uuidv4();
    try {
        await db.execute(
            `INSERT INTO student_activity_logs (id, student_nim, activity_category, description)
             VALUES (?, ?, ?, ?)`,
            [id, studentNim, category, description]
        );
        return { success: true };
    } catch (error) {
        console.error("Error logging student activity:", error);
        // We return success: false instead of throwing to prevent breaking the main transaction/action
        return { success: false, error };
    }
}

/**
 * Fetches the recent activity logs for a student and calculates their current Health Score.
 * Health score decays exponentially up to 30 days.
 * 
 * @param studentNim The student's NIM.
 * @returns Object containing the score and recent logs.
 */
export async function getStudentActivityStatus(studentNim: string) {
    try {
        // Fetch the 10 most recent logs
        const [rows] = await db.execute(
            `SELECT id, activity_category, description, created_at 
             FROM student_activity_logs 
             WHERE student_nim = ? 
             ORDER BY created_at DESC 
             LIMIT 10`,
            [studentNim]
        ) as any[];

        if (!rows || rows.length === 0) {
            // No activity yet -> Score 0
            return {
                score: 0,
                recentLogs: [],
                lastActiveAt: null
            };
        }

        const latestLog = rows[0];
        const lastActiveDate = new Date(latestLog.created_at);
        const now = new Date();
        
        // Calculate days difference
        const timeDiff = now.getTime() - lastActiveDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        // Calculate score (drops to 0 in ~30 days)
        // Score = Math.max(0, 100 - (daysDiff^2 / 9))
        let score = 100;
        if (daysDiff > 0) {
            score = 100 - (Math.pow(daysDiff, 2) / 9);
        }
        
        score = Math.max(0, Math.floor(score));

        return {
            score,
            recentLogs: rows,
            lastActiveAt: latestLog.created_at
        };
    } catch (error) {
        console.error("Error fetching student activity status:", error);
        return {
            score: 0,
            recentLogs: [],
            lastActiveAt: null,
            error
        };
    }
}
