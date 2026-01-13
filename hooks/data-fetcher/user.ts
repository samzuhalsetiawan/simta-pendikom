"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Student } from "@/types/user/student";
import { Lecturer } from "@/types/user/lecturer";

type UserDetail = Student | Lecturer;

const fetcher = async (url: string): Promise<UserDetail> => {
   const response = await fetch(url);
   if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
   }
   return response.json();
};

export function useUserDetail(config?: Parameters<typeof useSWR<UserDetail>>[2]) {
   const { data: session, status } = useSession();

   // Determine the endpoint based on role
   const endpoint =
      session?.user?.role === "student"
         ? `/api/students/${session?.user?.id}`
         : `/api/lecturers/${session?.user?.id}`;

   // Only fetch if session is authenticated
   const key = status === "authenticated" ? endpoint : null;

   const { data, error, isLoading, mutate } = useSWR<UserDetail>(
      key,
      fetcher,
      {
         revalidateOnFocus: false,
         dedupingInterval: 60000, // 1 minute
         ...config,
      }
   );

   return {
      user: data,
      isLoading: status === "loading" || isLoading,
      isError: error,
      mutate,
   };
}
