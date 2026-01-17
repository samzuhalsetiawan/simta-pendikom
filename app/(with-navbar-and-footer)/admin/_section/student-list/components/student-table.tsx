import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Student } from "@/types/user/student";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentTableProps {
   students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
   return (
      <div className="rounded-md border">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>Email</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {students.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-24 text-center">
                        No students found for this generation.
                     </TableCell>
                  </TableRow>
               ) : (
                  students.map((student) => (
                     <TableRow key={student.id}>
                        <TableCell>
                           <Avatar className="h-10 w-10">
                              <AvatarImage src={student.image} alt={student.name} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.nim}</TableCell>
                        <TableCell>{student.email || "-"}</TableCell>
                     </TableRow>
                  ))
               )}
            </TableBody>
         </Table>
      </div>
   );
}
