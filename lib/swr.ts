"use client";

import { useEffect } from "react";




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