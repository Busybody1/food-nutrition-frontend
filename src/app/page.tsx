'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, Zap, Shield, BarChart3, Code, CheckCircle, ArrowRight, 
  Sparkles, Star, Globe, Lock, Clock, Heart, Brain, 
  ChevronRight, Play, Github, Twitter, Linkedin
} from 'lucide-react'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge variant="secondary" className="mb-6 animate-bounce-gentle bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0 shadow-glow">
              <Sparkles className="w-4 h-4 mr-2" />
              Now with AI-powered search
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary-600 to-accent-600 bg-clip-text text-transparent animate-gradient-x">
              The Ultimate
              <br />
              <span className="relative">
                Food & Nutrition
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-accent-400 rounded-lg blur opacity-30 animate-pulse"></div>
              </span>
              <br />
              Database API
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Access comprehensive nutrition data with advanced search capabilities. 
              Perfect for developers building health, fitness, and nutrition applications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-glow-lg hover:shadow-glow-xl transition-all duration-300 transform hover:scale-105">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-2 border-primary-200 hover:border-primary-300 hover:bg-white/90 transition-all duration-300 transform hover:scale-105">
                  <Code className="mr-2 h-5 w-5" />
                  View Documentation
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                <span>1,000 free requests/month</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See it in action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try our interactive API demo and see how easy it is to integrate nutrition data
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-glass overflow-hidden">
              <CardContent className="p-8">
                <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="ml-4 text-gray-400">API Demo</span>
                  </div>
                  <div className="text-green-400">
                    <div>$ curl -X GET &quot;https://api.foodapi.com/api/v1/search/foods?q=apple&quot; \</div>
                    <div className="ml-4">-H &quot;X-API-Key: your-api-key&quot;</div>
                  </div>
                  <div className="mt-4 text-blue-400">
                    <div>{'{'}</div>
                    <div className="ml-4">&quot;foods&quot;: [</div>
                    <div className="ml-8">{"{"}</div>
                    <div className="ml-12">&quot;name&quot;: &quot;Apple, raw&quot;,</div>
                    <div className="ml-12">&quot;calories&quot;: 52,</div>
                    <div className="ml-12">&quot;protein&quot;: 0.26,</div>
                    <div className="ml-12">&quot;carbs&quot;: 13.81,</div>
                    <div className="ml-8">{"}"}</div>
                    <div className="ml-4">]</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" className="bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0 hover:shadow-glow">
                    <Play className="mr-2 h-4 w-4" />
                    Try Live Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to build
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"> nutrition apps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our API provides comprehensive food data with advanced search, 
              filtering, and analytics capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="h-8 w-8" />,
                title: "Advanced Search",
                description: "Semantic, full-text, and hybrid search with natural language processing",
                gradient: "from-blue-500 to-cyan-500",
                delay: "0s"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Lightning Fast",
                description: "Sub-100ms response times with Redis caching and optimized queries",
                gradient: "from-yellow-500 to-orange-500",
                delay: "0.1s"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Enterprise Security",
                description: "JWT authentication, rate limiting, and enterprise-grade security",
                gradient: "from-green-500 to-emerald-500",
                delay: "0.2s"
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Rich Analytics",
                description: "Detailed usage analytics and real-time monitoring dashboard",
                gradient: "from-purple-500 to-pink-500",
                delay: "0.3s"
              },
              {
                icon: <Code className="h-8 w-8" />,
                title: "Developer Friendly",
                description: "RESTful API with comprehensive documentation and SDKs",
                gradient: "from-indigo-500 to-blue-500",
                delay: "0.4s"
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Global Scale",
                description: "Built for scale with 99.9% uptime and global CDN",
                gradient: "from-teal-500 to-cyan-500",
                delay: "0.5s"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
                style={{ animationDelay: feature.delay }}
              >
                <CardHeader className="pb-4">
                  <div className={`h-16 w-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary-600 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by developers worldwide
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Join thousands of developers building the future of nutrition technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "900K+", label: "Food Items", icon: <Heart className="h-8 w-8" /> },
              { number: "28", label: "Nutrients", icon: <Brain className="h-8 w-8" /> },
              { number: "615K+", label: "UPC Codes", icon: <Lock className="h-8 w-8" /> },
              { number: "99.9%", label: "Uptime", icon: <Clock className="h-8 w-8" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-primary-100 text-lg font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {[
              {
                name: "Free",
                price: 0,
                description: "Perfect for testing and small projects",
                features: ["1,000 requests/month", "10 requests/minute", "Basic search", "Community support", "1 API key"],
                buttonText: "Get Started",
                buttonVariant: "outline",
                popular: false
              },
              {
                name: "Basic",
                price: 29,
                description: "Ideal for small applications and startups",
                features: ["100,000 requests/month", "50 requests/minute", "Advanced search & filters", "Email support", "3 API keys"],
                buttonText: "Start Free Trial",
                buttonVariant: "outline",
                popular: false
              },
              {
                name: "Core",
                price: 99,
                description: "Perfect for growing businesses and teams",
                features: ["750,000 requests/month", "100 requests/minute", "Advanced search & filters", "Priority support", "10 API keys"],
                buttonText: "Choose Core",
                buttonVariant: "default",
                popular: true
              },
              {
                name: "Plus",
                price: 299,
                description: "For high-volume applications and enterprises",
                features: ["3,000,000 requests/month", "300 requests/minute", "Custom integrations", "Dedicated support", "25 API keys"],
                buttonText: "Contact Sales",
                buttonVariant: "outline",
                popular: false
              },
              {
                name: "Enterprise",
                price: 999,
                description: "Tailored solutions for large organizations",
                features: ["Unlimited requests", "Unlimited requests/minute", "Custom integrations", "Phone support", "100 API keys"],
                buttonText: "Contact Sales",
                buttonVariant: "outline",
                popular: false
              }
            ].map((plan, index) => (
              <Card 
                key={index}
                className={`relative border-2 transition-all duration-500 transform hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-primary-500 shadow-glow-lg scale-105' 
                    : 'border-gray-200 hover:border-primary-300 shadow-soft hover:shadow-strong'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary-600 to-accent-600 text-white border-0 shadow-glow animate-pulse">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 text-lg">/month</span>
                  </div>
                  <CardDescription className="mt-2 text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-success-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.name === 'Plus' || plan.name === 'Enterprise' ? '/contact' : '/auth/register'}>
                    <Button 
                      variant={plan.buttonVariant as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"} 
                      className={`w-full transition-all duration-300 transform hover:scale-105 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-glow hover:shadow-glow-lg' 
                          : ''
                      }`}
                      size="lg"
                    >
                      {plan.buttonText}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-primary-900 to-accent-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to build something
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"> amazing?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers using our API to build the next generation 
            of nutrition and health applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white shadow-glow-lg hover:shadow-glow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Building Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105">
                <Code className="mr-2 h-5 w-5" />
                View API Docs
              </Button>
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </div>
            <div className="flex items-center space-x-2">
              <Twitter className="h-5 w-5" />
              <span>Twitter</span>
            </div>
            <div className="flex items-center space-x-2">
              <Linkedin className="h-5 w-5" />
              <span>LinkedIn</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}