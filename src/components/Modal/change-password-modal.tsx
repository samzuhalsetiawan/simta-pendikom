"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ChangePasswordModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmitCustom?: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
    inline?: boolean;
}

export function ChangePasswordModal({
    open = false,
    onOpenChange = () => {},
    onSubmitCustom,
    inline = false
}: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [isChangingPw, setIsChangingPw] = useState(false);

    const resetFields = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            return toast.error("Password baru dan konfirmasi tidak sama.");
        }
        if (newPassword.length < 8) {
            return toast.error("Password baru minimal 8 karakter.");
        }

        setIsChangingPw(true);
        try {
            if (onSubmitCustom) {
                await onSubmitCustom({ currentPassword, newPassword });
                resetFields();
                onOpenChange(false);
                return;
            }

            const { error } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: false,
            });
            if (error) {
                toast.error(error.message || "Gagal mengubah password.");
            } else {
                toast.success("Password berhasil diubah.");
                onOpenChange(false);
                resetFields();
            }
        } catch {
            toast.error("Terjadi kesalahan sistem saat mengubah password.");
        } finally {
            setIsChangingPw(false);
        }
    };

    const modalInner = (
        <GradientCard variant="primary" rounded="bottom" className="w-full max-w-sm shadow-2xl border-0 text-left">
            <GradientCardHeader variant="primary" rounded="none" className="p-5 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Lock className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["primary"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Ubah Password</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Perbarui kata sandi akun Anda</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => { resetFields(); onOpenChange(false); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <div className="p-6 space-y-4">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Password Saat Ini</Label>
                        <div className="relative">
                            <Input
                                type={showCurrentPw ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="pl-3 pr-9 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPw(!showCurrentPw)}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Password Baru</Label>
                        <div className="relative">
                            <Input
                                type={showNewPw ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pl-3 pr-9 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                                placeholder="Minimal 8 karakter"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPw(!showNewPw)}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">Konfirmasi Password Baru</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                            placeholder="Ulangi password baru"
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-destructive mt-1">Password tidak cocok.</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => { resetFields(); onOpenChange(false); }}
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={isChangingPw || !currentPassword || !newPassword || !confirmPassword}
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        {isChangingPw && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Simpan
                    </Button>
                </div>
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetFields(); onOpenChange(val); }}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-sm focus:outline-none">
                <DialogTitle className="sr-only">Ubah Password</DialogTitle>
                <DialogDescription className="sr-only">Perbarui kata sandi akun Anda</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
