import { EventEmitter } from "events";

export interface RealtimeEventPayload<T = any> {
    type: string;
    target?: {
        users?: string[];      // Target specific usernames (e.g. NIM / NIP)
        roles?: string[];      // Target specific roles (e.g. 'student', 'lecturer', 'staff')
        broadcast?: boolean;   // Send to all connected users
    };
    payload: T;
    timestamp?: string;
}

const globalForRealtime = globalThis as unknown as {
    realtimeEventBus?: EventEmitter;
};

// Central Event Bus singleton across hot-reloads in development
export const realtimeEventBus = globalForRealtime.realtimeEventBus ?? new EventEmitter();

// Allow sufficient concurrent listeners for active user connections
realtimeEventBus.setMaxListeners(500);

if (process.env.NODE_ENV !== "production") {
    globalForRealtime.realtimeEventBus = realtimeEventBus;
}

/**
 * Publish a realtime event to be pushed via Global SSE
 */
export function publishRealtimeEvent<T = any>(event: RealtimeEventPayload<T>): void {
    const enrichedEvent: RealtimeEventPayload<T> = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
    };

    realtimeEventBus.emit("realtime-event", enrichedEvent);
}
