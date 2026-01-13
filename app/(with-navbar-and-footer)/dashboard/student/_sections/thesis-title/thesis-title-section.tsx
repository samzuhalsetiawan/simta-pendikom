import { ProfileCard } from "@/components/common/profile-card/profile-card";
import { Card, CardContent } from "@/components/ui/card";
import { EditableTitle } from "./components/editable-title";

export function ThesisTitleSection() {
   // Dummy Data
   const DUMMY_TITLE = "Implementasi Machine Learning untuk Prediksi Cuaca Menggunakan Algoritma Random Forest";

   return (
      <section className="py-4 flex flex-col gap-4 items-start">
         <ProfileCard
            user={
                  {
                     id: 1,
                     email: "rina@gmail.com",
                     name: "Rina Marlina",
                     nim: "2005176049",
                     image: undefined
                  }
               } 
         />
         <Card className="self-stretch">
            <CardContent>
               <EditableTitle initialTitle={DUMMY_TITLE} />
            </CardContent>
         </Card>
      </section>
   )
}