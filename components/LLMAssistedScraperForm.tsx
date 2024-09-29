'use client'

import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LLMAssistedScraperForm() {
  const [url, setUrl] = useState('')
  const [extractionRequest, setExtractionRequest] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [textResult, setTextResult] = useState<any | null>(null)
  const [objectResult, setObjectResult] = useState<any | null>(null)
  const [kvResult, setKvResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [textTokens, setTextTokens] = useState<number | null>(null)
  const [objectTokens, setObjectTokens] = useState<number | null>(null)
  const [kvTokens, setKvTokens] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setTextResult(null)
    setObjectResult(null)
    setKvResult(null)
    setError(null)
    setTextTokens(null)
    setObjectTokens(null)
    setKvTokens(null)

    try {
      // Call generateText API
      const textResponse = await fetch('/api/llm-assisted-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, extractionRequest }),
      })

      if (!textResponse.ok) throw new Error('Failed to scrape and extract information (text)')
      const textData = await textResponse.json()
      if (textData.error) throw new Error(textData.error)
      setTextResult(textData.extractedInfo)
      setTextTokens(textData.totalTokens)

      // Call generateObject API
      const objectResponse = await fetch('/api/llm-assisted-scrape-object', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, extractionRequest }),
      })

      if (!objectResponse.ok) throw new Error('Failed to scrape and extract information (object)')
      const objectData = await objectResponse.json()
      if (objectData.error) throw new Error(objectData.error)
      setObjectResult(objectData.extractedInfo)
      setObjectTokens(objectData.totalTokens)

      // Call new key-value API
      const kvResponse = await fetch('/api/llm-assisted-scrape-kv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, extractionRequest }),
      })

      if (!kvResponse.ok) throw new Error('Failed to scrape and extract information (key-value)')
      const kvData = await kvResponse.json()
      if (kvData.error) throw new Error(kvData.error)
      setKvResult(kvData.extractedInfo)
      setKvTokens(kvData.totalTokens)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>LLM-Assisted Web Scraper</CardTitle>
        <CardDescription>Enter a URL and describe what you want to extract</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">URL to scrape</label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="extractionRequest" className="text-sm font-medium">What to extract</label>
            <Textarea
              id="extractionRequest"
              placeholder="Describe what information you want to extract"
              value={extractionRequest}
              onChange={(e) => setExtractionRequest(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              'Scrape and Extract'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <h3 className="text-lg font-semibold mb-2">Results:</h3>
        {error && (
          <div className="p-2 bg-destructive/15 text-destructive rounded w-full">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        {(textResult || objectResult || kvResult) && (
          <Tabs defaultValue="text" className="w-full">
            <TabsList>
              <TabsTrigger value="text">Text Result</TabsTrigger>
              <TabsTrigger value="object">Object Result</TabsTrigger>
              <TabsTrigger value="kv">Key-Value Result</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <div className="p-2 bg-muted rounded w-full">
                <strong>Extracted Information (Text):</strong>
                <pre className="mt-2 whitespace-pre-wrap break-words">{JSON.stringify(textResult, null, 2)}</pre>
                {textTokens !== null && (
                  <p className="mt-2"><strong>Total Tokens Used:</strong> {textTokens}</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="object">
              <div className="p-2 bg-muted rounded w-full">
                <strong>Extracted Information (Object):</strong>
                <pre className="mt-2 whitespace-pre-wrap break-words">{JSON.stringify(objectResult, null, 2)}</pre>
                {objectTokens !== null && (
                  <p className="mt-2"><strong>Total Tokens Used:</strong> {objectTokens}</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="kv">
              <div className="p-2 bg-muted rounded w-full">
                <strong>Extracted Information (Key-Value Pairs):</strong>
                <pre className="mt-2 whitespace-pre-wrap break-words bg-muted p-2 rounded">
                    {JSON.stringify(kvResult, null, 2)}
                  </pre>
                {kvResult && kvResult.extractedData && (
                  <div className="mt-2">
                    {kvResult.extractedData.map((item: { key: string | null; value: string | null }, index: Key | null | undefined) => (
                      <div key={index} className="mb-2">
                        <strong>{item.key}:</strong> {item.value}
                      </div>
                    ))}
                  </div>
                )}
                {kvTokens !== null && (
                  <p className="mt-2"><strong>Total Tokens Used:</strong> {kvTokens}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardFooter>
    </Card>
  )
}