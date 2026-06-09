'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, ExternalLink } from 'lucide-react'
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
                  {post.status === 'published' && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-ink-dim hover:text-ink"
                      aria-label="View live"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-sm font-medium text-brand-strong hover:text-brand"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </AdminPanelBody>
      </AdminPanel>
    </AdminPage>
  )
}
