"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles,
    type GradientCardVariant
} from "@/components/shared/gradient-card";
import { getGradeFromScore } from "@/lib/utils/scoring";
import { submitLecturerScore } from "@/lib/actions/seminar";
import { toast } from "sonner";
import { Loader2, Plus, PenSquare, Award, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export interface ScoreAssessmentModalProps {
    seminarId?: string;
    type?: 'proposal' | 'hasil' | 'pendadaran';
    currentScore?: number | null;
    studentName?: string;
    thesisTitle?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSaveSuccess?: (score: number) => void;
    inline?: boolean;
}

export function ScoreAssessmentModal({
    seminarId = "sample-id",
    type = "proposal",
    currentScore = null,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onSaveSuccess,
    inline = false
}: ScoreAssessmentModalProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (setControlledOpen || (() => {})) : setInternalOpen;

    const [score, setScore] = React.useState<number>(currentScore ?? 85);
    const [loading, setLoading] = React.useState(false);

    const variant: GradientCardVariant =
        type === 'pendadaran' ? 'sidang-skripsi' : type === 'hasil' ? 'seminar-hasil' : 'seminar-proposal';

    React.useEffect(() => {
        if (open || inline) {
            setScore(currentScore ?? 85);
        }
    }, [open, currentScore, inline]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (onSaveSuccess) {
                onSaveSuccess(score);
                toast.success(`Berhasil menyimpan penilaian (${score} - ${getGradeFromScore(score)}).`);
                setOpen(false);
                return;
            }

            const res = await submitLecturerScore(seminarId, type, score);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Berhasil menyimpan penilaian.");
                setOpen(false);
            }
        } catch (e: any) {
            toast.error(e.message || "Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    const grade = getGradeFromScore(score);

    const modalInner = (
        <GradientCard variant={variant} rounded="bottom" className="w-full max-w-[425px] shadow-2xl border-0 text-left">
            <GradientCardHeader variant={variant} rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <Award className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles[variant])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>{type === 'pendadaran' ? 'Penilaian Sidang Skripsi' : 'Penilaian Seminar'}</GradientCardTitle>
                        <GradientCardDescription>Geser slider untuk menentukan skor akhir</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <div className="p-6 space-y-6">
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                    <div className="text-[4.5rem] leading-none font-extrabold tracking-tighter text-primary">
                        {grade}
                    </div>
                    <div className="text-xl font-bold text-muted-foreground">
                        Skor: <span className="text-foreground">{score}</span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground pt-1 flex flex-wrap justify-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-muted">0: E</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted">1-60: D</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted">61-70: C</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted">71-80: B</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted">81-100: A</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs font-bold text-muted-foreground px-0.5">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                        Simpan Nilai
                    </Button>
                </div>
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    {currentScore !== null ? (
                        <button className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1 cursor-pointer hover:bg-emerald-500/20 transition-colors group">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Nilai: {currentScore}
                            </span>
                            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 border-l border-emerald-500/30 pl-2 group-hover:text-emerald-800 transition-colors">
                                {getGradeFromScore(currentScore)}
                            </span>
                            <PenSquare className="w-3.5 h-3.5 ml-1 text-emerald-600 opacity-50 group-hover:opacity-100" />
                        </button>
                    ) : (
                        <Button size="sm" className="rounded-full h-8 text-xs font-bold px-4 gap-1.5 shadow-sm cursor-pointer">
                            <Plus className="w-3.5 h-3.5" />
                            Beri Nilai
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-[425px] focus:outline-none">
                <DialogTitle className="sr-only">Penilaian Seminar</DialogTitle>
                <DialogDescription className="sr-only">Formulir input dan penilaian seminar atau sidang mahasiswa</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}

export { ScoreAssessmentModal as ScoreAssessmentDialog };
