'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { adminAPI, type AdminBlogPost } from '@/lib/api/admin'
import { BlogEditor } from '@/components/admin/blog-editor'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  DashboardAlert,
  DashboardLoading,
  DashboardSkeleton,
} from '@/components/admin/admin-ui'

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>()
  const postId = Number(params?.id)
  const [post, setPost] = useState<AdminBlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isInteger(postId) || postId <= 0) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setError('Invalid post id')
      setIsLoading(false)
      return
    }
    let active = true
    adminAPI
      .getBlogPost(postId)
      .then((data) => {
        if (active) setPost(data)
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load post')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [postId])

  if (isLoading) {
    return (
      <AdminPage>
        <AdminPageHeader title="Edit blog post" />
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <AdminPanel>
            <DashboardLoading />
          </AdminPanel>
          <AdminPanel className="hidden p-5 xl:block">
            <DashboardSkeleton className="h-4 w-24" />
            <DashboardSkeleton className="mt-5 h-9 w-full rounded-[10px]" />
            <DashboardSkeleton className="mt-4 h-9 w-full rounded-[10px]" />
          </AdminPanel>
        </div>
      </AdminPage>
    )
  }

  if (error || !post) {
    return (
      <AdminPage>
        <AdminPageHeader title="Edit blog post" />
        <DashboardAlert variant="error">{error ?? 'Post not found.'}</DashboardAlert>
      </AdminPage>
    )
  }

  return <BlogEditor mode="edit" initialPost={post} />
}
