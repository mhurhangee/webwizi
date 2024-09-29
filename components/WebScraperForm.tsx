'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from "@/components/ThemeToggle"

interface ErrorDetails {
  status?: number;
  statusText?: string;
  url?: string;
  message?: string;
  stack?: string;
}

export default function WebScraperForm() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<{ message: string; details: ErrorDetails } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape the webpage')
      }

      setResult(data.content)
    } catch (err) {
      if (err instanceof Error) {
        setError({ 
          message: err.message, 
          details: (err as any).details || {} 
        })
      } else {
        setError({ 
          message: 'An unknown error occurred', 
          details: {} 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <CardHeader>
          <CardTitle>Simple Web Scraper</CardTitle>
          <CardDescription>Enter a URL to retrieve its HTML content</CardDescription>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Scrape'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <h3 className="text-lg font-semibold mb-2">Results:</h3>
          <div className="w-full space-y-2">
            {error && (
              <div className="p-2 bg-destructive/15 text-destructive rounded">
                <p><strong>Error:</strong> {error.message}</p>
                {Object.entries(error.details).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {value}</p>
                ))}
              </div>
            )}
            {result && (
              <div className="p-2 bg-muted rounded">
                <strong>Scraped HTML Content:</strong>
                <pre className="mt-2 whitespace-pre-wrap break-words">{result}</pre>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}