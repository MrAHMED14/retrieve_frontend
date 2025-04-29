"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { File, FileText, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type SearchResult = {
  id: string
  filename: string
  snippet: string
  score: number 
}

export function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q")

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch( 
          `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000"}/search?query=${encodeURIComponent(query)}`,
          {
            method: "POST",
            headers: {
              "accept": "application/json",
            },
          }
        ) 
        
        if (!response.ok) {
          throw new Error("Search failed")
        }

        const data = await response.json()
        setResults(data.results)
      } catch (err) {
        console.error("Search error:", err)
        setError("No documents are currently indexed.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const date = new Date()
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (!query) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Enter a search query to find documents
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Searching documents...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents found matching &quot;{query}&quot;
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {results.length} result{results.length !== 1 ? "s" : ""} for
        &quot;{query}&quot;
      </p>

      {results.map((result) => (
        <Card key={result.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {result.filename.endsWith(".pdf") ? (
                  <File className="h-5 w-5 text-red-500" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-500" />
                )}
                <CardTitle className="text-lg">{result.filename}</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                Score: {result.score.toFixed(3)}
              </Badge>
            </div>
            <CardDescription>Last modified: {formattedDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="line-clamp-3" dangerouslySetInnerHTML={{ __html: result.snippet }}></p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
