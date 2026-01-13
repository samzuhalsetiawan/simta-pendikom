import { createContext } from "react";

type FormStateContextType = {
   isLoading: boolean;
   setIsLoading: (isLoading: boolean) => void;
};

export const FormStateContext = createContext<FormStateContextType>({
   isLoading: false,
   setIsLoading: () => {},
});