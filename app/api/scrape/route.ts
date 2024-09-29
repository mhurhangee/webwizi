import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `HTTP error! status: ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        }
      }, { status: response.status })
    }
    
    const content = await response.text()
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to scrape the webpage',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    }, { status: 500 })
  }
}