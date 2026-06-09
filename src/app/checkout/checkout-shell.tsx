'use client'

import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe, stripeOptions } from '@/lib/stripe/config'

export default function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={getStripe()} options={stripeOptions}>
      {children}
    </Elements>
  )
}
