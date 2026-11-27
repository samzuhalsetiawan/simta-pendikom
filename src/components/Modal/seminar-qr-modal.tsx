"use client"

import React, { useState, useEffect } from "react";
import { QRCodeModal, type QRCodeModalProps } from "@/components/Modal/qr-code-modal";
import { getQrTokenAction } from "@/lib/actions/seminar";

import { useRealtimeEvent } from "@/components/provider/realtime-provider";

export interface SeminarQRModalProps extends Omit<QRCodeModalProps, 'type'> {
    seminarId?: string | number;
    type?: 'proposal' | 'hasil';
}

/**
 * Seminar QR Modal
 * Uses unified QRCodeModal and passes `token` prop.
 * If token is not passed, fetches token once upon opening and listens to realtime SSE updates.
 */
export function SeminarQRModal({
    open = false,
    onOpenChange,
    token: propToken,
    seminarId,
    type = 'proposal',
    inline = false,
    ...rest
}: SeminarQRModalProps) {
    const [fetchedToken, setFetchedToken] = useState<string | null>(null);
    const [loadingToken, setLoadingToken] = useState(false);

    const token = propToken ?? fetchedToken;

    // Realtime update via Global SSE instead of interval polling
    useRealtimeEvent<{ seminarId: string; token: string }>(
        "seminar:token-updated",
        (data) => {
            if (seminarId && String(data.seminarId) === String(seminarId) && data.token) {
                setFetchedToken(data.token);
            }
        },
        [seminarId]
    );

    useEffect(() => {
        if (propToken !== undefined || (!open && !inline)) return;
        if (!seminarId) return;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(seminarId));
        if (!isUuid) {
            setFetchedToken("simta-preview-seminar-token");
            return;
        }

        let isMounted = true;

        const fetchToken = async () => {
            try {
                setLoadingToken(true);
                const newToken = await getQrTokenAction(String(seminarId), type);
                if (isMounted && newToken) {
                    setFetchedToken(newToken);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setLoadingToken(false);
            }
        };

        fetchToken();

        return () => {
            isMounted = false;
        };
    }, [open, inline, seminarId, type, propToken]);

    return (
        <QRCodeModal
            open={open}
            onOpenChange={onOpenChange}
            token={token}
            type={type}
            seminarId={seminarId}
            inline={inline}
            loading={rest.loading || loadingToken}
            title={rest.title || "QR Code Seminar"}
            description={rest.description || "Tampilkan kode ini untuk dipindai audiens"}
            {...rest}
        />
    );
}

export default SeminarQRModal;
