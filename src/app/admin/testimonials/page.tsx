'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { adminAPI, type AdminTestimonial, type TestimonialInput } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmin } from '@/lib/hooks/use-admin'
import { CircleCheck, FileText, MessageSquareQuote, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminStatGrid,
  AdminTableWrap,
  AdminTable,
  DashboardAlert,
  DashboardEmpty,
  DashboardLoading,
  DashboardPill,
  DashboardStatCard,
  DASHBOARD_ICON_STROKE,
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

  const publishedCount = items.filter((item) => item.status === 'published').length
  const draftCount = items.length - publishedCount

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

      <AdminStatGrid columns={3}>
        <DashboardStatCard
          label="Testimonials"
          icon={MessageSquareQuote}
          accent="brand"
          value={isLoading ? null : items.length.toLocaleString()}
        />
        <DashboardStatCard
          label="Published"
          icon={CircleCheck}
          accent="green"
          value={isLoading ? null : publishedCount.toLocaleString()}
          hint="Visible on the marketing site"
        />
        <DashboardStatCard
          label="Drafts"
          icon={FileText}
          accent="neutral"
          value={isLoading ? null : draftCount.toLocaleString()}
          hint="Hidden from the site"
        />
      </AdminStatGrid>

      <div className="dashboard-grid-narrow-wide">
        <AdminPanel className="self-start">
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
              <label htmlFor="testimonial-quote" className="dashboard-field-label">
                Quote *
              </label>
              <textarea
                id="testimonial-quote"
                className="dashboard-textarea min-h-[110px]"
                placeholder="The API cut our food-logging build from months to weeks…"
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                disabled={!canEdit}
                maxLength={1000}
              />
              <p className="dashboard-field-hint tabular-nums">
                {form.quote.length}/1000 · minimum 10 characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="testimonial-author" className="dashboard-field-label">
                  Author name *
                </label>
                <Input
                  id="testimonial-author"
                  placeholder="Jane Doe"
                  value={form.author_name}
                  onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                  disabled={!canEdit}
                  maxLength={120}
                />
              </div>
              <div>
                <label htmlFor="testimonial-role" className="dashboard-field-label">
                  Role
                </label>
                <Input
                  id="testimonial-role"
                  placeholder="CTO"
                  value={form.author_role ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
                  disabled={!canEdit}
                  maxLength={120}
                />
              </div>
              <div>
                <label htmlFor="testimonial-company" className="dashboard-field-label">
                  Company
                </label>
                <Input
                  id="testimonial-company"
                  placeholder="Acme Fitness"
                  value={form.company ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  disabled={!canEdit}
                  maxLength={120}
                />
              </div>
              <div>
                <label htmlFor="testimonial-order" className="dashboard-field-label">
                  Display order
                </label>
                <Input
                  id="testimonial-order"
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
              <span className="dashboard-field-label">Avatar</span>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dash-border bg-dash-hover px-3 py-3">
                {form.avatar_url ? (
                  <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-dash-border">
                    <Image src={form.avatar_url} alt="Avatar preview" fill sizes="48px" className="object-cover" unoptimized />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dash-border bg-white text-dash-dim">
                    <MessageSquareQuote className="h-5 w-5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
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
                  className="h-9 gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canEdit || isUploading}
                >
                  <Upload className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  {isUploading ? 'Uploading…' : 'Upload image'}
                </Button>
                {form.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() => setForm((f) => ({ ...f, avatar_url: '' }))}
                    disabled={!canEdit}
                  >
                    <X className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                    Remove
                  </Button>
                )}
              </div>
              <p className="dashboard-field-hint">
                JPEG, PNG, WEBP, or GIF up to 5 MB. Uploaded to the shared S3 bucket.
              </p>
            </div>

            <div>
              <label htmlFor="testimonial-status" className="dashboard-field-label">
                Status
              </label>
              <select
                id="testimonial-status"
                className="dashboard-select w-full"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
                disabled={!canEdit}
              >
                <option value="draft">Draft (hidden from site)</option>
                <option value="published">Published (visible on site)</option>
              </select>
            </div>
          </AdminPanelBody>
          {canEdit && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-dash-border px-5 py-4">
              {editingId !== null && (
                <Button variant="outline" size="sm" className="h-9" onClick={resetForm} disabled={isSaving}>
                  Cancel edit
                </Button>
              )}
              <Button
                size="sm"
                className="h-9"
                onClick={save}
                disabled={isSaving || form.quote.trim().length < 10 || !form.author_name.trim()}
              >
                {isSaving ? 'Saving…' : editingId !== null ? 'Save changes' : 'Create testimonial'}
              </Button>
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="self-start">
          <AdminPanelHeader
            title="All testimonials"
            icon={MessageSquareQuote}
            actions={<span className="dashboard-meta-pill tabular-nums">{items.length}</span>}
          />
          {isLoading ? (
            <DashboardLoading message="Loading…" />
          ) : items.length === 0 ? (
            <AdminPanelBody>
              <DashboardEmpty
                icon={MessageSquareQuote}
                title="No testimonials yet"
                description="Create the first one with the form. Only published testimonials appear on the site."
              />
            </AdminPanelBody>
          ) : (
            <AdminPanelBody noPadding className="max-h-[640px] overflow-y-auto">
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>Testimonial</th>
                      <th className="dashboard-num">Order</th>
                      <th>Status</th>
                      {canEdit && <th className="text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className={editingId === item.id ? 'bg-dash-hover' : undefined}>
                        <td className="min-w-[260px] max-w-[420px]">
                          <div className="flex items-start gap-3">
                            {item.avatar_url ? (
                              <span className="relative mt-0.5 block h-8 w-8 shrink-0 overflow-hidden rounded-full bg-dash-pill ring-1 ring-dash-border">
                                <Image src={item.avatar_url} alt="" fill sizes="32px" className="object-cover" unoptimized />
                              </span>
                            ) : (
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-dash-dim">
                                <MessageSquareQuote className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-[13px] leading-5 text-dash-ink">“{item.quote}”</p>
                              <p className="mt-0.5 truncate text-xs text-dash-muted">
                                <span className="font-medium text-dash-body">{item.author_name}</span>
                                {item.author_role ? `, ${item.author_role}` : ''}
                                {item.company ? `, ${item.company}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="dashboard-num text-dash-ink">{item.display_order}</td>
                        <td>
                          <DashboardPill tone={item.status === 'published' ? 'green' : 'neutral'}>
                            {item.status}
                          </DashboardPill>
                        </td>
                        {canEdit && (
                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => startEdit(item)}
                                aria-label="Edit"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs"
                                onClick={() => togglePublish(item)}
                              >
                                {item.status === 'published' ? 'Unpublish' : 'Publish'}
                              </Button>
                              {confirmDeleteId === item.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 px-2.5 text-xs"
                                    onClick={() => remove(item.id)}
                                  >
                                    Confirm delete
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2.5 text-xs"
                                    onClick={() => setConfirmDeleteId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                                  onClick={() => setConfirmDeleteId(item.id)}
                                  aria-label="Delete"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
