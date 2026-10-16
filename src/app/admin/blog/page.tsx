'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { adminAPI, type AdminBlogPost } from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminRefreshButton,
  AdminTable,
  AdminTableWrap,
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardEmpty,
  DashboardLoading,
  DashboardPanelToolbar,
  DashboardPill,
  type DashboardTone,
} from '@/components/admin/admin-ui'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function statusTone(status: string): DashboardTone {
  if (status === 'published') return 'green'
  if (status === 'scheduled') return 'indigo'
  return 'neutral'
}

const rowIconButton =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-pill hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'

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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    if (currentPage > totalPages) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
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
          <>
            <AdminRefreshButton onClick={loadPosts} loading={isLoading} />
            {canManage && (
              <Button asChild size="sm" className="h-9 gap-1.5">
                <Link href="/admin/blog/new">
                  <Plus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  New post
                </Link>
              </Button>
            )}
          </>
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
        <AdminPanelHeader
          title="Posts"
          icon={FileText}
          description={
            !isLoading && total > 0 ? (
              <span className="tabular-nums">
                {total} {total === 1 ? 'post' : 'posts'}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
              </span>
            ) : undefined
          }
        />
        <DashboardPanelToolbar>
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-dim"
              strokeWidth={DASHBOARD_ICON_STROKE}
              aria-hidden
            />
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
        </DashboardPanelToolbar>

        {isLoading ? (
          <DashboardLoading />
        ) : posts.length === 0 ? (
          <DashboardEmpty
            icon={FileText}
            title={debouncedSearch ? 'No posts match your search' : 'No blog posts yet'}
          />
        ) : (
          <>
            <AdminPanelBody noPadding>
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>Post</th>
                      <th>Status</th>
                      <th>Published</th>
                      <th>Updated</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td className="max-w-[420px]">
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dash-border bg-white text-dash-muted"
                              aria-hidden
                            >
                              <FileText className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                            </span>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/blog/${post.id}`}
                                className="block truncate font-medium text-dash-ink hover:text-dash-teal-strong"
                              >
                                {post.title}
                              </Link>
                              <p className="mt-0.5 truncate font-mono text-xs text-dash-muted">
                                /blog/{post.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <DashboardPill tone={statusTone(post.status)} className="capitalize">
                            {post.status}
                          </DashboardPill>
                        </td>
                        <td className="whitespace-nowrap text-xs tabular-nums text-dash-muted">
                          {formatDate(post.published_at)}
                        </td>
                        <td className="whitespace-nowrap text-xs tabular-nums text-dash-muted">
                          {formatDate(post.updated_at)}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={rowIconButton}
                              aria-label="View"
                              title="View"
                            >
                              <ExternalLink
                                className="h-4 w-4"
                                strokeWidth={DASHBOARD_ICON_STROKE}
                                aria-hidden
                              />
                            </Link>

                            <Link
                              href={`/admin/blog/${post.id}`}
                              className={rowIconButton}
                              aria-label="Edit"
                              title="Edit"
                            >
                              <Pencil
                                className="h-4 w-4"
                                strokeWidth={DASHBOARD_ICON_STROKE}
                                aria-hidden
                              />
                            </Link>

                            {canManage &&
                              (confirmDeleteId === post.id ? (
                                <span className="ml-1 inline-flex items-center gap-1">
                                  <span className="text-xs text-dash-muted">Delete?</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(post.id)}
                                    disabled={deletingId === post.id}
                                    className="h-8 px-2 text-xs font-medium text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                                  >
                                    {deletingId === post.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                                    ) : (
                                      'Yes'
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="h-8 px-2 text-xs text-dash-muted hover:bg-dash-pill hover:text-dash-ink"
                                  >
                                    Cancel
                                  </Button>
                                </span>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmDeleteId(post.id)}
                                  className="h-8 w-8 p-0 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                                  aria-label="Delete post"
                                  title="Delete"
                                >
                                  <Trash2
                                    className="h-4 w-4"
                                    strokeWidth={DASHBOARD_ICON_STROKE}
                                    aria-hidden
                                  />
                                </Button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>

            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-dash-border px-5 py-3 sm:flex-row">
                <p className="text-xs tabular-nums text-dash-muted">
                  Showing {pageStart}-{pageEnd} of {total}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                    Previous
                  </Button>
                  <span className="whitespace-nowrap px-2 text-xs tabular-nums text-dash-muted">
                    Page <span className="font-medium text-dash-ink">{currentPage}</span> of{' '}
                    {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </AdminPanel>
    </AdminPage>
  )
}
