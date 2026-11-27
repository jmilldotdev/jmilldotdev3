import nextWorker from "./.open-next/worker.js";

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === "jmill.dev") {
      return new Response(null, {
        status: 307,
        headers: {
          location: `https://www.jmill.dev${url.pathname}${url.search}`,
          "x-jmill-worker": "jmill-dev",
        },
      });
    }
    return nextWorker.fetch(request, env, ctx);
  },
};
