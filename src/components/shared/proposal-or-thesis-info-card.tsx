import React from "react";
import { getProposalInfoCardData } from "@/lib/dal/proposal";
import { getThesisInfoCardData } from "@/lib/dal/thesis";
import { ProposalOrThesisInfoCardClient } from "./proposal-or-thesis-info-card-client";
import type { GradientCardVariant } from "@/components/shared/gradient-card";

export interface ProposalOrThesisInfoCardProps {
    documentId: string;
    type?: "proposal" | "thesis";
    footerNode?: React.ReactNode;
    isEditable?: boolean;
    variant?: GradientCardVariant;
}

export async function ProposalOrThesisInfoCard({
    documentId,
    type = "proposal",
    footerNode,
    isEditable = false,
    variant
}: ProposalOrThesisInfoCardProps) {
    let documentData = null;

    if (!documentId) return null;

    if (type === "proposal") {
        documentData = await getProposalInfoCardData(documentId);
    } else {
        documentData = await getThesisInfoCardData(documentId);
    }

    if (!documentData) return null;

    return (
        <ProposalOrThesisInfoCardClient 
            documentData={documentData}
            type={type}
            footerNode={footerNode}
            isEditable={isEditable}
            variant={variant}
        />
    );
}
