"use client"

import { useState, useMemo } from "react"
import { TrendingUp, User, BookOpen, Filter, ArrowUpDown, Search } from "lucide-react"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import { Checkbox } from "@/components/base/checkbox"
import { Label } from "@/components/base/label"
import { Input } from "@/components/base/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/base/dialog"
import { StudentThesisData } from "@/lib/dal/lecturer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Button } from "@/components/base/button"
import { GENERATION_COLORS } from "@/lib/constants/colors"
import { cva } from "class-variance-authority"

interface PipelineStats {
    pengajuan_proposal?: number;
    seminar_proposal?: number;
    penelitian?: number;
    seminar_hasil?: number;
    pendadaran?: number;
    lulus?: number;
    [key: string]: number | undefined;
}

interface Props {
    stats?: PipelineStats;
    students?: StudentThesisData[];
    title: string;
    description: string;
    icon?: React.ReactNode;
}

const stepTextVariants = cva(
    "text-xl sm:text-3xl font-heading font-extrabold",
    {
        variants: {
            stepType: {
                pengajuan_proposal: "text-pengajuan-proposal",
                seminar_proposal: "text-seminar-proposal",
                penelitian: "text-penelitian",
                seminar_hasil: "text-seminar-hasil",
                pendadaran: "text-sidang-skripsi",
                lulus: "text-lulus",
                default: "text-muted-foreground"
            }
        },
        defaultVariants: { stepType: "default" }
    }
);

const stepLabelVariants = cva(
    "text-[9px] sm:text-[11px] font-medium text-center mt-1 sm:mt-2 leading-tight break-words",
    {
        variants: {
            stepType: {
                pengajuan_proposal: "text-pengajuan-proposal",
                seminar_proposal: "text-seminar-proposal",
                penelitian: "text-penelitian",
                seminar_hasil: "text-seminar-hasil",
                pendadaran: "text-sidang-skripsi",
                lulus: "text-lulus",
                default: "text-muted-foreground"
            }
        },
        defaultVariants: { stepType: "default" }
    }
);

const stepBadgeVariants = cva(
    "text-[10px] font-bold px-2 py-0.5 border rounded-md shrink-0",
    {
        variants: {
            stepType: {
                pengajuan_proposal: "bg-pengajuan-proposal/10 border-pengajuan-proposal/20 text-pengajuan-proposal",
                seminar_proposal: "bg-seminar-proposal/10 border-seminar-proposal/20 text-seminar-proposal",
                penelitian: "bg-penelitian/10 border-penelitian/20 text-penelitian",
                seminar_hasil: "bg-seminar-hasil/10 border-seminar-hasil/20 text-seminar-hasil",
                pendadaran: "bg-sidang-skripsi/10 border-sidang-skripsi/20 text-sidang-skripsi",
                lulus: "bg-lulus/10 border-lulus/20 text-lulus",
                default: "bg-muted border-border text-muted-foreground"
            }
        },
        defaultVariants: { stepType: "default" }
    }
);

const stepProgressVariants = cva(
    "absolute inset-y-0 left-0 transition-all duration-1000 z-0",
    {
        variants: {
            stepType: {
                pengajuan_proposal: "bg-pengajuan-proposal/20",
                seminar_proposal: "bg-seminar-proposal/20",
                penelitian: "bg-penelitian/20",
                seminar_hasil: "bg-seminar-hasil/20",
                pendadaran: "bg-sidang-skripsi/20",
                lulus: "bg-lulus/20",
                default: "bg-muted/20"
            }
        },
        defaultVariants: { stepType: "default" }
    }
);

const STEPS = [
    { label: "Pengajuan Proposal", step: 'pengajuan_proposal' },
    { label: "Seminar Proposal", step: 'seminar_proposal' },
    { label: "Penelitian", step: 'penelitian' },
    { label: "Seminar Hasil", step: 'seminar_hasil' },
    { label: "Sidang Skripsi", step: 'pendadaran' },
    { label: "Lulus", step: 'lulus' },
] as const;

