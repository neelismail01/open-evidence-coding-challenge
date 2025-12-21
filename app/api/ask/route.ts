import { NextResponse } from 'next/server';
import { getLLMResponse, getLLMResponseStream } from '@/server/openai_manager';

export async function POST(request: Request) {
  const { question, history, stream } = await request.json();

  if (stream) {
    try {
      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of getLLMResponseStream(question, history)) {
              const data = JSON.stringify({ content: chunk });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error: any) {
            const errorData = JSON.stringify({ error: error.message });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    try {
      const answer = await getLLMResponse(question, history);
      return NextResponse.json({ answer });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
