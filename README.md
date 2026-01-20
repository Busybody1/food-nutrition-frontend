# FoodAPI Frontend

A modern, responsive frontend for the Food & Nutrition Database API built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, professional interface inspired by Edamam's design
- **Responsive**: Mobile-first design that works on all devices
- **Authentication**: Secure login/register with JWT tokens
- **Dashboard**: Comprehensive user dashboard with analytics
- **API Integration**: Direct integration with the Food Nutrition Database API
- **Subscription Management**: Stripe-powered billing and subscription management
- **Developer Tools**: API key management and usage monitoring

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

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
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. **Start the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── (marketing)/       # Public marketing pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── features/         # Feature-specific components
│   └── providers/        # Context providers
├── lib/                  # Utilities and configurations
│   ├── api/              # API client
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom hooks
│   └── config/           # Configuration
├── types/                # TypeScript type definitions
└── styles/               # Additional styles
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

The frontend integrates directly with your existing Food Nutrition Database API:

- **Authentication**: JWT-based auth with refresh tokens
- **Food Search**: Semantic, full-text, and hybrid search
- **User Management**: Profile and API key management
- **Billing**: Stripe integration for subscriptions
- **Analytics**: Usage tracking and monitoring

## 📱 Pages

### Public Pages
- **Home** (`/`) - Landing page with features and pricing
- **Pricing** (`/pricing`) - Subscription plans and features
- **Documentation** (`/docs`) - API documentation
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form

### Authentication
- **Login** (`/auth/login`) - User login
- **Register** (`/auth/register`) - User registration
- **Forgot Password** (`/auth/forgot-password`) - Password reset

### Dashboard (Protected)
- **Dashboard** (`/dashboard`) - Main dashboard
- **API Keys** (`/dashboard/api-keys`) - API key management
- **Billing** (`/dashboard/billing`) - Subscription management
- **Usage** (`/dashboard/usage`) - Usage analytics

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NEXT_PUBLIC_API_URL=https://your-api.herokuapp.com
   heroku config:set NEXTAUTH_SECRET=your-secret
   heroku config:set STRIPE_SECRET_KEY=sk_live_...
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_API_URL=https://your-api.herokuapp.com
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-frontend.herokuapp.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
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
- Authentication headers
- Error handling
- Request/response transformation

### Theme
Customize the design system in `src/lib/config/theme.ts` and `tailwind.config.ts`.

## 📊 Performance

- **Next.js 14**: Latest framework with App Router
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic route-based splitting
- **Caching**: React Query for API caching
- **CDN**: Static asset optimization

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **CORS**: Configured for production
- **CSP**: Content Security Policy headers
- **HTTPS**: Force secure connections
- **Input Validation**: Client and server-side validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` page
- **Issues**: Report bugs via GitHub issues
- **Contact**: Reach out via the contact form

---

**Built with ❤️ for the nutrition and health tech community**