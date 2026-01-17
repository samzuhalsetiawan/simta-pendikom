import { ProfileCard } from "@/components/common/profile-card/profile-card";
import { Card, CardContent } from "@/components/ui/card";
import { EditableTitle } from "./components/editable-title";
import { Student } from "@/types/user/student";

type ThesisTitleSectionProps = {
   student: Student;
   thesisTitle?: string;
}

export function ThesisTitleSection({ student, thesisTitle }: ThesisTitleSectionProps) {
   return (
      <section className="py-4 flex flex-col gap-4 items-start">
         <ProfileCard
            user={{
               id: student.id,
               email: student.email ?? "",
               name: student.name,
               nim: student.nim,
               image: student.image
            }}
         />
         <Card className="self-stretch">
            <CardContent>
               <EditableTitle initialTitle={thesisTitle ?? ""} />
            </CardContent>
         </Card>
      </section>
   )
}