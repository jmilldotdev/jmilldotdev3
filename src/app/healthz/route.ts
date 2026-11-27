export function GET() {
  return new Response("jmill-dev-ready\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
