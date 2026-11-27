"use client"

import { QRScannerModal, type QRScannerModalProps } from "@/components/Modal/qr-scanner-modal";

export type SeminarAttendanceModalProps = QRScannerModalProps;

/**
 * Re-export QRScannerModal as SeminarAttendanceModal.
 * Unified single QR Scanner Modal for both seminar and navbar/consultation.
 */
export const SeminarAttendanceModal = QRScannerModal;

export default QRScannerModal;
