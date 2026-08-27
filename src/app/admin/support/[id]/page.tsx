'use client'

import { useParams } from 'next/navigation'
import { SupportInbox } from '@/components/admin/support-inbox'

export default function AdminSupportThreadPage() {
  const params = useParams<{ id: string }>()
  const conversationId = Number(params?.id)
  return <SupportInbox initialConversationId={Number.isFinite(conversationId) ? conversationId : undefined} />
}
