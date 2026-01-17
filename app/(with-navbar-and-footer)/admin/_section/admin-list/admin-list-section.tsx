import { getAdmins } from "@/data/lecturer/get-admins";
import { LecturerTable } from "../lecturer-list/components/lecturer-table";

export async function AdminListSection() {
   const admins = await getAdmins();

   return (
      <section className="py-12 border-b">
         <div className="container mx-auto px-4">
            <div className="mb-8">
               <h2 className="text-3xl font-bold tracking-tight">Administrators</h2>
               <p className="text-muted-foreground mt-1">Personnel with administrative access to the platform.</p>
            </div>
            <LecturerTable lecturers={admins} />
         </div>
      </section>
   );

}
