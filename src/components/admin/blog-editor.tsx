'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Save, Eye, Pencil, ArrowLeft, ExternalLink } from 'lucide-react'
import { adminAPI, type AdminBlogPost, type BlogPostInput } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  DashboardAlert,
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

  const fieldLabel = 'text-xs font-medium text-ink-dim block mb-1.5'
  const textareaClass =
    'w-full rounded-brand border border-surface-border/80 p-3 text-sm focus:outline-none ' +
    'focus:ring-2 focus:ring-brand/30 focus:border-brand/50'

  return (
    <AdminPage>
      <AdminPageHeader
        title={mode === 'create' ? 'New blog post' : 'Edit blog post'}
        description="Author SEO content stored in the database and served at /blog."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/blog"
              className="inline-flex h-9 items-center gap-1.5 rounded-brand border border-surface-border bg-white px-3 text-sm font-medium text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            {mode === 'edit' && status === 'published' && (
              <Link
                href={`/blog/${slug}`}
                target="_blank"
                className="inline-flex h-9 items-center gap-1.5 rounded-brand border border-surface-border bg-white px-3 text-sm font-medium text-ink-muted hover:text-ink"
              >
                View <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        }
      />

      {feedback && (
        <DashboardAlert variant={feedback.type === 'success' ? 'success' : 'error'}>
          {feedback.text}
        </DashboardAlert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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
                />
                <p className="text-xs text-ink-muted mt-1.5">URL: /blog/{slug || 'your-slug'}</p>
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
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`${fieldLabel} mb-0`}>Body (Markdown)</label>
                  <div className="dashboard-segmented" role="group" aria-label="Editor mode">
                    <button
                      type="button"
                      className={`dashboard-segmented-btn ${tab === 'write' ? 'dashboard-segmented-btn-active' : ''}`}
                      onClick={() => setTab('write')}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1 inline" /> Write
                    </button>
                    <button
                      type="button"
                      className={`dashboard-segmented-btn ${tab === 'preview' ? 'dashboard-segmented-btn-active' : ''}`}
                      onClick={() => setTab('preview')}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 inline" /> Preview
                    </button>
                  </div>
                </div>
                {tab === 'write' ? (
                  <textarea
                    className={`${textareaClass} min-h-[480px] font-mono text-[13px]`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your article in Markdown. Supports headings, lists, tables, and code blocks."
                  />
                ) : (
                  <div className="rounded-brand border border-surface-border/80 p-4 min-h-[480px] overflow-x-auto">
                    {content.trim() ? (
                      <MarkdownContent content={content} />
                    ) : (
                      <p className="text-sm text-ink-muted">Nothing to preview yet.</p>
                    )}
                  </div>
                )}
              </div>
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              title="FAQ (powers FAQ rich results)"
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFaq((prev) => [...prev, { question: '', answer: '' }])}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              }
            />
            <AdminPanelBody className="space-y-4">
              {faq.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Add 5–8 questions using long-tail keyword variations to win featured snippets.
                </p>
              ) : (
                faq.map((item, index) => (
                  <div key={index} className="rounded-brand border border-surface-border/60 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-ink-dim">Question {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => setFaq((prev) => prev.filter((_, i) => i !== index))}
                        className="text-ink-dim hover:text-error-600"
                        aria-label="Remove FAQ item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

        <div className="space-y-6">
          <AdminPanel>
            <AdminPanelHeader title="Publish" />
            <AdminPanelBody className="space-y-4">
              <div>
                <label className={fieldLabel}>Status</label>
                <select
                  className="w-full rounded-brand border border-surface-border/80 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                >
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published (live)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={save} disabled={saving || deleting}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? 'Saving…' : mode === 'create' ? 'Create post' : 'Save changes'}
                </Button>
                {mode === 'edit' && (
                  <Button variant="ghost" onClick={remove} disabled={saving || deleting} className="text-error-600 hover:text-error-600">
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    {deleting ? 'Deleting…' : 'Delete post'}
                  </Button>
                )}
              </div>
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader title="SEO metadata" />
            <AdminPanelBody className="space-y-4">
              <div>
                <label className={fieldLabel}>
                  Meta title <span className="text-ink-dim">({metaTitle.length}/60)</span>
                </label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Defaults to the post title"
                  maxLength={255}
                />
              </div>
              <div>
                <label className={fieldLabel}>
                  Meta description <span className="text-ink-dim">({metaDescription.length}/155)</span>
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
                  placeholder="calorie api for developers, food nutrition api"
                />
              </div>
              <div>
                <label className={fieldLabel}>Cover image URL</label>
                <Input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://… (used for Open Graph)"
                />
              </div>
            </AdminPanelBody>
          </AdminPanel>
        </div>
      </div>
    </AdminPage>
  )
}
