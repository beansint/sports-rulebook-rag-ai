import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

type ErrorContext = { requestId?: string; step?: string };

export function errorResponse(error: unknown, ctx?: ErrorContext) {
  const tag = ctx?.requestId ? `[${ctx.requestId}]` : "[req]";
  const at = ctx?.step ? ` at ${ctx.step}` : "";

  if (error instanceof HttpError) {
    console.error(`${tag}${at}: HttpError ${error.status}`, error.message, error.details ?? "");
    return NextResponse.json(
      { error: error.message, details: error.details, ...(ctx?.requestId && { requestId: ctx.requestId }) },
      { status: error.status },
    );
  }

  console.error(`${tag}${at}: Unhandled error`, error);
  return NextResponse.json(
    { error: "Internal server error", ...(ctx?.requestId && { requestId: ctx.requestId }) },
    { status: 500 },
  );
}
