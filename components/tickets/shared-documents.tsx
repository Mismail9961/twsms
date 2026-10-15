'use client'

import { useState } from 'react'
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import type { Role, TicketAttachment } from '@/lib/types'

const MAX_FILE_SIZE = 4 * 1024 * 1024

function formatAttachmentDate(date: string): string {
  return `${new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(date))} UTC`
}

interface SharedDocumentsProps {
  ticketId: string
  initialAttachments: TicketAttachment[]
  currentUserId: string
  userRole: Role
}

export function SharedDocuments({
  ticketId,
  initialAttachments,
  currentUserId,
  userRole,
}: SharedDocumentsProps) {
  const [attachments, setAttachments] = useState(initialAttachments)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const [error, setError] = useState('')

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    setSelectedFiles(files)
    setUploadStatus('')
    setError('')
  }

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedFiles.length === 0 || isUploading) return

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_FILE_SIZE)
    if (oversizedFile) {
      setError(`${oversizedFile.name} is larger than the 4 MB upload limit.`)
      return
    }

    setIsUploading(true)
    setError('')
    setUploadStatus('')

    try {
      for (const [index, file] of selectedFiles.entries()) {
        setUploadStatus(`Sharing file ${index + 1} of ${selectedFiles.length}...`)
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
          method: 'POST',
          body: formData,
        })
        const result = (await response.json().catch(() => null)) as
          | { attachment?: TicketAttachment; error?: string }
          | null

        const uploadedAttachment = result?.attachment
        if (!response.ok || !uploadedAttachment) {
          throw new Error(result?.error || `Could not upload ${file.name}. Please try again.`)
        }

        setAttachments((current) => [uploadedAttachment, ...current])
        setSelectedFiles((current) => current.filter((selectedFile) => selectedFile !== file))
      }

      setSelectedFiles([])
      setUploadStatus('Files shared successfully.')
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'The files could not be shared. Please try again.'
      )
      setUploadStatus('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (attachment: TicketAttachment) => {
    if (
      deletingAttachmentId ||
      !window.confirm(`Delete "${attachment.original_filename}" from this ticket?`)
    ) {
      return
    }

    setDeletingAttachmentId(attachment.id)
    setError('')
    setUploadStatus('')

    try {
      const response = await fetch(`/api/attachments/${attachment.id}`, {
        method: 'DELETE',
      })
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(result?.error || 'The file could not be deleted. Please try again.')
      }

      setAttachments((current) => current.filter((item) => item.id !== attachment.id))
      setUploadStatus('File deleted successfully.')
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'The file could not be deleted. Please try again.'
      )
    } finally {
      setDeletingAttachmentId('')
    }
  }

  return (
    <section
      aria-labelledby="shared-documents-heading"
      className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            id="shared-documents-heading"
            className="text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Shared Documents &amp; Files ({attachments.length})
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Share files securely with everyone on this ticket.
          </p>
        </div>
        <Paperclip className="h-4 w-4 shrink-0 text-[#2C2772]" aria-hidden="true" />
      </div>

      <form onSubmit={handleUpload} className="space-y-3 rounded-xl border border-dashed border-[#2C2772]/25 bg-[#2C2772]/[0.03] p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-h-10 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-[#2C2772]">
            <Upload className="h-4 w-4 shrink-0 text-[#2C2772]" aria-hidden="true" />
            <span className="truncate">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} selected`
                : 'Choose documents or files'}
            </span>
            <input
              type="file"
              multiple
              disabled={isUploading}
              onChange={handleFilesSelected}
              className="sr-only"
              aria-label="Choose documents or files to share"
            />
          </label>
          <button
            type="submit"
            disabled={selectedFiles.length === 0 || isUploading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#2C2772] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#231f5c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            {isUploading ? 'Sharing...' : 'Share files'}
          </button>
        </div>
        {selectedFiles.length > 0 && (
          <p className="break-all text-xs text-slate-600">
            {selectedFiles.map((file) => file.name).join(', ')}
          </p>
        )}
        <p className="text-[11px] text-slate-500">Each file can be up to 4 MB.</p>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {uploadStatus && (
          <p role="status" aria-live="polite" className="text-xs font-medium text-[#2C2772]">
            {uploadStatus}
          </p>
        )}
      </form>

      {attachments.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-center">
          <FileText className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
          <p className="mt-2 text-xs text-slate-500">No files shared yet.</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Choose a document or file above to share it with this ticket.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 transition-colors hover:border-[#2C2772]/30 hover:bg-[#2C2772]/[0.03]">
                <a
                  href={`/api/attachments/${attachment.id}`}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-[#2C2772]" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-gray-900">
                        {attachment.original_filename}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-gray-500">
                        {formatFileSize(attachment.file_size)}
                        {attachment.uploader?.full_name
                          ? ` · Shared by ${attachment.uploader.full_name}`
                          : ''}
                        {` · ${formatAttachmentDate(attachment.created_at)}`}
                      </span>
                    </span>
                  </span>
                  <Download className="h-4 w-4 shrink-0 text-gray-400" aria-label="Download" />
                </a>
                {userRole === 'client' && attachment.uploader_id === currentUserId && (
                  <button
                    type="button"
                    disabled={Boolean(deletingAttachmentId)}
                    onClick={() => void handleDelete(attachment)}
                    aria-label={`Delete ${attachment.original_filename}`}
                    title="Delete your shared file"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingAttachmentId === attachment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
