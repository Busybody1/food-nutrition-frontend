export type SupportStatus = 'open' | 'waiting_on_admin' | 'waiting_on_user' | 'closed'
export type SupportSenderRole = 'user' | 'admin' | 'system'

export interface SupportMessage {
  id: number
  conversation_id: number
  sender_role: SupportSenderRole
  sender_user_id: number | null
  body: string
  attachment_url: string | null
  attachment_content_type: string | null
  created_at: string | null
}

export interface SupportConversation {
  id: number
  user_id: number
  status: SupportStatus
  assigned_admin_user_id: number | null
  last_message_at: string | null
  last_message_preview: string | null
  last_sender_role: SupportSenderRole | null
  user_last_read_at: string | null
  admin_last_read_at: string | null
  created_at: string | null
  updated_at: string | null
  closed_at: string | null
  unread_count: number
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  plan_name?: string | null
  assigned_admin_email?: string | null
  assigned_admin_first_name?: string | null
  assigned_admin_last_name?: string | null
}

export interface SupportConversationPayload {
  conversation: SupportConversation | null
  messages: SupportMessage[]
}

export interface SupportMessagesPayload {
  messages: SupportMessage[]
}

export interface SupportUnreadCount {
  count: number
}

export interface SupportAttachment {
  url: string
  content_type: string
}

export interface SupportConversationListPayload {
  conversations: SupportConversation[]
  count: number
  skip: number
  limit: number
}

export interface SupportMessageInput {
  body?: string
  attachment_url?: string
  attachment_content_type?: string
}
