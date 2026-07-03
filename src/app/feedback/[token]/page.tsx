import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { marketingCardClass } from '@/components/marketing/marketing-shell'
import { Mail } from 'lucide-react'

export default function FeedbackLegacyPage() {
  return (
    <div className="marketing-page min-h-[50vh] flex items-center justify-center px-4 py-16">
      <div className={`${marketingCardClass} p-8 max-w-md text-center`}>
        <Mail className="h-10 w-10 text-brand-strong mx-auto mb-4" aria-hidden />
        <h1 className="font-display text-2xl text-ink mb-3">Reply to our email</h1>
        <p className="text-sm text-ink-muted mb-6 leading-relaxed">
          We collect API feedback by email reply. If you received a message from us, use the
          Reply button in that thread, no web form is needed.
        </p>
        <Button asChild variant="outline">
          <Link href="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  )
}
