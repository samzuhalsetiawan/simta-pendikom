"use client"

import { getWeeksInRange } from "@/lib/utils";
import { Event } from "@/types/event/event";
import { eachWeekOfInterval, endOfISOWeek, endOfMonth, format, startOfISOWeek, startOfMonth } from "date-fns";
import { useMemo } from "react";
import useSWR from "swr"

export function useEventData(
   from: Date,
   to: Date,
   config?: Parameters<typeof useSWR<Event[]>>[2]
) {
   const urls = useMemo(() => {
      const weeks = getWeeksInRange(from, to);
      return weeks.map(week => `/api/events?from=${week.start}&to=${week.end}`);
   }, [from, to]);
   const { data, error, isLoading, mutate } = useSWR<Event[]>(urls, config);

  return {
      events: data,
      isLoading,
      isError: error,
      mutate,
  }
}