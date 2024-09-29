import { NextResponse } from 'next/server'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'

// Make sure to set this environment variable in your .env.local file
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const extractedInfoSchema = z.object({
  extractedInfo: z.object({
    extractedData: z.array(z.object({
      key: z.string(),
      value: z.string(),
    })).describe('Extracted key-value pairs according to the user\'s request.'),
  }).describe('The structured extracted information from the HTML content'),
})

export async function POST(req: Request) {
  const { url, extractionRequest } = await req.json()

  if (!url || !extractionRequest) {
    return NextResponse.json({ error: 'URL and extraction request are required' }, { status: 400 })
  }

  try {
    // Reuse the existing scrape API
    const scrapeResponse = await fetch(`${BASE_URL}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!scrapeResponse.ok) {
      throw new Error('Failed to scrape the webpage')
    }

    const { content: scrapedHtml } = await scrapeResponse.json()

    const { object, usage } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: extractedInfoSchema,
      prompt: `HTML Content: ${scrapedHtml}\n\nExtraction Request: ${extractionRequest}\n\nPlease extract the requested information from the provided HTML and structure it as key-value pairs according to the given schema. Each key-value pair should represent a piece of information requested by the user.`,
    })

    console.log('Extracted information (key-value pairs):', object)
    console.log('Usage:', usage)

    // Calculate total token usage
    const totalTokens = usage.totalTokens

    return NextResponse.json({ extractedInfo: object.extractedInfo, totalTokens })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to scrape and extract information' }, { status: 500 })
  }
}