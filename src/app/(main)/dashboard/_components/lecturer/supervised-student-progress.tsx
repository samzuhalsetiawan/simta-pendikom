import { StudentThesisData, PipelineStats } from "@/lib/dal/lecturer";
import { TrendingUp } from "lucide-react";
import { StudentProgressSection } from "./student-progress-section";

interface Props {
    stats?: PipelineStats;
    students?: StudentThesisData[];
}

export default function SupervisedStudentProgress({ stats, students }: Props) {
    return (
        <StudentProgressSection 
            title="Progress Mahasiswa Bimbingan"
            description="Pantau status terkini dan perkembangan skripsi mahasiswa bimbingan Anda."
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            stats={stats}
            students={students}
        />
    );
}

