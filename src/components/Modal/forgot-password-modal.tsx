"use client";

import React, { useState } from "react";
import { Mail, Loader2, X, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { authClient } from "@/lib/auth-client";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ForgotPasswordModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSendSuccess?: (email: string) => void;
    inline?: boolean;
}

export function ForgotPasswordModal({
    open = false,
    onOpenChange = () => {},
    onSendSuccess,
    inline = false
}: ForgotPasswordModalProps) {
    const [forgotEmail, setForgotEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async () => {
        if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
            setError("Masukkan email yang valid.");
            return;
        }

        setIsSendingReset(true);
        setError(null);
        try {
            if (onSendSuccess) {
                await onSendSuccess(forgotEmail);
                setResetSent(true);
                return;
            }

            const { error } = await authClient.requestPasswordReset({
                email: forgotEmail,
                redirectTo: "/reset-password",
            });
            if (error) {
                setError(error.message || "Gagal mengirim link reset password.");
            } else {
                setResetSent(true);
            }
        } catch {
            setError("Terjadi kesalahan saat mengirim email.");
        } finally {
            setIsSendingReset(false);
        }
    };

    const handleClose = (newOpen: boolean) => {
        if (!newOpen) {
            setResetSent(false);
            setError(null);
            setForgotEmail("");
        }
        onOpenChange(newOpen);
    };

    const modalInner = (
        <GradientCard variant="primary" rounded="bottom" className="w-full max-w-sm shadow-2xl border-0 text-left">
            <GradientCardHeader variant="primary" rounded="none" className="p-5 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    {resetSent ? (
                        <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-500" />
                    ) : (
                        <Mail className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["primary"])} />
                    )}
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">
                            {resetSent ? "Email Terkirim" : "Lupa Password"}
                        </GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">
                            {resetSent ? "Instruksi pemulihan dikirim" : "Kirim tautan reset akun"}
                        </GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => handleClose(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <div className="p-6 space-y-4">
                {resetSent ? (
                    <div className="space-y-4 text-center">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Link reset password telah dikirim ke <strong className="text-foreground">{forgotEmail}</strong>. Silakan cek kotak masuk atau folder spam Anda.
                        </p>
                        <Button
                            type="button"
                            onClick={() => handleClose(false)}
                            className="w-full h-10 rounded-xl font-bold cursor-pointer text-xs"
                        >
                            Kembali ke Login
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang password akun Anda.
                        </p>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Email Terdaftar</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="contoh@email.com"
                                    className="pl-9 pr-3 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleClose(false)}
                                className="rounded-xl font-bold cursor-pointer text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleReset}
                                disabled={isSendingReset || !forgotEmail.trim()}
                                className="rounded-xl font-bold cursor-pointer text-xs"
                            >
                                {isSendingReset && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                                Kirim Link Reset
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-sm focus:outline-none">
                <DialogTitle className="sr-only">Lupa Password</DialogTitle>
                <DialogDescription className="sr-only">Kirim tautan reset kata sandi ke email Anda</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
