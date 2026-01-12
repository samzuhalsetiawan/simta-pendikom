"use client";

import { Event } from "@/types/event";
import { useEffect } from "react";

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


export function logger(useSWRNext: any) {
  "use client"
  return (key: any, fetcher: any, config: any) => {
    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      if (key) {
        console.log(`%c SWR Request: ${key}`, "color: blue; font-weight: bold");
        console.log("Status:", swr.data ? "Menggunakan Cache" : "Fetch Baru");
      }
    }, [key, swr.data]);

    return swr;
  };
}