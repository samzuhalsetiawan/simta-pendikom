import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { realtimeEventBus, RealtimeEventPayload } from "@/lib/realtime/event-bus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch (err) {
        console.warn("SSE: Failed to get session", err);
    }

    const currentUsername = session?.user?.username || null;
    const currentRole = session?.user?.role || null;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Send initial connection confirmation event
            controller.enqueue(
                encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", timestamp: new Date().toISOString() })}\n\n`)
            );

            // Event listener for Realtime Event Bus
            const handleEvent = (event: RealtimeEventPayload) => {
                try {
                    // Check targeting criteria
                    const target = event.target;
                    let shouldDeliver = false;

                    if (!target || target.broadcast) {
                        shouldDeliver = true;
                    } else {
                        if (target.users && currentUsername && target.users.includes(currentUsername)) {
                            shouldDeliver = true;
                        }
                        if (target.roles && currentRole && target.roles.includes(currentRole)) {
                            shouldDeliver = true;
                        }
                    }

                    if (shouldDeliver) {
                        const ssePayload = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
                        controller.enqueue(encoder.encode(ssePayload));
                    }
                } catch (e) {
                    console.error("SSE: Error dispatching event to client", e);
                }
            };

            realtimeEventBus.on("realtime-event", handleEvent);

            // Heartbeat keep-alive every 25 seconds to keep proxies and firewalls open
            // SSE comment syntax (:keepalive\n\n) does not trigger client message handlers
            const heartbeatInterval = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(":keepalive\n\n"));
                } catch {
                    cleanup();
                }
            }, 25000);

            let isCleanedUp = false;
            const cleanup = () => {
                if (isCleanedUp) return;
                isCleanedUp = true;
                clearInterval(heartbeatInterval);
                realtimeEventBus.off("realtime-event", handleEvent);
                try {
                    controller.close();
                } catch {}
            };

            request.signal.addEventListener("abort", cleanup);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
