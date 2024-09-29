import LLMAssistedScraperForm from '@/components/LLMAssistedScraperForm'

export default function AdvancedScraper() {
  return (
    <div className="flex flex-col items-center justify-between">
      <h2 className="text-2xl font-bold mb-6">Advanced Web Scraper</h2>
      <LLMAssistedScraperForm />
    </div>
  )
}