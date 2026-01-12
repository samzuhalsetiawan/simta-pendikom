"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const handleTitleSave = (newTitle: string) => {
   console.log("New title:", newTitle);
   // In real implementation, this would call an API
};

interface EditableTitleProps {
   initialTitle?: string | null;
   className?: string;
}

export function EditableTitle({ initialTitle, className }: EditableTitleProps) {
   const [isEditing, setIsEditing] = useState(false);
   const [title, setTitle] = useState(initialTitle || "");
   const [tempTitle, setTempTitle] = useState(title);

   const displayTitle = title || "Belum Menentukan Judul Skripsi";
   const isEmpty = !title;

   const handleEdit = () => {
      setTempTitle(title);
      setIsEditing(true);
   };

   const handleSave = () => {
      setTitle(tempTitle);
      setIsEditing(false);
      handleTitleSave(tempTitle);
   };

   const handleCancel = () => {
      setTempTitle(title);
      setIsEditing(false);
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
         handleSave();
      } else if (e.key === "Escape") {
         handleCancel();
      }
   };

   return (
      <div className={cn("flex items-center gap-3 group", className)}>
         {isEditing ? (
            <>
               <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold h-auto py-2 px-3 border-2 border-primary focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Masukkan judul skripsi..."
                  autoFocus
               />
               <div className="flex gap-2 shrink-0">
                  <Button
                     size="icon"
                     variant="default"
                     onClick={handleSave}
                     className="h-10 w-10 bg-green-600 hover:bg-green-700 text-white"
                  >
                     <Check className="h-5 w-5" />
                  </Button>
                  <Button
                     size="icon"
                     variant="outline"
                     onClick={handleCancel}
                     className="h-10 w-10 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                     <X className="h-5 w-5" />
                  </Button>
               </div>
            </>
         ) : (
            <>
               <h1
                  className={cn(
                     "text-2xl md:text-3xl lg:text-4xl font-bold flex-1",
                     isEmpty && "text-muted-foreground italic"
                  )}
               >
                  {displayTitle}
               </h1>
               <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEdit}
                  className="h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary shrink-0"
               >
                  <Pencil className="h-5 w-5" />
               </Button>
            </>
         )}
      </div>
   );
}
