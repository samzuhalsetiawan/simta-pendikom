import { use } from "react";
import { FormStateContext } from "./form-state-context";

export const useFormState = () => {
   const context = use(FormStateContext);
   return context;
}