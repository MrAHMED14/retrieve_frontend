"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { File, FileText, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

type DocumentInfo = {
  id: string
  filename: string
}

export function DocumentList() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, startTransition] = useTransition()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000"}/files`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch documents")
      }

      const data = await response.json()
      setDocuments(data.files)
    } catch (error) {
      console.error("Error fetching documents:", error)

      toast.error("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000"
          }/remove-file/${id}`,
          {
            method: "DELETE",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to delete document")
        }

        setDocuments(documents.filter((doc) => doc.id !== id))

        toast.success("Document deleted", {
          description: "The selected document has been successfully removed.",
        })
      } catch (error) {
        console.error("Error deleting document:", error)
        toast.error("Failed to delete document")
      }
    })
  }

  const handleDeleteAllFiles = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000"
          }/remove-all-files`,
          {
            method: "DELETE",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to delete document")
        }

        setDocuments([])

        toast.success("All documents deleted", {
          description: "All documents have been successfully removed.",
        })
      } catch (error) {
        console.error("Error deleting document:", error)
        toast.error("Failed to delete document")
      }
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading documents...</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">No documents found</p>
        <Link href="/">
          <Button>Upload Documents</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="">
      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => ( 
          <Card key={doc.id} className="sm:max-h-[120px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {doc.filename.endsWith(".pdf") ? (
                  <File className="h-5 w-5 text-red-500" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-500" />
                )}
                <span className="line-clamp-2">{doc.filename}</span>
              </CardTitle>
              <Button
                variant="outline"
                disabled={isDeleting}
                size="sm"
                onClick={() => handleDelete(doc.id)}
                className="text-destructive mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button
          className="text-white bg-destructive dark:bg-red-600 hover:bg-destructive/90"
          disabled={isDeleting}
          onClick={handleDeleteAllFiles}
        >
          <Trash2 className="h-4 w-4 mr-2" /> 
          Delete All Files
        </Button>
      </div>
    </div>
  )
}
