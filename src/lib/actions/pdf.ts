"use server"

import { getApprovalPDFData, getInvitationPDFData } from "@/lib/dal/pdf";
import type { EventType, ApprovalPDFData, InvitationPDFData } from "@/lib/dal/pdf";

export async function fetchPDFData(thesisId: string, eventType: EventType): Promise<{ data?: ApprovalPDFData; error?: string }> {
    return getApprovalPDFData(thesisId, eventType);
}

export async function fetchInvitationPDFData(
    seminarId: string,
    eventType: EventType,
    lecturerNip: string
): Promise<{ data?: InvitationPDFData; error?: string }> {
    return getInvitationPDFData(seminarId, eventType, lecturerNip);
}
