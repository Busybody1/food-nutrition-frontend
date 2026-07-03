'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { adminAPI, type AdminTestimonial, type TestimonialInput } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/lib/hooks/use-admin'
import { MessageSquareQuote, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  DashboardAlert,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

const EMPTY_FORM: TestimonialInput = {
  quote: '',
  author_name: '',
  author_role: '',
  company: '',
  avatar_url: '',
  status: 'draft',
  display_order: 0,
}

export default function AdminTestimonialsPage() {
  const { hasPermission } = useAdmin()
  const canEdit = hasPermission('admin:settings:update')

  const [items, setItems] = useState<AdminTestimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState<TestimonialInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // isLoading starts true and only clears in async callbacks, so the mount
  // effect never sets state synchronously (react-hooks/set-state-in-effect).
  const load = useCallback(() => {
    adminAPI
      .getTestimonials({ limit: 200 })
      .then((d) => setItems(d.testimonials))
      .catch((e) =>
        setFeedback({
          type: 'error',
          text: e instanceof Error ? e.message : 'Failed to load testimonials',
        })
      )
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const startEdit = (item: AdminTestimonial) => {
    setEditingId(item.id)
    setForm({
      quote: item.quote,
      author_name: item.author_name,
      author_role: item.author_role ?? '',
      company: item.company ?? '',
      avatar_url: item.avatar_url ?? '',
      status: item.status,
      display_order: item.display_order,
    })
    setFeedback(null)
  }

  const save = async () => {
    if (!canEdit || !form.quote.trim() || !form.author_name.trim()) return
    setIsSaving(true)
    setFeedback(null)
    const payload: TestimonialInput = {
      ...form,
      quote: form.quote.trim(),
      author_name: form.author_name.trim(),
      author_role: form.author_role?.trim() || undefined,
      company: form.company?.trim() || undefined,
      avatar_url: form.avatar_url?.trim() || undefined,
    }
    try {
      if (editingId !== null) {
        await adminAPI.updateTestimonial(editingId, payload)
        setFeedback({ type: 'success', text: 'Testimonial updated.' })
      } else {
        await adminAPI.createTestimonial(payload)
        setFeedback({ type: 'success', text: 'Testimonial created.' })
      }
      resetForm()
      load()
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' })
    } finally {
      setIsSaving(false)
    }
  }

  const togglePublish = async (item: AdminTestimonial) => {
    if (!canEdit) return
    try {
      await adminAPI.updateTestimonial(item.id, {
        status: item.status === 'published' ? 'draft' : 'published',
      })
      load()
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'Update failed' })
    }
  }

  const remove = async (id: number) => {
    if (!canEdit) return
    try {
      await adminAPI.deleteTestimonial(id)
      setConfirmDeleteId(null)
      if (editingId === id) resetForm()
      load()
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'Delete failed' })
    }
  }

  const uploadAvatar = async (file: File) => {
    setIsUploading(true)
    setFeedback(null)
    try {
      const { url } = await adminAPI.uploadTestimonialImage(file)
      setForm((f) => ({ ...f, avatar_url: url }))
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'Image upload failed' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Testimonials"
        description="Customer quotes shown on the marketing site. Only published testimonials appear publicly; avatars are stored on S3."
      />

      {feedback && (
        <DashboardAlert variant={feedback.type === 'success' ? 'success' : 'error'}>
          {feedback.text}
        </DashboardAlert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader
            title={editingId !== null ? `Edit testimonial #${editingId}` : 'New testimonial'}
            icon={editingId !== null ? Pencil : Plus}
          />
          <AdminPanelBody className="space-y-4">
            {!canEdit && (
              <DashboardAlert variant="warning">
                You do not have permission to manage testimonials.
              </DashboardAlert>
            )}

            <div>
              <label className="text-xs font-medium text-ink-dim block mb-1.5">Quote *</label>
              <textarea
                className="w-full min-h-[110px] rounded-brand border border-surface-border/80 p-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50
                  disabled:opacity-60 disabled:bg-surface-elevated"
                placeholder="The API cut our food-logging build from months to weeks…"
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                disabled={!canEdit}
                maxLength={1000}
              />
              <p className="text-xs text-ink-muted mt-1">{form.quote.length}/1000 · minimum 10 characters</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-ink-dim block mb-1.5">Author name *</label>
                <Input
                  placeholder="Jane Doe"
                  value={form.author_name}
                  onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                  disabled={!canEdit}
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-dim block mb-1.5">Role</label>
                <Input
                  placeholder="CTO"
                  value={form.author_role ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
                  disabled={!canEdit}
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-dim block mb-1.5">Company</label>
                <Input
                  placeholder="Acme Fitness"
                  value={form.company ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  disabled={!canEdit}
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-dim block mb-1.5">Display order</label>
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, display_order: Math.max(0, Number(e.target.value) || 0) }))
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-dim block mb-1.5">Avatar</label>
              <div className="flex items-center gap-3">
                {form.avatar_url ? (
                  <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-surface-border/60">
                    <Image src={form.avatar_url} alt="Avatar preview" fill sizes="48px" className="object-cover" unoptimized />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-dim">
                    <MessageSquareQuote className="h-5 w-5" aria-hidden />
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadAvatar(file)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canEdit || isUploading}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  {isUploading ? 'Uploading…' : 'Upload image'}
                </Button>
                {form.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, avatar_url: '' }))}
                    disabled={!canEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-1.5">JPEG, PNG, WEBP, or GIF up to 5 MB. Uploaded to the shared S3 bucket.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-dim block mb-1.5">Status</label>
              <select
                className="w-full rounded-brand border border-surface-border/80 p-2.5 text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
                disabled={!canEdit}
              >
                <option value="draft">Draft (hidden from site)</option>
                <option value="published">Published (visible on site)</option>
              </select>
            </div>

            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={save}
                  disabled={isSaving || form.quote.trim().length < 10 || !form.author_name.trim()}
                >
                  {isSaving ? 'Saving…' : editingId !== null ? 'Save changes' : 'Create testimonial'}
                </Button>
                {editingId !== null && (
                  <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                    Cancel edit
                  </Button>
                )}
              </div>
            )}
          </AdminPanelBody>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title={`All testimonials (${items.length})`} icon={MessageSquareQuote} />
          <AdminPanelBody className="space-y-3 max-h-[640px] overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-ink-muted">Loading…</p>
            ) : items.length === 0 ? (
              <DashboardEmpty
                icon={MessageSquareQuote}
                title="No testimonials yet"
                description="Create the first one with the form. Only published testimonials appear on the site."
              />
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-brand border border-surface-border/60 p-4 hover:bg-surface-elevated/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {item.avatar_url ? (
                      <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-surface-border/60">
                        <Image src={item.avatar_url} alt="" fill sizes="40px" className="object-cover" unoptimized />
                      </span>
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-dim">
                        <MessageSquareQuote className="h-4 w-4" aria-hidden />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink leading-relaxed line-clamp-2">“{item.quote}”</p>
                      <p className="text-xs text-ink-muted mt-1">
                        {item.author_name}
                        {item.author_role ? `, ${item.author_role}` : ''}
                        {item.company ? `, ${item.company}` : ''} · order {item.display_order}
                      </p>
                    </div>
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  {canEdit && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => togglePublish(item)}>
                        {item.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      {confirmDeleteId === item.id ? (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>
                            Confirm delete
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(item.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </AdminPanelBody>
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
