import { StudentThesisData, PipelineStats } from "@/lib/dal/lecturer";
import { Users } from "lucide-react";
import { StudentProgressSection } from "./student-progress-section";

interface Props {
    stats?: PipelineStats;
    students?: StudentThesisData[];
}

export default function ExaminedStudentProgress({ stats, students }: Props) {
    return (
        <StudentProgressSection 
            title="Progress Mahasiswa yang Diuji"
            description="Pantau status terkini dan perkembangan skripsi mahasiswa yang Anda uji."
            icon={<Users className="h-4 w-4 text-primary" />}
            stats={stats}
            students={students}
        />
    );
}

