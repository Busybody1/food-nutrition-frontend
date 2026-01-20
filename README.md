# Food Nutrition Frontend

A modern, responsive frontend for the Food & Nutrition Database API built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, professional interface inspired by Edamam's design
- **Responsive**: Mobile-first design that works on all devices
- **Authentication**: Secure login/register with JWT tokens
- **Dashboard**: Comprehensive user dashboard with analytics
- **API Integration**: Direct integration with the Food Nutrition Database API
- **Subscription Management**: Stripe-powered billing and subscription management
- **Developer Tools**: API key management and usage monitoring

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 with App Router (Turbopack enabled)
- **Language**: TypeScript 5
- **React**: React 19.1.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI primitives
- **State Management**: Zustand + TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Payments**: Stripe (React Stripe.js)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-nutrition-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # API Configuration (REQUIRED)
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=Food Database API
   NEXT_PUBLIC_APP_VERSION=1.0.0
   
   # Authentication (REQUIRED)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   
   # Stripe Configuration (OPTIONAL - for billing features)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   
   # Feature Flags (OPTIONAL)
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   NEXT_PUBLIC_ENABLE_STRIPE=true
   NEXT_PUBLIC_ENABLE_ADMIN=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The development server runs with Turbopack for faster builds and hot reloading.

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/             # Protected dashboard pages
│   │   ├── dashboard/
│   │   ├── api-keys/
│   │   ├── billing/
│   │   └── usage/
│   ├── admin/                   # Admin pages
│   │   ├── analytics/
│   │   ├── monitoring/
│   │   ├── settings/
│   │   └── users/
│   ├── api/                     # API routes (Next.js API routes)
│   │   ├── auth/
│   │   ├── proxy/
│   │   ├── test-endpoint/
│   │   └── webhooks/
│   ├── billing/                 # Billing pages
│   ├── checkout/                # Checkout flow
│   ├── about/                   # About page
│   ├── contact/                 # Contact page
│   ├── docs/                    # Documentation page
│   ├── pricing/                 # Pricing page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                  # Reusable components
│   ├── ui/                     # Base UI components (Radix UI)
│   ├── forms/                  # Form components
│   ├── layout/                 # Layout components (header, footer, conditional layout)
│   ├── features/               # Feature-specific components
│   │   ├── dashboard/
│   │   ├── docs/
│   │   ├── pricing/
│   │   └── search/
│   ├── stripe/                 # Stripe payment components
│   ├── providers/              # Context providers
│   └── seo/                    # SEO components (structured data)
├── contexts/                   # React contexts
│   ├── AuthContext.tsx        # Authentication context
│   └── StripeContext.tsx      # Stripe context
├── lib/                        # Utilities and configurations
│   ├── api/                    # API client
│   │   ├── client.ts          # Main API client
│   │   └── admin.ts            # Admin API methods
│   ├── stripe/                 # Stripe utilities
│   │   ├── api.ts             # Stripe API methods
│   │   └── config.ts          # Stripe configuration
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-admin.ts
│   │   └── use-food-search.ts
│   ├── utils/                  # Utility functions
│   │   └── cn.ts              # Class name utility
│   └── config/                 # Configuration
│       ├── api.ts             # API configuration
│       └── theme.ts           # Theme configuration
└── types/                      # TypeScript type definitions
    ├── api.ts                 # API response types
    └── auth.ts                # Authentication types
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#0ea5e9) - Main brand color
- **Secondary**: Gray (#64748b) - Supporting text
- **Success**: Green (#10b981) - Success states
- **Warning**: Yellow (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states

### Typography
- **Font Family**: Inter (sans-serif)
- **Monospace**: JetBrains Mono

### Spacing
- **Grid System**: 8px base unit
- **Responsive**: Mobile-first approach

## 🔌 API Integration

The frontend integrates directly with the Food Nutrition Database API via the API client (`src/lib/api/client.ts`):

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Authentication**: 
  - JWT tokens stored in localStorage
  - API keys stored in localStorage
  - Automatic token refresh
- **API Endpoints**: All requests use `/api/v1` prefix
  - `/api/v1/auth/*` - Authentication
  - `/api/v1/users/*` - User management
  - `/api/v1/search/*` - Food search
  - `/api/v1/foods/*` - Food data
  - `/api/v1/billing/*` - Billing and subscriptions
  - `/api/v1/admin/*` - Admin operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Request Methods**: GET, POST, PUT, DELETE with automatic header management

## 📱 Pages

### Public Pages
- **Home** (`/`) - Landing page with features and pricing
- **Pricing** (`/pricing`) - Subscription plans and features
- **Documentation** (`/docs`) - API documentation
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form

### Authentication
- **Login** (`/auth/login`) - User login with JWT authentication
- **Register** (`/auth/register`) - User registration
- **Forgot Password** (`/auth/forgot-password`) - Password reset

### Dashboard (Protected)
- **Dashboard** (`/dashboard`) - Main dashboard with overview
- **API Keys** (`/dashboard/api-keys`) - API key management (create, list, revoke)
- **Billing** (`/dashboard/billing`) - Subscription management with Stripe
- **Usage** (`/dashboard/usage`) - Usage analytics and statistics

### Admin (Protected - Admin Only)
- **Admin Dashboard** (`/admin`) - Admin overview
- **Users** (`/admin/users`) - User management
- **Analytics** (`/admin/analytics`) - System analytics
- **Monitoring** (`/admin/monitoring`) - System monitoring
- **Settings** (`/admin/settings`) - System settings

### Billing
- **Checkout** (`/checkout`) - Stripe checkout flow

## 🚀 Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Required environment variables for production:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api.herokuapp.com
NEXT_PUBLIC_APP_NAME=Food Database API
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication
NEXTAUTH_URL=https://your-frontend.herokuapp.com
NEXTAUTH_SECRET=your-production-secret-min-32-chars

# Stripe (if using billing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_ENABLE_ADMIN=true
```

### Deployment Platforms

The project includes a `Procfile` for Heroku deployment. For other platforms:

- **Vercel**: Automatic deployment from Git, supports Next.js natively
- **Netlify**: Configure build command: `npm run build`, publish directory: `.next`
- **Docker**: Create a Dockerfile based on Node.js and run `npm run build && npm start`

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (with Turbopack)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Tailwind**: Utility-first CSS

## 🔧 Configuration

### API Client
The API client is configured in `src/lib/api/client.ts` and automatically handles:
- Authentication headers (API keys and JWT tokens)
- Error handling with user-friendly messages
- Request/response transformation
- LocalStorage persistence for credentials
- Automatic retry logic for network errors

### Theme
Customize the design system in:
- `src/lib/config/theme.ts` - Theme configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `src/app/globals.css` - Global styles

## 📊 Performance

- **Next.js 15.5.3**: Latest framework with App Router and Turbopack
- **React 19**: Latest React with improved performance
- **Turbopack**: Fast bundler for development and production
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic route-based splitting
- **Caching**: TanStack React Query for API caching
- **Static Generation**: Automatic static page generation where possible

## 🔒 Security

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **API Key Management**: Secure API key storage and rotation
- **CORS**: Configured on backend for production
- **Input Validation**: Client-side validation with Zod schemas
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTPS**: Force secure connections in production
- **Error Handling**: No sensitive data exposed in error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **API Documentation**: Check the `/docs` page or backend API docs at `/docs` endpoint
- **Issues**: Report bugs via GitHub issues
- **Contact**: Reach out via the contact form

## 🔗 Related Projects

- **Backend API**: [food-nutrition-database](../food-nutrition-database) - FastAPI backend service
- **API Documentation**: Available at `{NEXT_PUBLIC_API_URL}/docs` when backend is running

---

**Built with ❤️ for the nutrition and health tech community**