type SortField = 'name' | 'generation' | 'nim' | 'title' | 'progress';
type SortOrder = 'asc' | 'desc';

export function StudentProgressSection({ stats, students, title, description, icon }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [appliedGenerations, setAppliedGenerations] = useState<string[] | null>(null);
    const [appliedProgress, setAppliedProgress] = useState<string[] | null>(null);

    const [tempGenerations, setTempGenerations] = useState<string[]>([]);
    const [tempProgress, setTempProgress] = useState<string[]>([]);

    const [isSortOpen, setIsSortOpen] = useState(false);
    const [appliedSortField, setAppliedSortField] = useState<SortField>('progress');
    const [appliedSortOrder, setAppliedSortOrder] = useState<SortOrder>('asc');

    const [tempSortField, setTempSortField] = useState<SortField>('progress');
    const [tempSortOrder, setTempSortOrder] = useState<SortOrder>('asc');

    const [searchQuery, setSearchQuery] = useState("");

    const availableGenerations = useMemo(() => {
        if (!students) return [];
        const gens = new Set<string>();
        students.forEach(s => {
            if (s.student_generation_year) gens.add(s.student_generation_year.toString());
        });
        return Array.from(gens).sort((a, b) => b.localeCompare(a));
    }, [students]);

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        const filtered = students.filter(student => {
            const matchGen = appliedGenerations === null ? true : 
                             (student.student_generation_year && appliedGenerations.includes(student.student_generation_year.toString()));
            const matchProg = appliedProgress === null ? true : 
                              appliedProgress.includes(student.progress);
            
            const query = searchQuery.toLowerCase();
            const matchSearch = query === "" || 
                                student.student_name.toLowerCase().includes(query) ||
                                (student.nim && student.nim.toLowerCase().includes(query)) ||
                                (student.title && student.title.toLowerCase().includes(query));

            return matchGen && matchProg && matchSearch;
        });

        return filtered.sort((a, b) => {
            let valA: string | number = '';
            let valB: string | number = '';
            
            switch (appliedSortField) {
                case 'name':
                    valA = a.student_name || '';
                    valB = b.student_name || '';
                    break;
                case 'generation':
                    valA = a.student_generation_year ? parseInt(a.student_generation_year.toString()) : 0;
                    valB = b.student_generation_year ? parseInt(b.student_generation_year.toString()) : 0;
                    break;
                case 'nim':
                    valA = a.nim || '';
                    valB = b.nim || '';
                    break;
                case 'title':
                    valA = a.title || '';
                    valB = b.title || '';
                    break;
                case 'progress':
                    valA = STEPS.findIndex(s => s.step === a.progress);
                    valB = STEPS.findIndex(s => s.step === b.progress);
                    break;
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return appliedSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }

            if (valA < valB) return appliedSortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return appliedSortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [students, appliedGenerations, appliedProgress, appliedSortField, appliedSortOrder, searchQuery]);

    const isFilterActive = appliedGenerations !== null || appliedProgress !== null;
    const isSortActive = appliedSortField !== 'progress' || appliedSortOrder !== 'asc';

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setTempGenerations(appliedGenerations ?? availableGenerations);
            setTempProgress(appliedProgress ?? STEPS.map(s => s.step));
        }
    };

    const handleApply = () => {
        setAppliedGenerations(tempGenerations.length === availableGenerations.length ? null : tempGenerations);
        setAppliedProgress(tempProgress.length === STEPS.length ? null : tempProgress);
        setIsOpen(false);
    };

    const handleSortOpenChange = (open: boolean) => {
        setIsSortOpen(open);
        if (open) {
            setTempSortField(appliedSortField);
            setTempSortOrder(appliedSortOrder);
        }
    };

    const handleSortApply = () => {
        setAppliedSortField(tempSortField);
        setAppliedSortOrder(tempSortOrder);
        setIsSortOpen(false);
    };

    if (!stats) return null;

    return (
        <GradientCard className="">
            <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            {icon || <TrendingUp className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                            <GradientCardTitle>
                            {title}
                        </GradientCardTitle>
                            <GradientCardDescription>
                            {description}
                        </GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>

            <div className="px-1 pb-5 pt-3 sm:px-5 w-full">
                <div className="flex flex-row divide-x divide-emerald-500/15 w-full">
                    {STEPS.map((s, i) => {
                        const count = stats[s.step] || 0;
                        const stepType = s.step as keyof typeof stepTextVariants;
                        return (
                            <div key={i} className="flex flex-col items-center justify-start py-1 sm:py-2 px-0.5 sm:px-3 flex-1 min-w-0">
                                <span className={stepTextVariants({ stepType })}>{count}</span>
                                <span className={stepLabelVariants({ stepType })}>
                                    {s.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Student List */}
            {students && students.length > 0 && (
                <div className="border-t border-emerald-500/15 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Cari nama, NIM, atau judul..." 
                                className="pl-9 h-9 bg-background shadow-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <Dialog open={isSortOpen} onOpenChange={handleSortOpenChange}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors rounded-lg">
                                    <ArrowUpDown className="h-4 w-4" />
                                    {isSortActive && (
                                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Urutkan Mahasiswa</DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Pilih kriteria untuk mengurutkan daftar mahasiswa bimbingan.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium leading-none">Berdasarkan</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'progress', label: 'Progress Skripsi' },
                                                { id: 'name', label: 'Nama Mahasiswa' },
                                                { id: 'nim', label: 'NIM' },
                                                { id: 'generation', label: 'Angkatan' },
                                                { id: 'title', label: 'Judul Skripsi' }
                                            ].map((field) => (
                                                <div 
                                                    key={field.id}
                                                    onClick={() => setTempSortField(field.id as SortField)}
                                                    className="flex items-center space-x-2.5 cursor-pointer group"
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${tempSortField === field.id ? "border-emerald-500" : "border-input group-hover:border-emerald-500/50"}`}>
                                                        {tempSortField === field.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                                    </div>
                                                    <span className={`text-sm transition-colors font-normal leading-tight ${tempSortField === field.id ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}>
                                                        {field.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium leading-none">Urutan</h4>
                                        <div className="flex flex-col gap-3">
                                            {[
                                                { id: 'asc', label: 'Menaik (A-Z / Lama-Baru)' },
                                                { id: 'desc', label: 'Menurun (Z-A / Baru-Lama)' }
                                            ].map((order) => (
                                                <div 
                                                    key={order.id}
                                                    onClick={() => setTempSortOrder(order.id as SortOrder)}
                                                    className="flex items-center space-x-2.5 cursor-pointer group"
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${tempSortOrder === order.id ? "border-emerald-500" : "border-input group-hover:border-emerald-500/50"}`}>
                                                        {tempSortOrder === order.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                                    </div>
                                                    <span className={`text-sm transition-colors font-normal leading-tight ${tempSortOrder === order.id ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}>
                                                        {order.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="sm:justify-between items-center gap-2 sm:gap-0 mt-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            setTempSortField('progress');
                                            setTempSortOrder('asc');
                                        }}
                                        className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
                                    >
                                        Reset
                                    </Button>
                                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                                        <Button variant="outline" size="sm" onClick={() => setIsSortOpen(false)} className="w-full sm:w-auto">
                                            Batal
                                        </Button>
                                        <Button size="sm" onClick={handleSortApply} className="w-full sm:w-auto">
                                            Terapkan
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors rounded-lg">
                                    <Filter className="h-4 w-4" />
                                    {isFilterActive && (
                                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Filter Mahasiswa</DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Pilih kriteria untuk memfilter daftar mahasiswa bimbingan.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {availableGenerations.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium leading-none">Angkatan</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableGenerations.map(gen => (
                                                    <div key={gen} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`gen-${gen}`} 
                                                            checked={tempGenerations.includes(gen)}
                                                            onCheckedChange={(checked) => {
                                                                setTempGenerations(prev => 
                                                                    checked ? [...prev, gen] : prev.filter(g => g !== gen)
                                                                )
                                                            }}
                                                        />
                                                        <Label htmlFor={`gen-${gen}`} className="text-sm font-normal cursor-pointer">{gen}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium leading-none">Progress Skripsi</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {STEPS.map(step => (
                                                <div key={step.step} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`prog-${step.step}`} 
                                                        checked={tempProgress.includes(step.step)}
                                                        onCheckedChange={(checked) => {
                                                            setTempProgress(prev => 
                                                                checked ? [...prev, step.step] : prev.filter(p => p !== step.step)
                                                            )
                                                        }}
                                                    />
                                                    <Label htmlFor={`prog-${step.step}`} className="text-sm font-normal cursor-pointer">{step.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="sm:justify-between items-center gap-2 sm:gap-0 mt-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            setTempGenerations(availableGenerations);
                                            setTempProgress(STEPS.map(s => s.step));
                                        }}
                                        className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
                                    >
                                        Reset
                                    </Button>
                                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                                        <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                                            Batal
                                        </Button>
                                        <Button size="sm" onClick={handleApply} className="w-full sm:w-auto">
                                            Terapkan
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                                Tidak ada mahasiswa yang sesuai dengan filter.
                            </div>
                        ) : filteredStudents.map((student) => {
                            const stepIndex = STEPS.findIndex(s => s.step === student.progress);
                            const totalSteps = STEPS.length;
                            // Default to 100% if step is not found
                            const percentage = stepIndex >= 0 ? ((stepIndex + 1) / totalSteps) * 100 : 100;
                            const progressLabel = stepIndex >= 0 ? STEPS[stepIndex].label : student.progress;
                            
                            const stepType = (stepIndex >= 0 ? STEPS[stepIndex].step : 'default') as keyof typeof stepBadgeVariants;

                            let generationBadgeColor = 'bg-primary/10 border-primary/20 text-primary';
                            if (student.student_generation_year) {
                                const genYear = parseInt(student.student_generation_year.toString(), 10);
                                if (!isNaN(genYear)) {
                                    generationBadgeColor = GENERATION_COLORS[genYear % GENERATION_COLORS.length];
                                }
                            }

                            return (
                                <div key={student.nim} className="relative overflow-hidden p-4 sm:px-5 flex items-center gap-4 group border border-border/50 rounded-xl bg-card">
                                    {/* Progress Background Indicator */}
                                    <div
                                        className={stepProgressVariants({ stepType })}
                                        style={{ width: `${percentage}%` }}
                                    />

                                    {/* Content (z-10 ensures it is above background) */}
                                    <div className="relative z-10 flex w-full items-center gap-3 sm:gap-4">
                                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shadow-sm shrink-0">
                                            <AvatarImage src={student.student_image || "/default_user_photo.png"} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {student.student_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                {student.student_generation_year && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md shrink-0 ${generationBadgeColor}`}>
                                                        Angkatan {student.student_generation_year}
                                                    </span>
                                                )}
                                                <span className={stepBadgeVariants({ stepType })}>
                                                    {progressLabel}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <h4 className="font-bold text-sm sm:text-base text-foreground truncate">
                                                    {student.student_name}
                                                </h4>
                                                <span className="text-xs sm:text-sm text-muted-foreground shrink-0">
                                                    ({student.nim})
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-1.5 mt-0.5 text-xs sm:text-sm text-muted-foreground truncate font-medium">
                                                <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                <span className="truncate">
                                                    {student.title || "Belum ada judul (masih dalam tahap proposal)"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </GradientCard>
    )
}

