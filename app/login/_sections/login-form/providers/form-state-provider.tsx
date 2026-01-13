"use client"

import { useState } from "react";
import { FormStateContext } from "./form-state-context";

type FormStateProviderProps = {
   children: React.ReactNode;
};

export function FormStateProvider({
   children
}: FormStateProviderProps) {
   const [isLoading, setIsLoading] = useState(false);

   return (
      <FormStateContext value={{ isLoading, setIsLoading }}>
         {children}
      </FormStateContext>
   )
}