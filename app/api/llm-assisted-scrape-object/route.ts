import { NextResponse } from 'next/server'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'

// Make sure to set this environment variable in your .env.local file
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const extractedInfoSchema = z.object({
  extractedInfo: z.object({
    title: z.string().describe('The title of the webpage'),
    mainContent: z.string().describe('The main content or summary of the webpage'),
    headings: z.array(z.string()).describe('An array of important headings found on the page'),
    links: z.array(z.object({
      text: z.string(),
      url: z.string(),
    })).describe('An array of important links found on the page'),
    metadata: z.object({
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      author: z.string().optional(),
    }).describe('Metadata information about the webpage'),
    pageSummary: z.string().optional().describe('A summary of the page'),
    userRequestedInfo: z.array(z.string()).describe('An array of information specifically user\'s request'),
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
      prompt: `HTML Content: ${scrapedHtml}\n\nExtraction Request: ${extractionRequest}\n\nPlease extract the requested information from the provided HTML and structure it according to the given schema. For the customData field, include any additional information specifically requested by the user that doesn't fit into the other categories. If there's no specific custom data to extract, you can omit this field.`,
    })

    console.log('Extracted information (object):', object)
    console.log('Usage:', usage)

    // Calculate total token usage
    const totalTokens = usage.totalTokens

    return NextResponse.json({ extractedInfo: object.extractedInfo, totalTokens })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to scrape and extract information' }, { status: 500 })
  }
}