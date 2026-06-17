'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, ExternalLink, Trash2, Loader2 } from 'lucide-react'
import { adminAPI, type AdminBlogPost } from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Badge } from '@/components/ui/badge'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminRefreshButton,
  DashboardAlert,
  DashboardEmpty,
  DashboardLoading,
} from '@/components/admin/admin-ui'

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

export default function AdminBlogPage() {
  const { hasPermission } = useAdmin()
  const canManage = hasPermission('admin:settings:update')
  const [posts, setPosts] = useState<AdminBlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await adminAPI.getBlogPosts({ limit: 100 })
      setPosts(res.posts)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleDelete = async (postId: number) => {
    setDeletingId(postId)
    setDeleteError(null)
    try {
      await adminAPI.deleteBlogPost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setConfirmDeleteId(null)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete post')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Blog"
        description="Create and manage SEO articles served at /blog."
        actions={
          <div className="flex items-center gap-2">
            <AdminRefreshButton onClick={loadPosts} loading={isLoading} />
            {canManage && (
              <Link href="/admin/blog/new" className="site-header-cta h-9">
                <Plus className="h-4 w-4 mr-1.5" /> New post
              </Link>
            )}
          </div>
        }
      />

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {deleteError && <DashboardAlert variant="error">{deleteError}</DashboardAlert>}
      {!canManage && (
        <DashboardAlert variant="warning">
          You do not have permission to manage blog posts.
        </DashboardAlert>
      )}

      <AdminPanel>
        <AdminPanelBody className="space-y-2">
          {isLoading ? (
            <DashboardLoading />
          ) : posts.length === 0 ? (
            <DashboardEmpty icon={FileText} title="No blog posts yet" />
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-4 rounded-brand border border-surface-border/60 p-4 hover:bg-surface-elevated/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="font-medium text-sm text-ink truncate hover:text-brand-strong"
                    >
                      {post.title}
                    </Link>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 truncate">
                    /blog/{post.slug} · updated {formatDate(post.updated_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* View — opens the public blog post in a new tab */}
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </Link>

                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-sm font-medium text-brand-strong hover:text-brand"
                  >
                    Edit
                  </Link>

                  {canManage && (
                    confirmDeleteId === post.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-xs text-ink-muted">Delete?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === post.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-ink-muted hover:text-ink"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(post.id)}
                        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-red-600 transition-colors"
                        aria-label="Delete post"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </AdminPanelBody>
      </AdminPanel>
    </AdminPage>
  )
}
