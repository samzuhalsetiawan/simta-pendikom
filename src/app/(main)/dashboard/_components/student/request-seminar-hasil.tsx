"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { requestSeminarHasil } from "@/lib/actions/seminar";
import { RequestSeminarHasilModal } from "@/components/Modal/request-seminar-hasil-modal";

interface RequestSeminarHasilProps {
    thesisId: string;
    disabled?: boolean;
    attendanceCount?: number;
    hasThesisTitle?: boolean;
}

export default function RequestSeminarHasil({ thesisId, disabled, attendanceCount = 0, hasThesisTitle = false }: RequestSeminarHasilProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleTriggerClick = (e: React.MouseEvent) => {
        if (!hasThesisTitle) {
            e.preventDefault();
            toast.error("kamu wajib menentukan judul skripsimu terlebih dahulu sebelum mengajukan permohonan seminar");
        } else if (attendanceCount < 3) {
            e.preventDefault();
            toast.error("kamu belum menghadiri seminar (proposal/hasil) sebanyak minimal 3 kali");
        } else {
            setIsOpen(true);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const res = await requestSeminarHasil(thesisId);
        
        if (res.error) {
            toast.error(res.error);
            setLoading(false);
        } else {
            toast.success("Permohonan seminar hasil berhasil dikirim");
            setIsOpen(false);
            setLoading(false);
        }
    };

    return (
        <>
            <Button 
                disabled={disabled || attendanceCount < 3 || !hasThesisTitle}
                onClick={handleTriggerClick}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20 gap-2 cursor-pointer"
            >
                <Send className="h-4 w-4" />
                Ajukan Permohonan Seminar Hasil
            </Button>

            <RequestSeminarHasilModal
                open={isOpen}
                onOpenChange={setIsOpen}
                onSubmit={handleSubmit}
                loading={loading}
                hasThesisTitle={hasThesisTitle}
            />
        </>
    );
}
