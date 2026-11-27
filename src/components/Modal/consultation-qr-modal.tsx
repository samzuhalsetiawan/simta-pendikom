"use client"

import { QRCodeModal, type QRCodeModalProps } from "@/components/Modal/qr-code-modal";

export type ConsultationQRModalProps = QRCodeModalProps;

/**
 * Re-export unified QRCodeModal as ConsultationQRModal.
 * Accepts `token` prop and generates QR code from received token.
 */
export const ConsultationQRModal = QRCodeModal;

export default QRCodeModal;
