import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createTicketAttachment, getTicketById } from '@/lib/data/tickets'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 64 * 1024

function sanitizeFilename(filename: string): string {
  const cleaned = filename
    .replace(/[\u0000-\u001f\u007f/\\]/g, '_')
    .trim()
  return Array.from(cleaned || 'shared-file').slice(0, 255).join('')
}

function sanitizeMimeType(mimeType: string): string {
  return /^[\w.+-]+\/[\w.+-]+$/.test(mimeType)
    ? mimeType
    : 'application/octet-stream'
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Please sign in to share a file.' }, { status: 401 })
  }

  const { id: ticketId } = await params
  const ticket = await getTicketById(ticketId, { id: session.id, role: session.role })
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      { error: 'Each file must be 4 MB or smaller.' },
      { status: 413 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'The upload form could not be read.' }, { status: 400 })
  }

  const files = formData.getAll('file')
  const file = files[0]
  if (files.length !== 1 || !(file instanceof File)) {
    return NextResponse.json({ error: 'Choose one file to upload.' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'The selected file is empty.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Each file must be 4 MB or smaller.' },
      { status: 413 }
    )
  }

  try {
    const attachment = await createTicketAttachment({
      ticketId,
      uploaderId: session.id,
      filename: sanitizeFilename(file.name),
      mimeType: sanitizeMimeType(file.type),
      bytes: new Uint8Array(await file.arrayBuffer()),
    })

    revalidatePath(`/client/tickets/${ticketId}`)
    revalidatePath(`/employee/tickets/${ticketId}`)
    revalidatePath(`/admin/tickets/${ticketId}`)

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (error) {
    console.error('[Ticket attachment upload error]:', error)
    return NextResponse.json(
      { error: 'The file could not be saved. Please try again.' },
      { status: 500 }
    )
  }
}
