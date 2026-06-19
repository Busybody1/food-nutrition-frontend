'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, ExternalLink, Trash2, Loader2, Search } from 'lucide-react'
import { adminAPI, type AdminBlogPost } from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

export default function AdminBlogPage() {
  const { hasPermission } = useAdmin()
  const canManage = hasPermission('admin:settings:update')
  const [posts, setPosts] = useState<AdminBlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCurrentPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const skip = (currentPage - 1) * PAGE_SIZE
  const pageStart = total === 0 ? 0 : skip + 1
  const pageEnd = Math.min(skip + PAGE_SIZE, total)

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await adminAPI.getBlogPosts({
        limit: PAGE_SIZE,
        skip,
        q: debouncedSearch || undefined,
      })
      setPosts(res.posts)
      setTotal(res.count)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }, [skip, debouncedSearch])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleDelete = async (postId: number) => {
    setDeletingId(postId)
    setDeleteError(null)
    try {
      await adminAPI.deleteBlogPost(postId)
      setConfirmDeleteId(null)
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      } else {
        await loadPosts()
      }
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
        <AdminPanelBody className="space-y-0 p-0">
          <div className="flex flex-col gap-3 border-b border-surface-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" aria-hidden />
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, slug, or keyword…"
                className="pl-9"
                maxLength={100}
                aria-label="Search blog posts"
              />
            </div>
            {!isLoading && total > 0 && (
              <p className="text-sm text-ink-muted shrink-0">
                {total} {total === 1 ? 'post' : 'posts'}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="p-6">
              <DashboardLoading />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-6">
              <DashboardEmpty
                icon={FileText}
                title={debouncedSearch ? 'No posts match your search' : 'No blog posts yet'}
              />
            </div>
          ) : (
            <>
              <div className="divide-y divide-surface-border/60">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 hover:bg-surface-elevated/40 transition-colors"
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

                      {canManage &&
                        (confirmDeleteId === post.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-xs text-ink-muted">Delete?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                'Yes'
                              )}
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
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-surface-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-sm text-ink-muted">
                    Showing {pageStart}–{pageEnd} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-ink-muted">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </AdminPanelBody>
      </AdminPanel>
    </AdminPage>
  )
}
