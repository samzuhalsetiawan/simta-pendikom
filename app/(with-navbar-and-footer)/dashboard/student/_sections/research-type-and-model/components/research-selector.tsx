"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RESEARCH_TYPES = [
   {
      id: "not_selected",
      name: "Belum menentukan jenis penelitian",
      description: "Jenis penelitian adalah pendekatan atau metode yang digunakan untuk mengumpulkan dan menganalisis data dalam penelitian. Pemilihan jenis penelitian yang tepat sangat penting untuk mencapai tujuan penelitian Anda."
   },
   {
      id: "quantitative",
      name: "Kuantitatif",
      description: "Penelitian kuantitatif menggunakan data numerik dan analisis statistik untuk menguji hipotesis. Cocok untuk penelitian yang membutuhkan generalisasi hasil ke populasi yang lebih luas."
   },
   {
      id: "qualitative",
      name: "Kualitatif",
      description: "Penelitian kualitatif berfokus pada pemahaman mendalam tentang fenomena melalui data non-numerik seperti wawancara, observasi, dan analisis dokumen. Cocok untuk eksplorasi konsep atau pemahaman konteks."
   },
   {
      id: "mixed",
      name: "Mixed Methods",
      description: "Penelitian mixed methods menggabungkan pendekatan kuantitatif dan kualitatif untuk mendapatkan pemahaman yang lebih komprehensif. Cocok untuk penelitian kompleks yang membutuhkan validasi dari berbagai perspektif."
   },
   {
      id: "experimental",
      name: "Eksperimental",
      description: "Penelitian eksperimental melibatkan manipulasi variabel independen untuk mengamati efeknya pada variabel dependen. Cocok untuk menguji hubungan sebab-akibat dalam kondisi terkontrol."
   },
   {
      id: "custom",
      name: "Custom (Tentukan Sendiri)",
      description: ""
   }
];

const RESEARCH_MODELS = [
   {
      id: "not_selected",
      name: "Belum menentukan model penelitian",
      description: "Model penelitian adalah kerangka kerja atau desain spesifik yang digunakan untuk melaksanakan penelitian. Model ini menentukan bagaimana data dikumpulkan, dianalisis, dan diinterpretasikan."
   },
   {
      id: "case_study",
      name: "Studi Kasus",
      description: "Studi kasus melibatkan analisis mendalam terhadap satu atau beberapa kasus spesifik. Model ini cocok untuk memahami fenomena kompleks dalam konteks nyata dan menghasilkan insight yang detail."
   },
   {
      id: "survey",
      name: "Survey",
      description: "Model survey mengumpulkan data dari sampel besar melalui kuesioner atau wawancara terstruktur. Cocok untuk mengukur opini, sikap, atau perilaku dari populasi yang luas."
   },
   {
      id: "action_research",
      name: "Action Research",
      description: "Action research melibatkan siklus perencanaan, tindakan, observasi, dan refleksi untuk memecahkan masalah praktis. Cocok untuk penelitian yang bertujuan membuat perubahan atau perbaikan dalam praktik."
   },
   {
      id: "grounded_theory",
      name: "Grounded Theory",
      description: "Grounded theory bertujuan mengembangkan teori baru dari data yang dikumpulkan secara sistematis. Model ini cocok untuk area penelitian yang belum memiliki teori yang memadai."
   },
   {
      id: "ethnography",
      name: "Etnografi",
      description: "Etnografi melibatkan studi mendalam tentang budaya atau kelompok sosial melalui observasi partisipan. Cocok untuk memahami perilaku dan interaksi dalam konteks sosial dan budaya."
   },
   {
      id: "custom",
      name: "Custom (Tentukan Sendiri)",
      description: ""
   }
];

interface ResearchSelectorProps {
   initialType?: string;
   initialModel?: string;
   onTypeChange?: (type: string, customName?: string, customDesc?: string) => void;
   onModelChange?: (model: string, customName?: string, customDesc?: string) => void;
}

