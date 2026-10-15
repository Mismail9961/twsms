import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import {
  deleteClientTicketAttachment,
  getTicketAttachmentContent,
  getTicketById,
} from '@/lib/data/tickets'

function safeContentType(mimeType: string): string {
  return /^[\w.+-]+\/[\w.+-]+$/.test(mimeType)
    ? mimeType
    : 'application/octet-stream'
}

function contentDisposition(filename: string): string {
  const fallback = filename.replace(/[^\x20-\x7e]|["\\]/g, '_')
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  )
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Please sign in to download this file.' }, { status: 401 })
  }

  const { id } = await params

  try {
    const attachment = await getTicketAttachmentContent(id)
    if (!attachment) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 })
    }

    const ticket = await getTicketById(attachment.ticketId, {
      id: session.id,
      role: session.role,
    })
    if (!ticket) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 })
    }

    const body = new ArrayBuffer(attachment.bytes.byteLength)
    new Uint8Array(body).set(attachment.bytes)

    return new NextResponse(body, {
      headers: {
        'Content-Type': safeContentType(attachment.mimeType),
        'Content-Disposition': contentDisposition(attachment.filename),
        'Content-Length': String(attachment.bytes.byteLength),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[Ticket attachment download error]:', error)
    return NextResponse.json({ error: 'The file could not be downloaded.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Please sign in to delete this file.' }, { status: 401 })
  }
  if (session.role !== 'client') {
    return NextResponse.json(
      { error: 'Only clients can delete shared files.' },
      { status: 403 }
    )
  }

  const { id } = await params

  try {
    const deleted = await deleteClientTicketAttachment(id, session.id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'File not found or you do not have permission to delete it.' },
        { status: 404 }
      )
    }

    revalidatePath(`/client/tickets/${deleted.ticketId}`)
    revalidatePath(`/employee/tickets/${deleted.ticketId}`)
    revalidatePath(`/admin/tickets/${deleted.ticketId}`)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('[Ticket attachment delete error]:', error)
    return NextResponse.json({ error: 'The file could not be deleted.' }, { status: 500 })
  }
}
