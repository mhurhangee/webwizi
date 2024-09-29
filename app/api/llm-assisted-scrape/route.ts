import { NextResponse } from 'next/server'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'

// Make sure to set this environment variable in your .env.local file
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

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

    const { text, usage } = await generateText({
      model: openai('gpt-4o-mini'),
      maxSteps: 2,
      tools: {
        extract_information: tool({
          description: 'Extract specific information from the provided HTML based on the user\'s request',
          parameters: z.object({
            extractedInfo: z.string().describe('The extracted information from the HTML content'),
          }),
          execute: async ({ extractedInfo }) => extractedInfo,
        }),
      },
      prompt: `HTML Content: ${scrapedHtml}\n\nExtraction Request: ${extractionRequest}\n\nPlease extract the requested information from the provided HTML.`,
    })

    console.log('Extracted information:', text)
    console.log('Usage:', usage)

    // Parse the text as JSON
    let extractedInfo
    try {
      extractedInfo = JSON.parse(text)
    } catch (e) {
      extractedInfo = text // Fallback to the raw text if it's not a valid JSON
    }

    // Calculate total token usage
    const totalTokens = usage.totalTokens

    return NextResponse.json({ extractedInfo, totalTokens })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to scrape and extract information' }, { status: 500 })
  }
}