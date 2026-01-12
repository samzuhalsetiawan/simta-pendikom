import { ClientProvider } from './client-provider'
import { SWRProvider } from './swr/swr-provider'

export async function Provider({ children }: { children: React.ReactNode }) {
   return (
      <SWRProvider>
         <ClientProvider>
            {children}
         </ClientProvider>
      </SWRProvider>
   )
}
