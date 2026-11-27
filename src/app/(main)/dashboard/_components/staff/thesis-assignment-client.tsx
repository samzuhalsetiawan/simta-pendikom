"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { bulkAssignLecturers } from "@/lib/actions/thesis";
import type { StudentWithThesis } from "@/lib/dal/thesis";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { 
    Users, 
    UserPlus, 
    Trash2, 
    X,
    GripVertical,
    Loader2,
    GraduationCap,
    Search,
    Check,
    CheckCircle2
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/base/tabs";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { ScrollArea } from "@/components/base/scroll-area";

interface Props {
    students: StudentWithThesis[];
    lecturers: { nip: string; name: string }[];
    generations: string[];
    currentGeneration: string;
}

interface AssignedLecturer {
    nip: string;
    name: string;
}

function LecturerSortableItem({ lecturer, index, onRemove }: { lecturer: AssignedLecturer, index: number, onRemove: (nip: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lecturer.nip });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 0,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`flex items-center gap-3 p-3 rounded-xl border group transition-all ${isDragging ? 'bg-background border-primary shadow-xl ring-2 ring-primary/20' : 'bg-muted/30 border-border/50'}`}
        >
            <button 
                {...attributes} 
                {...listeners}
                className="p-1 text-muted-foreground hover:text-primary cursor-grab active:cursor-grabbing transition-colors"
            >
                <GripVertical className="h-4 w-4" />
            </button>
            
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                {index + 1}
            </div>

            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{lecturer.name}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{lecturer.nip}</div>
            </div>

            <button 
                onClick={() => onRemove(lecturer.nip)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function ThesisAssignmentClient({ students, lecturers, generations, currentGeneration }: Props) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithThesis | null>(null);
    const [supervisors, setSupervisors] = useState<AssignedLecturer[]>([]);
    const [examiners, setExaminers] = useState<AssignedLecturer[]>([]);
    const [activeTab, setActiveTab] = useState<string>("supervisor");
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const openAssignDialog = (student: StudentWithThesis) => {
        setSelectedStudent(student);
        const currentSupervisors = student.lecturers
            .filter(l => l.role === 'supervisor')
            .sort((a, b) => a.position - b.position)
            .map(l => ({ nip: l.nip, name: l.name }));
        
        const currentExaminers = student.lecturers
            .filter(l => l.role === 'examiner')
            .sort((a, b) => a.position - b.position)
            .map(l => ({ nip: l.nip, name: l.name }));

        setSupervisors(currentSupervisors);
        setExaminers(currentExaminers);
        setIsDialogOpen(true);
        setSearchQuery("");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            if (activeTab === "supervisor") {
                setSupervisors((items) => {
                    const oldIndex = items.findIndex(i => i.nip === active.id);
                    const newIndex = items.findIndex(i => i.nip === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            } else {
                setExaminers((items) => {
                    const oldIndex = items.findIndex(i => i.nip === active.id);
                    const newIndex = items.findIndex(i => i.nip === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    const addLecturer = (nip: string) => {
        const lecturer = lecturers.find(l => l.nip === nip);
        if (!lecturer) return;

        // Prevent same lecturer in both supervisor and examiner roles
        if (supervisors.find(s => s.nip === nip) || examiners.find(e => e.nip === nip)) {
            toast.error("Dosen ini sudah ditugaskan pada mahasiswa ini.");
            return;
        }

        if (activeTab === "supervisor") {
            setSupervisors([...supervisors, lecturer]);
        } else {
            setExaminers([...examiners, lecturer]);
        }
    };

    const removeLecturer = (nip: string) => {
        if (activeTab === "supervisor") {
            setSupervisors(supervisors.filter(s => s.nip !== nip));
        } else {
            setExaminers(examiners.filter(e => e.nip !== nip));
        }
    };

    const handleSave = async () => {
        if (!selectedStudent) return;
        setLoading(true);
        
        const assignments = [
            ...supervisors.map((s, idx) => ({ nip: s.nip, role: 'supervisor' as const, position: idx + 1 })),
            ...examiners.map((e, idx) => ({ nip: e.nip, role: 'examiner' as const, position: idx + 1 }))
        ];
        
        const res = await bulkAssignLecturers(selectedStudent.nim, assignments);
        
        if (res.error) {
            toast.error(res.error);
            setLoading(false);
        } else {
            toast.success("Penugasan dosen berhasil diperbarui");
            setIsDialogOpen(false);
            setLoading(false);
        }
    };

    const handleGenerationChange = (year: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('year', year);
        router.push(`/dashboard/thesis-assignment?${params.toString()}`);
    };

    const allAssignedNips = useMemo(() => {
        const supervisorNips = new Set(supervisors.map(s => s.nip));
        const examinerNips = new Set(examiners.map(e => e.nip));
        return { supervisorNips, examinerNips };
    }, [supervisors, examiners]);

    const filteredLecturers = useMemo(() => {
        return lecturers
            .filter(l => 
                l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                l.nip.includes(searchQuery)
            );
    }, [lecturers, searchQuery]);

    const getLecturerStatus = (nip: string): { disabled: boolean; label: string | null } => {
        if (allAssignedNips.supervisorNips.has(nip)) {
            return { disabled: true, label: activeTab === 'supervisor' ? 'Sudah dipilih' : 'Sudah dipilih sebagai Pembimbing' };
        }
        if (allAssignedNips.examinerNips.has(nip)) {
            return { disabled: true, label: activeTab === 'examiner' ? 'Sudah dipilih' : 'Sudah dipilih sebagai Penguji' };
        }
        return { disabled: false, label: null };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <GradientCard className="flex flex-col h-full overflow-hidden">
                <GradientCardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4 border-b border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>
                                Penugasan Pembimbing & Penguji
                            </GradientCardTitle>
                            <GradientCardDescription>Kelola penugasan dosen untuk mahasiswa angkatan {currentGeneration}.</GradientCardDescription>
                        </div>
                    </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group w-full sm:w-48">
                         <select 
                            className="w-full h-10 pl-4 pr-10 rounded-xl border border-border/50 bg-background text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            value={currentGeneration}
                            onChange={(e) => handleGenerationChange(e.target.value)}
                        >
                            {generations.map(year => (
                                <option key={year} value={year}>Angkatan {year}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>

                    <Badge className="hidden sm:inline-flex bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-2 font-bold text-xs h-10 shrink-0">
                        {students.length} Mahasiswa
                    </Badge>
                </div>
                </GradientCardHeader>

                {/* ── Mobile card list (< sm) ── */}
                <div className="sm:hidden divide-y divide-border/50">
                    {students.map((student) => (
                        <div key={student.nim} className="p-4 space-y-3">
                            {/* Student identity row */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                                        <AvatarImage src={student.image || "/default_user_photo.png"} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                            {student.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm truncate">{student.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{student.nim}</div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 shrink-0 hover:bg-primary hover:text-primary-foreground border-border/50"
                                    onClick={() => openAssignDialog(student)}
                                    aria-label={`Tugaskan dosen untuk ${student.name}`}
                                >
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Status TA */}
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-20 shrink-0 pt-0.5">Status TA</span>
                                <div className="min-w-0">
                                    {student.thesis_id ? (
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="text-[10px] capitalize border-primary/30 text-primary bg-primary/5">
                                                {student.progress?.replace(/_/g, ' ')}
                                            </Badge>
                                            {student.title && (
                                                <p className="text-[10px] italic line-clamp-2 opacity-70">{student.title}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="text-[10px] opacity-50">Belum Terdaftar</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Pembimbing / Penguji */}
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-20 shrink-0 pt-0.5">Dosen</span>
                                <div className="flex flex-wrap gap-1.5 min-w-0">
                                    {student.lecturers.map((l) => (
                                        <div key={`${l.nip}-${l.role}`} className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${l.role === 'supervisor' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                            <span className="font-bold text-[10px] leading-none">{l.name}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase">({l.role === 'supervisor' ? 'Pmb' : 'Pnj'})</span>
                                        </div>
                                    ))}
                                    {student.lecturers.length === 0 && (
                                        <span className="text-[10px] text-muted-foreground italic">Belum ada penugasan</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Desktop table (≥ sm) ── */}
                <div className="hidden sm:block p-0">
                    <div
                        role="region"
                        aria-label="Tabel penugasan pembimbing dan penguji"
                        tabIndex={0}
                        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <table className="w-full text-sm">
                            <thead className="bg-muted/10 border-b border-border/50">
                                <tr className="border-b">
                                    <th className="text-left py-4 px-6 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Mahasiswa</th>
                                    <th className="text-left py-4 px-6 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Status TA</th>
                                    <th className="text-left py-4 px-6 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Pembimbing / Penguji</th>
                                    <th className="text-right py-4 px-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {students.map((student) => (
                                    <tr key={student.nim} className="hover:bg-muted/30 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-border/50">
                                                    <AvatarImage src={student.image || "/default_user_photo.png"} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                                        {student.name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-sm">{student.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{student.nim}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {student.thesis_id ? (
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="text-[10px] capitalize border-primary/30 text-primary bg-primary/5">
                                                        {student.progress?.replace(/_/g, ' ')}
                                                    </Badge>
                                                    {student.title && <p className="text-[10px] italic line-clamp-1 opacity-70 max-w-[200px]">{student.title}</p>}
                                                </div>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px] opacity-50">Belum Terdaftar</Badge>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-2">
                                                {student.lecturers.map((l) => (
                                                    <div key={`${l.nip}-${l.role}`} className="flex items-center gap-2 bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/50 group/item relative transition-colors hover:bg-muted/70">
                                                        <Avatar className="h-5 w-5 border border-border/50">
                                                            <AvatarImage src={l.image || "/default_user_photo.png"} className="object-cover" />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[8px]">
                                                                {l.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${l.role === 'supervisor' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                                <span className="font-bold text-[10px]">{l.name}</span>
                                                            </div>
                                                            <span className="text-[8px] text-muted-foreground uppercase pl-3">{l.role === 'supervisor' ? 'Pembimbing' : 'Penguji'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {student.lecturers.length === 0 && (
                                                    <span className="text-[10px] text-muted-foreground italic">Belum ada penugasan</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 text-[11px] font-bold gap-2 hover:bg-primary hover:text-primary-foreground border-border/50"
                                                onClick={() => openAssignDialog(student)}
                                            >
                                                <UserPlus className="h-3.5 w-3.5" />
                                                Tugaskan
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
                    {/* Mobile: bottom sheet — Desktop: centered modal */}
                    <Dialog.Content className="fixed z-[110] bg-background shadow-2xl focus:outline-none
                        left-0 right-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl border-t border-x
                        sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto sm:w-[92vw] sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border">
                        {/* Drag handle — visible only on mobile */}
                        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
                            <div className="w-10 h-1 rounded-full bg-border" />
                        </div>
                        <div className="bg-primary/5 p-5 sm:p-8 border-b border-border/50">
                            <div className="flex flex-col space-y-2">
                                <Dialog.Title className="text-lg sm:text-xl font-heading font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    Penugasan Dosen
                                </Dialog.Title>
                                <Dialog.Description className="text-xs text-muted-foreground">
                                    Kelola penugasan pembimbing dan penguji untuk <span className="font-bold text-foreground">{selectedStudent?.name}</span>.
                                </Dialog.Description>
                            </div>
                        </div>

                        <div className="p-5 sm:p-8 space-y-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 h-12 p-1.5 bg-muted/50 rounded-xl">
                                    <TabsTrigger value="supervisor" className="rounded-lg font-bold text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        Pembimbing ({supervisors.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="examiner" className="rounded-lg font-bold text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        Penguji ({examiners.length})
                                    </TabsTrigger>
                                </TabsList>
                                
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Select key={`${activeTab}-${supervisors.length}-${examiners.length}`} onValueChange={addLecturer}>
                                                <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background text-xs font-bold focus:ring-primary/20 focus:border-primary">
                                                    <SelectValue placeholder={`Pilih ${activeTab === 'supervisor' ? 'Pembimbing' : 'Penguji'}...`} />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px] z-[200]">
                                                    <div className="p-2 border-b">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                            <input 
                                                                className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted text-xs outline-none focus:ring-1 focus:ring-primary"
                                                                placeholder="Cari dosen..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                    <ScrollArea className="h-[200px]">
                                                        {filteredLecturers.map((l) => {
                                                            const status = getLecturerStatus(l.nip);
                                                            return (
                                                                <SelectItem 
                                                                    key={l.nip} 
                                                                    value={l.nip} 
                                                                    className={`text-xs font-medium ${status.disabled ? 'opacity-50' : ''}`}
                                                                    disabled={status.disabled}
                                                                >
                                                                    <div className="flex items-center justify-between w-full gap-3">
                                                                        <div className="flex flex-col">
                                                                            <span>{l.name}</span>
                                                                            <span className="text-[10px] text-muted-foreground opacity-70">{l.nip}</span>
                                                                        </div>
                                                                        {status.disabled && (
                                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                                                <span className="text-[9px] text-emerald-600 font-medium">{status.label}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                        {filteredLecturers.length === 0 && (
                                                            <div className="p-4 text-center text-xs text-muted-foreground italic">
                                                                Dosen tidak ditemukan
                                                            </div>
                                                        )}
                                                    </ScrollArea>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <DndContext 
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <ScrollArea className="h-[250px] pr-4">
                                            <SortableContext 
                                                items={(activeTab === 'supervisor' ? supervisors : examiners).map(l => l.nip)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2">
                                                    {(activeTab === 'supervisor' ? supervisors : examiners).map((l, index) => (
                                                        <LecturerSortableItem 
                                                            key={l.nip} 
                                                            lecturer={l} 
                                                            index={index}
                                                            onRemove={removeLecturer}
                                                        />
                                                    ))}
                                                    {(activeTab === 'supervisor' ? supervisors : examiners).length === 0 && (
                                                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border/50 rounded-2xl">
                                                            <UserPlus className="h-8 w-8 text-zinc-200 mb-2" />
                                                            <p className="text-xs text-muted-foreground font-medium">Belum ada {activeTab === 'supervisor' ? 'pembimbing' : 'penguji'} ditambahkan</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </ScrollArea>
                                    </DndContext>
                                </div>
                            </Tabs>

                            <div className="flex gap-3 pt-4">
                                <Dialog.Close asChild>
                                    <Button variant="ghost" className="flex-1 h-12 font-bold text-xs rounded-xl">Batal</Button>
                                </Dialog.Close>
                                <Button 
                                    className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/20"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            <span>Simpan Penugasan</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Dialog.Close asChild>
                            <button
                                className="absolute right-5 top-[3.75rem] sm:top-6 rounded-full p-2 bg-white/10 hover:bg-white/20 text-muted-foreground hover:text-foreground transition-all"
                                aria-label="Tutup dialog"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            </GradientCard>
        </motion.div>
    );
}
