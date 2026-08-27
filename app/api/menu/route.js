// Proxies menu requests to the FastAPI backend (app/main.py). Keeping this
// as a thin pass-through means the browser only ever talks same-origin to
// Next.js, and the FastAPI URL never has to be exposed to the client.
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8001";

// Dining halls run on Eastern time regardless of where the server (or its
// UTC clock) actually is, so "today" has to be computed in that zone —
// Date.toISOString() would return UTC's date and roll over ~4-5 hours early.
function todayInEastern() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(new Date());
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hall = searchParams.get("hall");
  const meal = searchParams.get("meal");
  const date = searchParams.get("date") ?? todayInEastern();
  const allergens = searchParams.get("allergens");

  if (!hall || !meal) {
    return Response.json(
      { error: "hall and meal query params are required" },
      { status: 400 }
    );
  }

  const upstream = new URL("/menu", FASTAPI_URL);
  upstream.searchParams.set("hall", hall);
  upstream.searchParams.set("meal", meal);
  upstream.searchParams.set("date", date);
  if (allergens) upstream.searchParams.set("allergens", allergens);

  let upstreamRes;
  try {
    upstreamRes = await fetch(upstream, { cache: "no-store" });
  } catch (err) {
    return Response.json(
      { error: "Could not reach menu backend" },
      { status: 502 }
    );
  }

  if (!upstreamRes.ok) {
    const detail = await upstreamRes.json().catch(() => null);
    return Response.json(
      { error: detail?.detail ?? "Failed to load menu" },
      { status: upstreamRes.status }
    );
  }

  const items = await upstreamRes.json();
  return Response.json({ items });
}
