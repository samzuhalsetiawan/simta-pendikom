import { logger } from "@/lib/swr"
import { SWRConfig } from "swr"

type SWRProviderProps = {
  children: React.ReactNode,
  fallback?: Record<string, any>
}

export function SWRProvider({ children, fallback }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
         revalidateOnFocus: false,
         dedupingInterval: 10000,
         fallback: fallback,
        //  use: [logger]
   }}>
      {children}
    </SWRConfig>
  )
}