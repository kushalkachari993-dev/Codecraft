export function GET(request: Request) {
  const faviconUrl = new URL("/favicon.svg", request.url);

  return new Response(null, {
    status: 308,
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      location: faviconUrl.toString(),
    },
  });
}