export function ResearchSelector({
   initialType = "not_selected",
   initialModel = "not_selected",
   onTypeChange,
   onModelChange
}: ResearchSelectorProps) {
   const [selectedType, setSelectedType] = useState(initialType);
   const [customTypeName, setCustomTypeName] = useState("");
   const [customTypeDesc, setCustomTypeDesc] = useState("");

   const [selectedModel, setSelectedModel] = useState(initialModel);
   const [customModelName, setCustomModelName] = useState("");
   const [customModelDesc, setCustomModelDesc] = useState("");

   const currentType = RESEARCH_TYPES.find(t => t.id === selectedType);
   const currentModel = RESEARCH_MODELS.find(m => m.id === selectedModel);

   const handleTypeChange = (value: string) => {
      setSelectedType(value);
      if (value !== "custom") {
         onTypeChange?.(value);
      }
   };

   const handleModelChange = (value: string) => {
      setSelectedModel(value);
      if (value !== "custom") {
         onModelChange?.(value);
      }
   };

   return (
      <div className="grid md:grid-cols-2 gap-6">
         {/* Research Type */}
         <Card>
            <CardHeader className="pb-3">
               <CardTitle className="text-lg">Jenis Penelitian</CardTitle>
               <CardDescription>Pilih jenis penelitian yang akan digunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-white dark:bg-zinc-900">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     {RESEARCH_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                           {type.name}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               {selectedType === "custom" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div className="space-y-2">
                        <Label htmlFor="custom-type-name">Nama Jenis Penelitian</Label>
                        <Input
                           id="custom-type-name"
                           value={customTypeName}
                           onChange={(e) => setCustomTypeName(e.target.value)}
                           onBlur={() => onTypeChange?.("custom", customTypeName, customTypeDesc)}
                           placeholder="Masukkan nama jenis penelitian..."
                           className="bg-white dark:bg-zinc-900"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="custom-type-desc">Deskripsi (Opsional)</Label>
                        <Textarea
                           id="custom-type-desc"
                           value={customTypeDesc}
                           onChange={(e) => setCustomTypeDesc(e.target.value)}
                           onBlur={() => onTypeChange?.("custom", customTypeName, customTypeDesc)}
                           placeholder="Jelaskan jenis penelitian custom Anda..."
                           className="bg-white dark:bg-zinc-900 min-h-[100px]"
                        />
                     </div>
                  </div>
               )}

               <div className="p-4 bg-white/60 dark:bg-zinc-900/60 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                     {selectedType === "custom" && customTypeDesc
                        ? customTypeDesc
                        : currentType?.description}
                  </p>
               </div>
            </CardContent>
         </Card>

         {/* Research Model */}
         <Card>
            <CardHeader className="pb-3">
               <CardTitle className="text-lg">Model Penelitian</CardTitle>
               <CardDescription>Pilih model penelitian yang akan digunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="bg-white dark:bg-zinc-900">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     {RESEARCH_MODELS.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                           {model.name}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               {selectedModel === "custom" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div className="space-y-2">
                        <Label htmlFor="custom-model-name">Nama Model Penelitian</Label>
                        <Input
                           id="custom-model-name"
                           value={customModelName}
                           onChange={(e) => setCustomModelName(e.target.value)}
                           onBlur={() => onModelChange?.("custom", customModelName, customModelDesc)}
                           placeholder="Masukkan nama model penelitian..."
                           className="bg-white dark:bg-zinc-900"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="custom-model-desc">Deskripsi (Opsional)</Label>
                        <Textarea
                           id="custom-model-desc"
                           value={customModelDesc}
                           onChange={(e) => setCustomModelDesc(e.target.value)}
                           onBlur={() => onModelChange?.("custom", customModelName, customModelDesc)}
                           placeholder="Jelaskan model penelitian custom Anda..."
                           className="bg-white dark:bg-zinc-900 min-h-[100px]"
                        />
                     </div>
                  </div>
               )}

               <div className="p-4 bg-white/60 dark:bg-zinc-900/60 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                     {selectedModel === "custom" && customModelDesc
                        ? customModelDesc
                        : currentModel?.description}
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
