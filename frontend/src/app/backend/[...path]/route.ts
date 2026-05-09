import { NextRequest, NextResponse } from "next/server";

function getBackendApiBaseUrl() {
  const configuredUrl =
    process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (
    configuredUrl?.startsWith("http://") ||
    configuredUrl?.startsWith("https://")
  ) {
    return configuredUrl.replace(/\/$/, "");
  }

  return "http://127.0.0.1:8000";
}

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

type BackendRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function copyForwardHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  return headers;
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers(response.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  return headers;
}

async function proxyBackendRequest(
  request: NextRequest,
  context: BackendRouteContext,
) {
  const { path } = await context.params;
  const targetUrl = new URL(path.join("/"), `${getBackendApiBaseUrl()}/`);
  targetUrl.search = request.nextUrl.search;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: copyForwardHeaders(request),
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: copyResponseHeaders(response),
    });
  } catch {
    return NextResponse.json(
      {
        backend_unavailable: true,
        detail:
          "Backend API is not reachable. Start FastAPI on http://127.0.0.1:8000.",
      },
      { status: 200 },
    );
  }
}

export async function GET(request: NextRequest, context: BackendRouteContext) {
  return proxyBackendRequest(request, context);
}

export async function POST(request: NextRequest, context: BackendRouteContext) {
  return proxyBackendRequest(request, context);
}

export async function PATCH(request: NextRequest, context: BackendRouteContext) {
  return proxyBackendRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: BackendRouteContext,
) {
  return proxyBackendRequest(request, context);
}
