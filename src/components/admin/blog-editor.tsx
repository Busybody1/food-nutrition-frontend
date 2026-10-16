'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Pencil,
  ArrowLeft,
  ExternalLink,
  FileText,
  MessageCircleQuestion,
  Send,
  Search,
} from 'lucide-react'
import { adminAPI, type AdminBlogPost, type BlogPostInput } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardPill,
} from '@/components/admin/admin-ui'
import { MarkdownContent } from '@/components/blog/markdown-content'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type FaqDraft = { question: string; answer: string }

type Props = {
  mode: 'create' | 'edit'
  initialPost?: AdminBlogPost
}

function FieldCounter({ value, max }: { value: number; max: number }) {
  return (
    <span className={cn('tabular-nums', value > max ? 'text-dash-warning' : 'text-dash-dim')}>
      ({value}/{max})
    </span>
  )
}

export function BlogEditor({ mode, initialPost }: Props) {
  const router = useRouter()

  const [slug, setSlug] = useState(initialPost?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '')
  const [content, setContent] = useState(initialPost?.content ?? '')
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description ?? '')
  const [keywords, setKeywords] = useState(initialPost?.keywords ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.cover_image_url ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status ?? 'draft')
  const [faq, setFaq] = useState<FaqDraft[]>(initialPost?.faq ?? [])

  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const onTitleChange = (value: string) => {
    setTitle(value)
    if (mode === 'create' && !slugTouched) {
      setSlug(slugify(value))
    }
  }

  const validate = (): string | null => {
    if (title.trim().length < 3) return 'Title must be at least 3 characters.'
    if (!SLUG_PATTERN.test(slug)) return 'Slug must be lowercase letters, numbers, and single hyphens.'
    if (content.trim().length < 1) return 'Content cannot be empty.'
    if (metaDescription.length > 155)
      return 'Meta description should be 155 characters or fewer for best SEO results.'
    for (const item of faq) {
      if (item.question.trim().length < 3 || item.answer.trim().length < 3) {
        return 'Each FAQ item needs a question and answer.'
      }
    }
    return null
  }

  const buildPayload = (): BlogPostInput => ({
    slug: slug.trim(),
    title: title.trim(),
    excerpt: excerpt.trim() || undefined,
    content,
    meta_title: metaTitle.trim() || undefined,
    meta_description: metaDescription.trim() || undefined,
    keywords: keywords.trim() || undefined,
    cover_image_url: coverImageUrl.trim() || undefined,
    faq: faq.map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
    status,
  })

  const save = async () => {
    const error = validate()
    if (error) {
      setFeedback({ type: 'error', text: error })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      const payload = buildPayload()
      if (mode === 'create') {
        const created = await adminAPI.createBlogPost(payload)
        router.push(`/admin/blog/${created.id}`)
        router.refresh()
      } else if (initialPost) {
        await adminAPI.updateBlogPost(initialPost.id, payload)
        setFeedback({ type: 'success', text: 'Post saved.' })
        router.refresh()
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (mode !== 'edit' || !initialPost) return
    if (!window.confirm('Delete this post permanently? This cannot be undone.')) return
    setDeleting(true)
    setFeedback(null)
    try {
      await adminAPI.deleteBlogPost(initialPost.id)
      router.push('/admin/blog')
      router.refresh()
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'Delete failed.' })
      setDeleting(false)
    }
  }

  const updateFaq = (index: number, key: keyof FaqDraft, value: string) => {
    setFaq((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  const fieldLabel = 'dashboard-field-label'
  const textareaClass = 'dashboard-textarea'

  return (
    <AdminPage>
      <AdminPageHeader
        title={mode === 'create' ? 'New blog post' : 'Edit blog post'}
        description="Author SEO content stored in the database and served at /blog."
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
              <Link href="/admin/blog">
                <ArrowLeft className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden /> Back
              </Link>
            </Button>
            {mode === 'edit' && status === 'published' && (
              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                <Link href={`/blog/${slug}`} target="_blank">
                  View <ExternalLink className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                </Link>
              </Button>
            )}
          </>
        }
      />

      {feedback && (
        <DashboardAlert variant={feedback.type === 'success' ? 'success' : 'error'}>
          {feedback.text}
        </DashboardAlert>
      )}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <AdminPanel>
            <AdminPanelHeader title="Content" icon={Pencil} />
            <AdminPanelBody className="space-y-4">
              <div>
                <label className={fieldLabel}>Title</label>
                <Input
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="What Is a Calorie API? A Developer's Complete Guide"
                />
              </div>
              <div>
                <label className={fieldLabel}>Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlug(e.target.value)
                  }}
                  placeholder="what-is-a-calorie-api"
                  className="font-mono"
                />
                <p className="dashboard-field-hint">
                  URL: <span className="font-mono text-dash-body">/blog/{slug || 'your-slug'}</span>
                </p>
              </div>
              <div>
                <label className={fieldLabel}>Excerpt</label>
                <textarea
                  className={`${textareaClass} min-h-[60px]`}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary shown on the blog index and as a fallback meta description."
                />
              </div>
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              title="Body (Markdown)"
              icon={FileText}
              actions={
                <div className="dashboard-segmented" role="group" aria-label="Editor mode">
                  <button
                    type="button"
                    className={cn('dashboard-segmented-btn gap-1', tab === 'write' && 'dashboard-segmented-btn-active')}
                    onClick={() => setTab('write')}
                    aria-pressed={tab === 'write'}
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden /> Write
                  </button>
                  <button
                    type="button"
                    className={cn('dashboard-segmented-btn gap-1', tab === 'preview' && 'dashboard-segmented-btn-active')}
                    onClick={() => setTab('preview')}
                    aria-pressed={tab === 'preview'}
                  >
                    <Eye className="h-3.5 w-3.5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden /> Preview
                  </button>
                </div>
              }
            />
            <AdminPanelBody>
              {tab === 'write' ? (
                <textarea
                  className={`${textareaClass} min-h-[480px] font-mono text-[13px]`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  aria-label="Body (Markdown)"
                  placeholder="Write your article in Markdown. Supports headings, lists, tables, and code blocks."
                />
              ) : (
                <div className="min-h-[480px] overflow-x-auto rounded-[10px] border border-dash-border bg-white p-4">
                  {content.trim() ? (
                    <MarkdownContent content={content} />
                  ) : (
                    <p className="text-[13px] text-dash-muted">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              title="FAQ (powers FAQ rich results)"
              icon={MessageCircleQuestion}
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => setFaq((prev) => [...prev, { question: '', answer: '' }])}
                >
                  <Plus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden /> Add
                </Button>
              }
            />
            <AdminPanelBody className="space-y-3">
              {faq.length === 0 ? (
                <p className="rounded-xl border border-dashed border-dash-border bg-dash-hover px-4 py-3 text-[13px] text-dash-muted">
                  Add 5-8 questions using long-tail keyword variations to win featured snippets.
                </p>
              ) : (
                faq.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-xl border border-dash-border bg-dash-hover p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-dash-body">Question {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFaq((prev) => prev.filter((_, i) => i !== index))}
                        className="h-8 w-8 p-0 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                        aria-label="Remove FAQ item"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                      </Button>
                    </div>
                    <Input
                      value={item.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      placeholder="What is a calorie API?"
                    />
                    <textarea
                      className={`${textareaClass} min-h-[70px]`}
                      value={item.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      placeholder="A concise, direct answer."
                    />
                  </div>
                ))
              )}
            </AdminPanelBody>
          </AdminPanel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <AdminPanel>
            <AdminPanelHeader
              title="Publish"
              icon={Send}
              actions={
                <DashboardPill tone={status === 'published' ? 'green' : 'neutral'} className="capitalize">
                  {status}
                </DashboardPill>
              }
            />
            <AdminPanelBody>
              <label className={fieldLabel}>Status</label>
              <select
                className="dashboard-select w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              >
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
            </AdminPanelBody>
            <div
              className={cn(
                'flex items-center gap-2 border-t border-dash-border px-5 py-4',
                mode === 'edit' ? 'justify-between' : 'justify-end'
              )}
            >
              {mode === 'edit' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={remove}
                  disabled={saving || deleting}
                  className="h-9 gap-1.5 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  {deleting ? 'Deleting…' : 'Delete post'}
                </Button>
              )}
              <Button size="sm" onClick={save} disabled={saving || deleting} className="h-9 gap-1.5">
                <Save className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                {saving ? 'Saving…' : mode === 'create' ? 'Create post' : 'Save changes'}
              </Button>
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader title="SEO metadata" icon={Search} />
            <AdminPanelBody className="space-y-4">
              <div>
                <label className={cn(fieldLabel, 'flex items-center justify-between gap-2')}>
                  Meta title <FieldCounter value={metaTitle.length} max={60} />
                </label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Defaults to the post title"
                  maxLength={255}
                />
              </div>
              <div>
                <label className={cn(fieldLabel, 'flex items-center justify-between gap-2')}>
                  Meta description <FieldCounter value={metaDescription.length} max={155} />
                </label>
                <textarea
                  className={`${textareaClass} min-h-[80px]`}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="155 characters, includes primary keyword and a call to action."
                  maxLength={255}
                />
              </div>
              <div>
                <label className={fieldLabel}>Keywords (comma-separated)</label>
                <textarea
                  className={`${textareaClass} min-h-[60px]`}
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="food API, nutrition & food API, calorie api for developers"
                />
              </div>
              <div>
                <label className={fieldLabel}>Cover image URL</label>
                <Input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://… (optional article cover, not used for link previews)"
                />
              </div>
            </AdminPanelBody>
          </AdminPanel>
        </div>
      </div>
    </AdminPage>
  )
}
