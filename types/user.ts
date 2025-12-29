export interface User {
   name: string;
   email: string | null;
   image: string | null;
   role: "lecturer" | "student";
}