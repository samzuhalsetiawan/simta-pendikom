"use client"

import { getWeeksInRange } from "@/lib/utils";
import { Event } from "@/types/event/event";
import { useMemo } from "react";
import useSWR from "swr"

export const fetcher = async (urls: string[]) => {
  const results = await Promise.all(
    urls.map(async url => {
      const response = await fetch(url);
      const events = await response.json() as Event[];
      return events.map(event => ({
        ...event,
        date: new Date(event.date)
      }));
    })
  );
  return results.flat();
};

export function useEventData(
   from: Date,
   to: Date,
   config?: Parameters<typeof useSWR<Event[]>>[2]
) {
   const urls = useMemo(() => {
      const weeks = getWeeksInRange(from, to);
      return weeks.map(week => `/api/events?from=${week.start}&to=${week.end}`);
   }, [from, to]);
   const { data, error, isLoading, mutate } = useSWR<Event[]>(urls, fetcher, config);

  return {
      events: data,
      isLoading,
      isError: error,
      mutate,
  }
}