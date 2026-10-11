// Vercel Serverless Function Proxy for Buffer GraphQL API
export default async function handler(req, res) {
  // Handle CORS Preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const token = process.env.BUFFER_API_KEY || "iZiikjxlhIzEzzUr3wvSy_FYaBBz3bvkuZzcLFOnCtr";
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});

    const bufferRes = await fetch("https://api.buffer.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body
    });

    const data = await bufferRes.json();
    return res.status(bufferRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
