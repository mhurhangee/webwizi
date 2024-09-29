import WebScraperForm from '@/components/WebScraperForm'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-between">
      <h2 className="text-2xl font-bold mb-6">Simple Web Scraper</h2>
      <WebScraperForm />
    </div>
  )
}