"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { InfoList } from "@/components/ui/info-list";
import type { InfoItem } from "@/components/ui/info-list";
import { updateProposal } from "@/lib/actions/proposal";
import { updateThesisData } from "@/lib/actions/thesis";
import { Button } from "@/components/base/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/base/select"
import { 
    GradientCard, 
    GradientCardHeader, 
    GradientCardTitle, 
    GradientCardDescription,
    type GradientCardVariant
} from "@/components/shared/gradient-card"
import type { DocumentInfoCardData } from "@/lib/dal/proposal";

export interface ProposalInfoCardClientProps {
    documentData: DocumentInfoCardData;
    type?: "proposal" | "thesis";
    footerNode?: React.ReactNode;
    isEditable?: boolean;
    variant?: GradientCardVariant;
}

export function ProposalOrThesisInfoCardClient({ 
    documentData, 
    type = "proposal",
    footerNode, 
    isEditable = false,
    variant
}: ProposalInfoCardClientProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(documentData.title || "");
    const [optimisticTitle, setOptimisticTitle] = useState(documentData.title);

    const [isEditingType, setIsEditingType] = useState(false);
    const [editedType, setEditedType] = useState(documentData.research_type || "");
    const [optimisticType, setOptimisticType] = useState(documentData.research_type);

    const [isEditingMethod, setIsEditingMethod] = useState(false);
    const [editedMethod, setEditedMethod] = useState(documentData.research_method || "");
    const [optimisticMethod, setOptimisticMethod] = useState(documentData.research_method);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setOptimisticTitle(documentData.title);
        setEditedTitle(documentData.title || "");
        
        setOptimisticType(documentData.research_type);
        setEditedType(documentData.research_type || "");

        setOptimisticMethod(documentData.research_method);
        setEditedMethod(documentData.research_method || "");
    }, [documentData.title, documentData.research_type, documentData.research_method]);

    const handleSave = async (field: 'title' | 'research_type' | 'research_method') => {
        if (type === "proposal" && !documentData.id) return;
        if (type === "thesis" && !documentData.nim) return;
        
        setIsSaving(true);
        let res: any = null;

        if (type === "proposal") {
            const formData = new FormData();
            if (field === 'title') {
                formData.append("title", editedTitle);
                setOptimisticTitle(editedTitle);
                setIsEditingTitle(false);
            } else if (field === 'research_type') {
                formData.append("research_type", editedType);
                setOptimisticType(editedType);
                setIsEditingType(false);
            } else if (field === 'research_method') {
                formData.append("research_method", editedMethod);
                setOptimisticMethod(editedMethod);
                setIsEditingMethod(false);
            }
            res = await updateProposal(documentData.id!, formData);
        } else {
            // type === "thesis"
            const dataToUpdate = {
                title: field === 'title' ? editedTitle : (documentData.title || ""),
                research_type: field === 'research_type' ? editedType : (documentData.research_type || ""),
                research_method: field === 'research_method' ? editedMethod : (documentData.research_method || "")
            };
            
            if (field === 'title') {
                setOptimisticTitle(editedTitle);
                setIsEditingTitle(false);
            } else if (field === 'research_type') {
                setOptimisticType(editedType);
                setIsEditingType(false);
            } else if (field === 'research_method') {
                setOptimisticMethod(editedMethod);
                setIsEditingMethod(false);
            }
            res = await updateThesisData(documentData.nim!, dataToUpdate);
        }
        setIsSaving(false);
        if (res?.error) {
            toast.error(res.error);
            if (field === 'title') {
                setOptimisticTitle(documentData.title);
                setEditedTitle(documentData.title || "");
            } else if (field === 'research_type') {
                setOptimisticType(documentData.research_type);
                setEditedType(documentData.research_type || "");
            } else if (field === 'research_method') {
                setOptimisticMethod(documentData.research_method);
                setEditedMethod(documentData.research_method || "");
            }
        } else {
            toast.success("Perubahan berhasil diperbarui");
            router.refresh();
        }
    };

    const handleCancel = (field: 'title' | 'research_type' | 'research_method') => {
        if (field === 'title') {
            setIsEditingTitle(false);
            setEditedTitle(documentData.title || "");
        } else if (field === 'research_type') {
            setIsEditingType(false);
            setEditedType(documentData.research_type || "");
        } else if (field === 'research_method') {
            setIsEditingMethod(false);
            setEditedMethod(documentData.research_method || "");
        }
    };

    const renderTitle = () => {
        if (isEditingTitle) {
            return (
                <div className="w-full space-y-3 mt-0.5">
                    <input 
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full bg-transparent border-b border-primary/50 focus:border-primary outline-none text-sm font-semibold py-1 transition-colors"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && editedTitle !== (documentData.title || "")) {
                                handleSave('title');
                            } else if (e.key === 'Escape') {
                                handleCancel('title');
                            }
                        }}
                    />
                    {editedTitle !== (documentData.title || "") && (
                        <div className="flex gap-2 items-center pb-1">
                            <Button size="sm" variant="outline" onClick={() => handleCancel('title')} disabled={isSaving} className="h-7 text-xs font-semibold px-3">Batal</Button>
                            <Button size="sm" onClick={() => handleSave('title')} disabled={isSaving || !editedTitle.trim()} className="h-7 text-xs font-semibold px-3">
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null} Simpan
                            </Button>
                        </div>
                    )}
                </div>
            );
        }
        const titleContent = optimisticTitle || <span className="text-muted-foreground/50 italic">Belum ada judul</span>;
        
        const documentUrl = `/${type === 'thesis' ? 'skripsi' : 'proposal'}/${documentData.id}`;
        const isDetailPage = pathname === documentUrl;
        
        const innerContent = (!isDetailPage && documentData.id && !isEditable) ? (
            <Link href={documentUrl} className="text-primary hover:underline block" onClick={(e) => isEditable && e.stopPropagation()}>
                {titleContent}
            </Link>
        ) : (
            <span className="block">{titleContent}</span>
        );
        
        return (
            <div className={`w-full group ${isEditable ? 'cursor-text' : ''}`} onClick={() => { if (isEditable) setIsEditingTitle(true); }}>
                <div className={`w-full border-b border-transparent ${isEditable ? 'hover:border-border transition-colors pb-1' : ''}`}>
                    {innerContent}
                </div>
            </div>
        );
    };

    const renderResearchType = () => {
        if (isEditable) {
            return (
                <div className="w-full space-y-3">
                    <Select value={editedType} onValueChange={(val) => {
                        setEditedType(val);
                    }}>
                        <SelectTrigger className="w-full h-auto py-0 px-0 text-sm border-none bg-transparent shadow-none focus:ring-0 hover:bg-transparent capitalize font-semibold cursor-pointer">
                            <SelectValue placeholder={<span className="italic text-muted-foreground/50 font-normal">Pilih Jenis Penelitian</span>} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kualitatif">Kualitatif</SelectItem>
                            <SelectItem value="kuantitatif">Kuantitatif</SelectItem>
                            <SelectItem value="campuran">Campuran</SelectItem>
                            <SelectItem value="pengembangan">Pengembangan</SelectItem>
                        </SelectContent>
                    </Select>
                    {editedType !== (documentData.research_type || "") && (
                        <div className="flex gap-2 items-center pb-1">
                            <Button size="sm" variant="outline" onClick={() => handleCancel('research_type')} disabled={isSaving} className="h-7 text-xs font-semibold px-3">Batal</Button>
                            <Button size="sm" onClick={() => handleSave('research_type')} disabled={isSaving || !editedType} className="h-7 text-xs font-semibold px-3">
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null} Simpan
                            </Button>
                        </div>
                    )}
                </div>
            );
        }
        
        const content = optimisticType || <span className="text-muted-foreground/50 italic capitalize">Belum ada jenis penelitian</span>;
        return (
            <div className="w-full">
                <span className="block capitalize">{content}</span>
            </div>
        );
    };

    const renderResearchMethod = () => {
        if (isEditingMethod) {
            return (
                <div className="w-full space-y-3 mt-0.5">
                    <input 
                        type="text"
                        value={editedMethod}
                        onChange={(e) => setEditedMethod(e.target.value)}
                        className="w-full bg-transparent border-b border-primary/50 focus:border-primary outline-none text-sm font-semibold py-1 transition-colors"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && editedMethod !== (documentData.research_method || "")) {
                                handleSave('research_method');
                            } else if (e.key === 'Escape') {
                                handleCancel('research_method');
                            }
                        }}
                    />
                    {editedMethod !== (documentData.research_method || "") && (
                        <div className="flex gap-2 items-center pb-1">
                            <Button size="sm" variant="outline" onClick={() => handleCancel('research_method')} disabled={isSaving} className="h-7 text-xs font-semibold px-3">Batal</Button>
                            <Button size="sm" onClick={() => handleSave('research_method')} disabled={isSaving || !editedMethod.trim()} className="h-7 text-xs font-semibold px-3">
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null} Simpan
                            </Button>
                        </div>
                    )}
                </div>
            );
        }
        const content = optimisticMethod || <span className="text-muted-foreground/50 italic capitalize">Belum ada metode penelitian</span>;
        return (
            <div className={`w-full group ${isEditable ? 'cursor-text' : ''}`} onClick={() => { if (isEditable) setIsEditingMethod(true); }}>
                <div className={`w-full border-b border-transparent ${isEditable ? 'hover:border-border transition-colors pb-1' : ''}`}>
                    <span className="block capitalize">{content}</span>
                </div>
            </div>
        );
    };

    const items: InfoItem[] = [
        {
            label: type === "proposal" ? "Judul Proposal" : "Judul Skripsi",
            value: renderTitle(),
            valueClassName: "text-sm font-semibold max-w-full"
        },
        {
            label: "Jenis Penelitian",
            value: renderResearchType(),
            valueClassName: "text-sm"
        },
        {
            label: "Metode Penelitian",
            value: renderResearchMethod(),
            valueClassName: "text-sm"
        }
    ];

    if (documentData.approval_status) {
        items.push({
            label: "Status",
            value: documentData.approval_status === 'approved' ? 'Disetujui' :
                   documentData.approval_status === 'pending' ? 'Permintaan Persetujuan' : 'Belum disetujui',
            valueClassName: `text-sm font-semibold capitalize ${
                documentData.approval_status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' :
                documentData.approval_status === 'pending' ? 'text-amber-600 dark:text-amber-400' :
                'text-rose-600 dark:text-rose-400'
            }`
        });
    }

    const defaultSubtitle = documentData.updated_at 
        ? `Terakhir diubah: ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(documentData.updated_at))}` 
        : (type === "proposal" ? "Detail proposal tugas akhir" : "Detail skripsi tugas akhir");

    return (
        <GradientCard variant={variant}>
            <GradientCardHeader variant={variant}>
                <div>
                    <GradientCardTitle>{type === "proposal" ? "Informasi Proposal" : "Informasi Skripsi"}</GradientCardTitle>
                    <GradientCardDescription>{defaultSubtitle}</GradientCardDescription>
                </div>
            </GradientCardHeader>
            <div className="p-5 flex flex-col gap-4">
                <div className="space-y-4">
                    <InfoList items={items} />
                </div>
                {footerNode && (
                    <div className="pt-4 border-t border-border/50">
                        {footerNode}
                    </div>
                )}
            </div>
        </GradientCard>
    );
}
