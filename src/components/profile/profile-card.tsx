"use client"

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { Separator } from "@/components/base/separator";
import { Textarea } from "@/components/base/textarea";
import {
    Pencil, X, Check, Loader2, Mail, Phone, MapPin,
    IdCard, Lock, Eye, EyeOff, Camera,
    CheckCircle2, AlertCircle, Send, Calendar, PenTool,
    ShieldCheck
} from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import imageCompression from "browser-image-compression";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { GradientCard, type GradientCardVariant } from "@/components/shared/gradient-card";
import { SignatureModal, ProfilePhotoModal, CameraCaptureModal, CropPhotoModal } from "@/components/Modal";
import { cn } from "@/lib/utils/utils";

import {
    updateAvatar,
    updateEmail,
    updatePhoneNumber,
    updateAddress,
} from "@/lib/actions/profile";
import type { ProfileData } from "@/lib/dal/profile";
import { formatRoleBadge } from "@/lib/constants/roles";

interface ProfileCardProps {
    profile: ProfileData;
    isOwner: boolean;
    roleVariant?: "student" | "lecturer" | "staff";
    cardVariant?: GradientCardVariant;
    generationYear?: string;
    showSignature?: boolean;
}

// --- Utility: format phone number with dashes for display ---
function formatPhoneDisplay(phone: string | null): string {
    if (!phone) return "-";
    const cleaned = phone.replace(/(?!^\+)\D/g, "");
    const plusMatch = cleaned.match(/^(\+\d{1,4})/);
    if (plusMatch) {
        const prefix = plusMatch[1];
        const rest = cleaned.slice(prefix.length);
        const groups = rest.match(/.{1,4}/g) || [];
        return `${prefix} ${groups.join("-")}`;
    }
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join("-");
}

