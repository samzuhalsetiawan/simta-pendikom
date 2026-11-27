"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

type EventCallback<T = any> = (payload: T) => void;

interface RealtimeContextValue {
    isConnected: boolean;
    subscribe: <T = any>(eventType: string, callback: EventCallback<T>) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const listenersRef = useRef<Map<string, Set<EventCallback>>>(new Map());
    const eventSourceRef = useRef<EventSource | null>(null);
    const activeEventTypesRef = useRef<Set<string>>(new Set());

    // Helper to attach an event listener to the active EventSource
    const attachEventListener = useCallback((es: EventSource, eventType: string) => {
        const handler = (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                const callbacks = listenersRef.current.get(eventType);
                if (callbacks) {
                    callbacks.forEach((cb) => {
                        try {
                            cb(data);
                        } catch (err) {
                            console.error(`Realtime error in callback for "${eventType}":`, err);
                        }
                    });
                }
            } catch (err) {
                console.error(`Realtime failed to parse event data for "${eventType}":`, err);
            }
        };

        es.addEventListener(eventType, handler);
    }, []);

    useEffect(() => {
        let isMounted = true;
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            if (typeof window === "undefined") return;

            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            const es = new EventSource("/api/realtime/sse");
            eventSourceRef.current = es;

            es.onopen = () => {
                if (isMounted) setIsConnected(true);
            };

            es.addEventListener("connected", () => {
                if (isMounted) setIsConnected(true);
            });

            // Attach listeners for all currently registered event types
            listenersRef.current.forEach((_, eventType) => {
                attachEventListener(es, eventType);
                activeEventTypesRef.current.add(eventType);
            });

            es.onerror = () => {
                if (isMounted) setIsConnected(false);
                // If browser closed the connection, attempt reconnect
                if (es.readyState === EventSource.CLOSED) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = setTimeout(() => {
                        if (isMounted) connect();
                    }, 3500);
                }
            };
        };

        connect();

        return () => {
            isMounted = false;
            clearTimeout(reconnectTimer);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            activeEventTypesRef.current.clear();
        };
    }, [attachEventListener]);

    const subscribe = useCallback(<T = any>(eventType: string, callback: EventCallback<T>) => {
        if (!listenersRef.current.has(eventType)) {
            listenersRef.current.set(eventType, new Set());
        }
        listenersRef.current.get(eventType)!.add(callback as EventCallback);

        // If the EventSource is already active and haven't registered this event yet, attach now
        if (eventSourceRef.current && !activeEventTypesRef.current.has(eventType)) {
            attachEventListener(eventSourceRef.current, eventType);
            activeEventTypesRef.current.add(eventType);
        }

        return () => {
            const callbacks = listenersRef.current.get(eventType);
            if (callbacks) {
                callbacks.delete(callback as EventCallback);
                if (callbacks.size === 0) {
                    listenersRef.current.delete(eventType);
                }
            }
        };
    }, [attachEventListener]);

    return (
        <RealtimeContext.Provider value={{ isConnected, subscribe }}>
            {children}
        </RealtimeContext.Provider>
    );
}

/**
 * Hook to subscribe to a specific realtime server-sent event.
 * Automatically unsubscribes on unmount.
 */
export function useRealtimeEvent<T = any>(
    eventType: string,
    callback: EventCallback<T>,
    deps: React.DependencyList = []
) {
    const context = useContext(RealtimeContext);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!context) return;

        const unsubscribe = context.subscribe<T>(eventType, (payload) => {
            callbackRef.current(payload);
        });

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context, eventType, ...deps]);
}
