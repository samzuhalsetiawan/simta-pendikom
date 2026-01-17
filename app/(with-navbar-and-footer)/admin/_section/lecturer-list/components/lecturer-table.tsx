import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Lecturer } from "@/types/user/lecturer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LecturerTableProps {
   lecturers: Lecturer[];
   title?: string;
}

export function LecturerTable({ lecturers, title }: LecturerTableProps) {
   return (
      <div className="space-y-4">
         {title && <h3 className="text-lg font-semibold">{title}</h3>}
         <div className="rounded-md border">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-[80px]">Avatar</TableHead>
                     <TableHead>Name</TableHead>
                     <TableHead>NIP</TableHead>
                     <TableHead>Email</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {lecturers.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                           No data found.
                        </TableCell>
                     </TableRow>
                  ) : (
                     lecturers.map((lecturer) => (
                        <TableRow key={lecturer.id}>
                           <TableCell>
                              <Avatar className="h-10 w-10">
                                 <AvatarImage src={lecturer.image} alt={lecturer.name} />
                                 <AvatarFallback>{lecturer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                           </TableCell>
                           <TableCell className="font-medium">{lecturer.name}</TableCell>
                           <TableCell>{lecturer.nip}</TableCell>
                           <TableCell>{lecturer.email || "-"}</TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