export default function ProfileCard({ profile, isOwner, roleVariant, cardVariant, generationYear, showSignature }: ProfileCardProps) {
    const router = useRouter();

    // Detect variant from roles if not provided
    const variant = roleVariant || (
        profile.roles.includes("student") ? "student" :
        profile.roles.includes("lecturer") ? "lecturer" : "staff"
    );

    const effectiveGenerationYear = generationYear || profile.studentDetails?.generation_year;

    const gradientVariant: GradientCardVariant = cardVariant || (
        variant === "student" ? "pengajuan-proposal" :
        variant === "lecturer" ? "konsultasi" : "sidang-skripsi"
    );

    // Theme tokens based on roleVariant - using semantic variables
    const theme = {
        student: {
            accentBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
            accentText: "text-primary",
            badgeClass: "bg-primary/10 text-primary border-primary/20",
            avatarBg: "bg-primary text-primary-foreground",
            cameraBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
            hoverText: "hover:text-primary",
            sliderAccent: "accent-primary",
        },
        lecturer: {
            accentBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
            accentText: "text-primary",
            badgeClass: "bg-primary/10 text-primary border-primary/20",
            avatarBg: "bg-primary text-primary-foreground",
            cameraBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
            hoverText: "hover:text-primary",
            sliderAccent: "accent-primary",
        },
        staff: {
            accentBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
            accentText: "text-primary",
            badgeClass: "bg-primary/10 text-primary border-primary/20",
            avatarBg: "bg-primary text-primary-foreground",
            cameraBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
            hoverText: "hover:text-primary",
            sliderAccent: "accent-primary",
        },
    }[variant];

    // Callback URL for verification
    const rolePath = profile.roles.includes("student")
        ? `/mahasiswa/${profile.username}`
        : profile.roles.includes("lecturer")
        ? `/dosen/${profile.username}`
        : `/staff/${profile.username}`;

    // --- Edit states ---
    const [editingField, setEditingField] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Email
    const [emailDraft, setEmailDraft] = useState(
        profile.email.endsWith("@unverified.com") ? "" : profile.email
    );
    const [isSendingVerification, setIsSendingVerification] = useState(false);

    // Phone
    const [phoneDraft, setPhoneDraft] = useState(profile.phone_number || "");

    // Address
    const [addressDraft, setAddressDraft] = useState(profile.address || "");

    // Password modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [isChangingPw, setIsChangingPw] = useState(false);

    // Image crop
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileExtension, setFileExtension] = useState("jpg");

    // Image lightbox & photo modals
    const [showLightbox, setShowLightbox] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<string>(profile.image || "/default_user_photo.png");
    const profileImage = currentPhoto;

    useEffect(() => {
        if (profile.image) {
            setCurrentPhoto(profile.image);
        }
    }, [profile.image]);

    // Signature
    const [signaturePath, setSignaturePath] = useState<string | null>(profile.signaturePath);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const shouldShowSignature = showSignature !== undefined ? showSignature : isOwner;

    // --- Handlers ---
    const startEdit = (field: string) => {
        if (!isOwner) return;
        setEditingField(field);
        if (field === "email") setEmailDraft(profile.email.endsWith("@unverified.com") ? "" : profile.email);
        if (field === "phone") setPhoneDraft(profile.phone_number || "");
        if (field === "address") setAddressDraft(profile.address || "");
    };

    const cancelEdit = () => {
        setEditingField(null);
    };

    const saveEmail = async () => {
        if (!emailDraft.trim() || !emailDraft.includes("@")) {
            return toast.error("Masukkan email yang valid.");
        }
        if (emailDraft.endsWith("@unverified.com")) {
            return toast.error("Email tidak valid.");
        }
        setIsSaving(true);
        const res = await updateEmail(profile.username, emailDraft.trim());
        if (res.error) toast.error(res.error);
        else { toast.success("Email berhasil diubah."); setEditingField(null); }
        setIsSaving(false);
    };

    const handleSendVerification = async () => {
        setIsSendingVerification(true);
        try {
            const { error } = await authClient.sendVerificationEmail({
                email: profile.email,
                callbackURL: rolePath,
            });
            if (error) {
                toast.error(error.message || "Gagal mengirim email verifikasi.");
            } else {
                toast.success("Email verifikasi telah dikirim. Cek inbox Anda.");
            }
        } catch {
            toast.error("Terjadi kesalahan saat mengirim email verifikasi.");
        }
        setIsSendingVerification(false);
    };

    const savePhone = async () => {
        setIsSaving(true);
        const phoneValue = phoneDraft.trim() || null;
        const res = await updatePhoneNumber(profile.username, phoneValue);
        if (res.error) toast.error(res.error);
        else { toast.success("Nomor HP berhasil diubah."); setEditingField(null); }
        setIsSaving(false);
    };

    const saveAddress = async () => {
        setIsSaving(true);
        const addressValue = addressDraft.trim() || null;
        const res = await updateAddress(profile.username, addressValue);
        if (res.error) toast.error(res.error);
        else { toast.success("Alamat berhasil diubah."); setEditingField(null); }
        setIsSaving(false);
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
            const { error } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: false,
            });
            if (error) {
                toast.error(error.message || "Gagal mengubah password.");
            } else {
                toast.success("Password berhasil diubah.");
                setShowPasswordModal(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            toast.error("Terjadi kesalahan.");
        }
        setIsChangingPw(false);
    };

    // --- Photo handlers ---

    const handleFileSelect = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';

        if (!['jpg', 'jpeg', 'png'].includes(ext)) {
            return toast.error("Format file tidak didukung. Gunakan JPG atau PNG.");
        }

        setFileExtension(ext === 'jpeg' ? 'jpg' : ext);

        let processedFile = file;
        if (file.size > 1024 * 1024) {
            try {
                processedFile = await imageCompression(file, {
                    maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true
                });
            } catch (error) {
                console.error("Compression error:", error);
            }
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result?.toString() || null);
            setShowPhotoModal(false);
            setIsCropping(true);
        });
        reader.readAsDataURL(processedFile);
    };

    const handleCameraCapture = (capturedDataUrl: string) => {
        setImageSrc(capturedDataUrl);
        setFileExtension("jpg");
        setShowCameraModal(false);
        setIsCropping(true);
    };

    const handleOpenLiveCamera = () => {
        setShowPhotoModal(false);
        setShowCameraModal(true);
    };

    const handleCropSave = async (croppedPixels: any) => {
        if (!imageSrc || !croppedPixels) return;
        setIsUploading(true);

        try {
            const image = new Image();
            image.src = imageSrc;
            const canvas = document.createElement('canvas');

            await new Promise((resolve) => { image.onload = resolve; });

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = croppedPixels.width;
            canvas.height = croppedPixels.height;
            ctx.drawImage(
                image,
                croppedPixels.x, croppedPixels.y,
                croppedPixels.width, croppedPixels.height,
                0, 0,
                croppedPixels.width, croppedPixels.height
            );

            const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), mimeType, 0.95);
            });

            if (!blob) {
                throw new Error("Gagal memproses gambar.");
            }

            const formData = new FormData();
            formData.append("username", profile.username);
            formData.append("file", blob, `avatar_${profile.username}.${fileExtension}`);

            const res = await updateAvatar(formData);

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Foto profil berhasil diperbarui.");
                if (res.path) {
                    setCurrentPhoto(res.path);
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("avatar-updated", { detail: res.path }));
                    }
                }
                setIsCropping(false);
                router.refresh();
            }
        } catch {
            toast.error("Gagal memproses gambar.");
        } finally {
            setIsUploading(false);
        }
    };

    // --- Inline edit helper ---
    const InlineActions = ({ onSave }: { onSave: () => void }) => (
        <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving}
                className="h-7 text-xs rounded-lg px-3 font-semibold gap-1">
                <X className="h-3 w-3" /> Batal
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}
                className={`h-7 text-xs rounded-lg px-3 font-semibold gap-1 ${theme.accentBg}`}>
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Simpan
            </Button>
        </div>
    );

    const PencilButton = ({ field }: { field: string }) => {
        if (!isOwner) return null;
        return (
            <button onClick={() => startEdit(field)}
                className={`p-1 rounded-md hover:bg-muted text-muted-foreground ${theme.hoverText} transition-colors cursor-pointer`}>
                <Pencil className="h-3 w-3" />
            </button>
        );
    };

    return (
        <>
            <GradientCard variant={gradientVariant} className="shadow-sm">
                <div className="p-6 sm:p-7 flex flex-col items-center text-center">
                    {/* Avatar with camera + click-to-zoom */}
                    <div className="relative group">
                        <button onClick={() => setShowLightbox(true)} className="cursor-pointer" aria-label="Lihat foto profil">
                            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-2 border-border/80 shadow-md">
                                <AvatarImage src={profileImage} className="object-cover" />
                                <AvatarFallback className={`${theme.avatarBg} text-3xl font-bold`}>
                                    {profile.name[0]}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => setShowPhotoModal(true)}
                                className={`absolute bottom-0.5 right-0.5 p-2 ${theme.cameraBtn} rounded-full shadow-md transition-all border-2 border-background cursor-pointer hover:scale-105`}
                                title="Ubah foto profil"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="mt-4 space-y-1">
                        <h2 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-foreground">{profile.name}</h2>
                    </div>

                    <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
                        {profile.roles.map((role) => {
                            const staffRole = profile.staffDetails?.role || (profile as any).lecturerDetails?.staff_role;
                            const badgeLabel = formatRoleBadge(role, staffRole);
                            return (
                                <Badge key={role} variant="outline" className={`${theme.badgeClass} px-2.5 py-0.5 font-semibold text-xs`}>
                                    {badgeLabel}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                <Separator className="bg-border/60" />

                <div className="p-5 sm:p-6 space-y-4">
                    {/* NIM (for student) or NIP (for lecturer/staff) */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/60 rounded-xl text-muted-foreground shrink-0">
                                <IdCard className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {variant === "student" ? "Nomor Induk Mahasiswa (NIM)" : "NIP"}
                                </p>
                                <p className="text-sm font-semibold font-mono text-foreground">{profile.username}</p>
                            </div>
                        </div>
                    </div>

                    {/* Angkatan (for student) */}
                    {effectiveGenerationYear && (
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted/60 rounded-xl text-muted-foreground shrink-0">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Angkatan</p>
                                    <p className="text-sm font-semibold text-foreground">Tahun {effectiveGenerationYear}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/60 rounded-xl text-muted-foreground shrink-0">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</p>
                                    {profile.emailVerified && (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    )}
                                    {editingField !== "email" && <PencilButton field="email" />}
                                </div>
                                {editingField === "email" ? (
                                    <div>
                                        <Input value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)}
                                            className="h-8 text-sm rounded-lg" type="email" autoFocus
                                            placeholder="Masukkan email baru" />
                                        <InlineActions onSave={saveEmail} />
                                    </div>
                                ) : (
                                    <>
                                        {profile.email.endsWith("@unverified.com") ? (
                                            <p className="text-sm font-medium text-muted-foreground italic">Email belum dikaitkan</p>
                                        ) : (
                                            <p className="text-sm font-medium truncate">{profile.email}</p>
                                        )}
                                        {!profile.emailVerified && !profile.email.endsWith("@unverified.com") && isOwner && (
                                            <div className="mt-1.5 space-y-1.5">
                                                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Email belum diverifikasi
                                                </p>
                                                <Button size="sm" variant="outline" onClick={handleSendVerification}
                                                    disabled={isSendingVerification}
                                                    className="h-7 text-[11px] rounded-lg px-3 font-semibold gap-1 border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20">
                                                    {isSendingVerification ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                                    Verifikasi Email
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/60 rounded-xl text-muted-foreground shrink-0">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nomor HP</p>
                                    {editingField !== "phone" && <PencilButton field="phone" />}
                                </div>
                                {editingField === "phone" ? (
                                    <div className="phone-input-container">
                                        <PhoneInput
                                            defaultCountry="id"
                                            value={phoneDraft}
                                            onChange={(phone) => setPhoneDraft(phone)}
                                            inputClassName="!w-full !h-9 !rounded-lg !border-border/60 !bg-transparent !text-sm text-foreground"
                                            countrySelectorStyleProps={{
                                                buttonClassName: "!h-9 !rounded-lg !border-border/60 !bg-muted/40 !px-2"
                                            }}
                                        />
                                        <InlineActions onSave={savePhone} />
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium truncate">
                                        {formatPhoneDisplay(profile.phone_number)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted/60 rounded-xl text-muted-foreground mt-0.5 shrink-0">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alamat</p>
                                    {editingField !== "address" && <PencilButton field="address" />}
                                </div>
                                {editingField === "address" ? (
                                    <div>
                                        <Textarea value={addressDraft} onChange={(e) => setAddressDraft(e.target.value)}
                                            className="min-h-[80px] text-sm rounded-lg resize-none" autoFocus
                                            placeholder="Jl. Contoh No. 123, Kota, Provinsi..." />
                                        <InlineActions onSave={saveAddress} />
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium line-clamp-3">{profile.address || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Signature (only visible to owner) */}
                    {shouldShowSignature && isOwner && (
                        <div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-muted/60 rounded-xl text-muted-foreground mt-0.5 shrink-0">
                                    <PenTool className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tanda Tangan</p>
                                        {isOwner && (
                                            <button
                                                type="button"
                                                onClick={() => setShowSignatureModal(true)}
                                                className={`p-1 rounded-md hover:bg-muted text-muted-foreground ${theme.hoverText} transition-colors cursor-pointer`}
                                                title="Ubah tanda tangan"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                    {signaturePath ? (
                                        <div 
                                            onClick={() => { if (isOwner) setShowSignatureModal(true); }}
                                            className={cn(
                                                "border border-border/60 rounded-none p-3 bg-white flex items-center justify-center max-w-[220px] transition-all",
                                                isOwner && "hover:border-primary/60 cursor-pointer"
                                            )}
                                        >
                                            <img
                                                src={signaturePath}
                                                alt="Tanda Tangan"
                                                className="max-h-16 mx-auto object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <p 
                                            onClick={() => { if (isOwner) setShowSignatureModal(true); }}
                                            className={cn(
                                                "text-sm font-medium text-muted-foreground italic",
                                                isOwner && "cursor-pointer hover:underline"
                                            )}
                                        >
                                            Belum ada tanda tangan
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Public Verified Signature Badge for Non-Owner (e.g. Dosen / Staff) */}
                    {shouldShowSignature && !isOwner && (
                        <div>
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl mt-0.5 shrink-0",
                                    (profile.hasSignature ?? !!profile.signaturePath)
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-muted/60 text-muted-foreground"
                                )}>
                                    {(profile.hasSignature ?? !!profile.signaturePath) ? (
                                        <ShieldCheck className="h-4 w-4" />
                                    ) : (
                                        <PenTool className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tanda Tangan Digital</p>
                                    {(profile.hasSignature ?? !!profile.signaturePath) ? (
                                        <div className="space-y-1">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span>Terverifikasi di Sistem</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Tanda tangan digital telah terkonfigurasi untuk pengesahan berkas ujian dan dokumen akademik.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            Belum dikonfigurasi
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password change button */}
                {isOwner && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                        <Button variant="outline" onClick={() => setShowPasswordModal(true)}
                            className="w-full h-9 text-xs font-semibold rounded-xl gap-2 border-border/60 hover:bg-muted transition-colors">
                            <Lock className="h-3.5 w-3.5" />
                            Ubah Password
                        </Button>
                    </div>
                )}
            </GradientCard>

            {/* ============= MODALS ============= */}

            {/* Lightbox (click photo to zoom) */}
            <Dialog.Root open={showLightbox} onOpenChange={setShowLightbox}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={() => setShowLightbox(false)} />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-[110] translate-x-[-50%] translate-y-[-50%] max-w-md w-full outline-none p-4">
                        <Dialog.Title className="sr-only">Foto Profil</Dialog.Title>
                        <Dialog.Description className="sr-only">Tampilan penuh foto profil</Dialog.Description>
                        <div className="relative">
                            <button onClick={() => setShowLightbox(false)}
                                className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer">
                                <X className="h-6 w-6" />
                            </button>
                            <img src={profileImage} alt={profile.name}
                                className="w-full rounded-2xl shadow-2xl object-cover aspect-[3/4] border border-white/20" />
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Image Crop Modal */}
            {isOwner && (
                <CropPhotoModal
                    open={isCropping}
                    onOpenChange={setIsCropping}
                    imageSrc={imageSrc}
                    aspect={1}
                    onCropSave={handleCropSave}
                    isUploading={isUploading}
                    roleVariant={variant}
                    cardVariant={gradientVariant}
                />
            )}

            {/* Profile Photo Modal */}
            {isOwner && (
                <ProfilePhotoModal
                    open={showPhotoModal}
                    onOpenChange={setShowPhotoModal}
                    currentPhotoUrl={currentPhoto}
                    onOpenLiveCamera={handleOpenLiveCamera}
                    onSelectFile={handleFileSelect}
                    roleVariant={variant}
                    cardVariant={gradientVariant}
                    isUploading={isUploading}
                />
            )}

            {/* Camera Capture Modal */}
            {isOwner && (
                <CameraCaptureModal
                    open={showCameraModal}
                    onOpenChange={setShowCameraModal}
                    onCapture={handleCameraCapture}
                    roleVariant={variant}
                    cardVariant={gradientVariant}
                />
            )}

            {/* Password Change Modal */}
            <Dialog.Root open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-[110] w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-card text-card-foreground border border-border shadow-2xl p-6 space-y-5">
                        <Dialog.Description className="sr-only">Formulir untuk mengganti kata sandi akun</Dialog.Description>
                        <Dialog.Title className="text-lg font-bold font-heading flex items-center gap-2">
                            <Lock className={`h-5 w-5 ${theme.accentText}`} />
                            Ubah Password
                        </Dialog.Title>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-muted-foreground">Password Saat Ini</Label>
                                <div className="relative">
                                    <Input type={showCurrentPw ? "text" : "password"} value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="pr-10 h-10 rounded-xl" />
                                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
                                        {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-muted-foreground">Password Baru</Label>
                                <div className="relative">
                                    <Input type={showNewPw ? "text" : "password"} value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pr-10 h-10 rounded-xl" />
                                    <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
                                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-muted-foreground">Konfirmasi Password Baru</Label>
                                <Input type="password" value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-10 rounded-xl" />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-destructive mt-1">Password tidak cocok.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <Button onClick={handlePasswordChange} disabled={isChangingPw || !currentPassword || !newPassword || !confirmPassword}
                                className={`flex-1 ${theme.accentBg} font-bold h-10 rounded-xl cursor-pointer`}>
                                {isChangingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                            </Button>
                            <Button variant="outline" onClick={() => setShowPasswordModal(false)}
                                className="h-10 rounded-xl px-5 font-bold cursor-pointer">
                                Batal
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Signature Modal */}
            {isOwner && (
                <SignatureModal
                    open={showSignatureModal}
                    onOpenChange={setShowSignatureModal}
                    username={profile.username}
                    signaturePath={signaturePath}
                    onSignatureChange={(newPath) => setSignaturePath(newPath)}
                    roleVariant={variant}
                    cardVariant={gradientVariant}
                />
            )}

            {/* Styles for phone input */}
            <style jsx global>{`
                .phone-input-container .react-international-phone-input {
                    background: transparent !important;
                }
                .dark .phone-input-container .react-international-phone-country-selector-dropdown {
                    background-color: hsl(var(--card)) !important;
                    border-color: hsl(var(--border)) !important;
                }
                .dark .phone-input-container .react-international-phone-country-selector-list-item {
                    color: hsl(var(--foreground)) !important;
                }
                .dark .phone-input-container .react-international-phone-country-selector-list-item:hover {
                    background-color: hsl(var(--muted)) !important;
                }
            `}</style>
        </>
    );
}
