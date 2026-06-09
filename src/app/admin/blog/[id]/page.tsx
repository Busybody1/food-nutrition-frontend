'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { adminAPI, type AdminBlogPost } from '@/lib/api/admin'
import { BlogEditor } from '@/components/admin/blog-editor'
import { AdminPage, DashboardAlert, DashboardLoading } from '@/components/admin/admin-ui'

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>()
  const postId = Number(params?.id)
  const [post, setPost] = useState<AdminBlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isInteger(postId) || postId <= 0) {
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
        <DashboardLoading />
      </AdminPage>
    )
  }

  if (error || !post) {
    return (
      <AdminPage>
        <DashboardAlert variant="error">{error ?? 'Post not found.'}</DashboardAlert>
      </AdminPage>
    )
  }

  return <BlogEditor mode="edit" initialPost={post} />
}
