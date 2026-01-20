'use client'

import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe, stripeOptions } from '@/lib/stripe/config'
import CheckoutPage from './page'

export default function CheckoutPageWrapper() {
  return (
    <Elements stripe={getStripe()} options={stripeOptions}>
      <CheckoutPage />
    </Elements>
  )
}
