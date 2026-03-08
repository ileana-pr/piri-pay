// proxy for basename API — avoids CORS (api.basename.app blocks browser requests)
// uses Vercel Web Standard (Request/Response) for reliable deploy

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.replace(/^\/api\/basename\//, '').split('/').filter(Boolean);
  const name = pathParts[0] ? decodeURIComponent(pathParts[0]) : null;

  if (!name || typeof name !== 'string') {
    return Response.json({ error: 'Missing name parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.basename.app/v1/names/${encodeURIComponent(name)}`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'Piri/1.0' },
        redirect: 'follow',
      }
    );
    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return Response.json({ error: 'Invalid response from basename API' }, { status: 502 });
    }
    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }
    return Response.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('basename proxy error:', err);
    return Response.json({ error: 'Failed to resolve .base name' }, { status: 502 });
  }
}
