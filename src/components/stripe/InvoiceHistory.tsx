'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Download, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react'
import { useStripe } from '@/contexts/StripeContext'
import { formatPrice, formatDate } from '@/lib/stripe/config'

export function InvoiceHistory() {
  const {
    invoices,
    isInvoicesLoading,
    error,
  } = useStripe()

  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (invoiceId: string, invoicePdf?: string) => {
    try {
      setDownloading(invoiceId)
      
      if (invoicePdf) {
        // Open PDF in new tab
        window.open(invoicePdf, '_blank')
      } else {
        // Fallback: redirect to hosted invoice URL
        const invoice = invoices.find(inv => inv.id === invoiceId)
        if (invoice?.hosted_invoice_url) {
          window.open(invoice.hosted_invoice_url, '_blank')
        }
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
    } finally {
      setDownloading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'void':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'void':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'open':
        return 'Open'
      case 'void':
        return 'Void'
      default:
        return status
    }
  }

  if (isInvoicesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Billing History
          </CardTitle>
          <CardDescription>
            Your invoice and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading invoices...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Billing History
        </CardTitle>
        <CardDescription>
          Your invoice and payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No invoices found</p>
            <p className="text-sm text-gray-400">
              Your billing history will appear here once you have an active subscription.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(invoice.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {invoice.number || `Invoice ${invoice.id.slice(-8)}`}
                      </span>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(invoice.created)}
                    </div>
                    {invoice.period_start && invoice.period_end && (
                      <div className="text-xs text-gray-400">
                        {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatPrice(invoice.amount_paid, invoice.currency)}
                    </div>
                    {invoice.amount_due > 0 && invoice.amount_due !== invoice.amount_paid && (
                      <div className="text-sm text-gray-500">
                        Due: {formatPrice(invoice.amount_due, invoice.currency)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {invoice.hosted_invoice_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {(invoice.invoice_pdf || invoice.hosted_invoice_url) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice.id, invoice.invoice_pdf)}
                        disabled={downloading === invoice.id}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        {downloading === invoice.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>
            All invoices are also available in your Stripe Customer Portal.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
