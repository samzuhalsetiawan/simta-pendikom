"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { GraduationCap } from "lucide-react";
import { requestPendadaran } from "@/lib/actions/seminar";
import { toast } from "sonner";
import { RequestPendadaranModal } from "@/components/Modal/request-pendadaran-modal";

interface RequestPendadaranProps {
    studentNim: string;
    disabled?: boolean;
    hasThesisTitle?: boolean;
}

export default function RequestPendadaran({ studentNim, disabled, hasThesisTitle = false }: RequestPendadaranProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setLoading(true);
        const res = await requestPendadaran(studentNim);
        
        if (res.error) {
            toast.error(res.error);
            setLoading(false);
        } else {
            toast.success("Permohonan sidang skripsi berhasil dikirim");
            setIsOpen(false);
            setLoading(false);
        }
    };

    return (
        <>
            <Button 
                disabled={disabled || !hasThesisTitle}
                onClick={(e) => {
                    if (!hasThesisTitle) {
                        e.preventDefault();
                        toast.error("Kamu wajib menentukan judul skripsimu terlebih dahulu sebelum mengajukan permohonan sidang skripsi.");
                    } else {
                        setIsOpen(true);
                    }
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20 gap-2"
            >
                <GraduationCap className="h-4 w-4" />
                Ajukan Permohonan Sidang Skripsi
            </Button>

            <RequestPendadaranModal
                open={isOpen}
                onOpenChange={setIsOpen}
                onSubmit={handleSubmit}
                loading={loading}
                hasThesisTitle={hasThesisTitle}
            />
        </>
    );
}
