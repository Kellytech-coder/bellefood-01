const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8083/api"
).replace(/\/+$/, "");

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = `${BACKEND_API_URL}/${path.map(encodeURIComponent).join("/")}${incomingUrl.search}`;
  const headers = new Headers();

  for (const header of ["accept", "authorization", "content-type", "cookie"]) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    for (const header of ["content-type", "cache-control", "set-cookie", "location"]) {
      const value = upstream.headers.get(header);
      if (value) responseHeaders.set(header, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: "The BelleFood backend is unavailable. Check BACKEND_API_URL and confirm the backend is running." },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
