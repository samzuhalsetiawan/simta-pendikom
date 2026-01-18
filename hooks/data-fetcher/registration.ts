"use client";

import useSWR from "swr";
import { useState, useCallback } from "react";
import { registerEventAction, RegisterEventState } from "@/actions/register-event";

type RegistrationStatus = {
   isRegistered: boolean;
};

const fetcher = async (url: string): Promise<RegistrationStatus> => {
   const response = await fetch(url);
   if (!response.ok) {
      throw new Error(`Failed to fetch registration status: ${response.status}`);
   }
   return response.json();
};

export function useEventRegistration(eventId: number | null) {
   const [isRegistering, setIsRegistering] = useState(false);

   const key = eventId ? `/api/events/${eventId}/registration-status` : null;

   const { data, error, isLoading, mutate } = useSWR<RegistrationStatus>(
      key,
      fetcher,
      {
         revalidateOnFocus: false,
         dedupingInterval: 30000,
      }
   );

   const register = useCallback(async (): Promise<RegisterEventState> => {
      if (!eventId) {
         return { success: false, message: "Event ID is required" };
      }

      setIsRegistering(true);
      try {
         const result = await registerEventAction(eventId);
         if (result.success) {
            mutate({ isRegistered: true }, false);
         }
         return result;
      } finally {
         setIsRegistering(false);
      }
   }, [eventId, mutate]);

   return {
      isRegistered: data?.isRegistered ?? false,
      isLoading,
      isError: error,
      isRegistering,
      register,
      mutate,
   };
}
