export async function POST(req: Request) {
  const { query } = await req.json()

  if (!process.env.SERPER_API_KEY) {
    return Response.json(
      { error: 'Search API not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 5,
      }),
    })

    if (!response.ok) {
      throw new Error('Search request failed')
    }

    const data = await response.json()
    
    // Format search results
    const results = data.organic?.slice(0, 5).map((result: {
      title: string
      link: string
      snippet: string
    }) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    })) || []

    return Response.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return Response.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}
