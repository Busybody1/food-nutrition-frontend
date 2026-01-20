'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'

interface ErrorMessageProps {
  title?: string
  message?: string
  type?: 'error' | 'warning' | 'info'
  showRetry?: boolean
  showHome?: boolean
  showBack?: boolean
  onRetry?: () => void
  onHome?: () => void
  onBack?: () => void
  className?: string
}

const errorConfig = {
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    titleColor: 'text-red-800',
    textColor: 'text-red-700'
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700'
  },
  info: {
    icon: AlertCircle,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700'
  }
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  type = 'error',
  showRetry = true,
  showHome = false,
  showBack = false,
  onRetry,
  onHome,
  onBack,
  className = ''
}) => {
  const config = errorConfig[type]
  const Icon = config.icon

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleHome = () => {
    if (onHome) {
      onHome()
    } else {
      window.location.href = '/'
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  return (
    <Card className={`${config.borderColor} ${className}`}>
      <CardContent className={`${config.bgColor} p-6`}>
        <div className="flex items-start space-x-4">
          <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${config.titleColor} mb-2`}>
              {title}
            </h3>
            <p className={`${config.textColor} mb-4`}>
              {message}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {showRetry && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="border-current text-current hover:bg-current hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              {showBack && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="sm"
                  className="border-current text-current hover:bg-current hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              )}
              
              {showHome && (
                <Button
                  onClick={handleHome}
                  variant="outline"
                  size="sm"
                  className="border-current text-current hover:bg-current hover:text-white"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Specific error message components for common scenarios
export const PaymentErrorMessage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorMessage
    title="Payment Failed"
    message="We couldn't process your payment. Please check your payment method and try again."
    type="error"
    onRetry={onRetry}
  />
)

export const NetworkErrorMessage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorMessage
    title="Connection Problem"
    message="Unable to connect to our servers. Please check your internet connection and try again."
    type="error"
    onRetry={onRetry}
  />
)

export const NotFoundErrorMessage: React.FC<{ onHome?: () => void }> = ({ onHome }) => (
  <ErrorMessage
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    type="warning"
    showRetry={false}
    showHome={true}
    onHome={onHome}
  />
)

export const UnauthorizedErrorMessage: React.FC<{ onHome?: () => void }> = ({ onHome }) => (
  <ErrorMessage
    title="Access Denied"
    message="You don't have permission to access this resource. Please log in with the correct account."
    type="warning"
    showRetry={false}
    showHome={true}
    onHome={onHome}
  />
)

export const ServerErrorMessage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorMessage
    title="Server Error"
    message="Our servers are experiencing issues. Please try again in a few moments."
    type="error"
    onRetry={onRetry}
  />
)
