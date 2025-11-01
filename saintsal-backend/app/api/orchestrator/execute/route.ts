import { NextResponse } from 'next/server';

// Tell Next.js to run this on the edge runtime so we can stream responses.
export const runtime = 'edge';

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          JSON.stringify({ status: 'connected', message: 'SaintSal orchestrator online' }) + '\n'
        )
      );

      try {
        // Parse the request body (if any)
        let body = {};
        try {
          body = await req.json();
        } catch {
          body = {};
        }

        // TODO: Insert your orchestration logic here.
        // For now, echo back the received payload with a timestamp.
        const response = {
          ok: true,
          timestamp: new Date().toISOString(),
          received: body,
        };

        controller.enqueue(encoder.encode(JSON.stringify(response) + '\n'));
      } catch (err: any) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: err.message }) + '\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
