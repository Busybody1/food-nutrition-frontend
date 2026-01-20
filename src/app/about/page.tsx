import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Target, Award, Globe, Heart, Brain, Zap, Shield, 
  ArrowRight, Star, Clock
} from 'lucide-react'

export const metadata = {
  title: 'About Busybody - Comprehensive Food & Nutrition Database',
  description: 'Learn about Busybody\'s mission to provide comprehensive nutrition data for developers building health and fitness applications.',
  keywords: ['about busybody', 'nutrition database', 'food data api', 'health technology', 'developer tools'],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-600/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0">
              <Heart className="w-4 h-4 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Building the future of
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"> nutrition technology</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We&apos;re on a mission to democratize access to comprehensive nutrition data, 
              empowering developers worldwide to build innovative health and wellness applications.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To provide developers with the most comprehensive, accurate, and accessible 
                nutrition database API, enabling the creation of innovative health and wellness 
                applications that improve lives worldwide.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We believe that access to quality nutrition data should be simple, affordable, 
                and powerful enough to support applications at any scale.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800">
                  <Target className="mr-2 h-4 w-4" />
                  Our Vision
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gradient-to-br from-primary-50 to-accent-50 border-0 shadow-strong">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Health First</h3>
                    <p className="text-gray-600">
                      Every decision we make is guided by our commitment to improving 
                      global health through better nutrition data access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape our culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Innovation",
                description: "We continuously push the boundaries of what's possible with nutrition data technology.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Reliability",
                description: "Our API delivers consistent, accurate data with 99.9% uptime guarantee.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Community",
                description: "We build for developers, by developers, fostering a supportive ecosystem.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Accessibility",
                description: "Making nutrition data accessible to developers worldwide, regardless of scale.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "Intelligence",
                description: "Leveraging AI and machine learning to provide smarter, more relevant data.",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Excellence",
                description: "We strive for excellence in everything we do, from data quality to developer experience.",
                gradient: "from-teal-500 to-cyan-500"
              }
            ].map((value, index) => (
              <Card key={index} className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className={`h-16 w-16 bg-gradient-to-r ${value.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    <div className="text-white">
                      {value.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary-600 transition-colors duration-300">
                    {value.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {value.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Our Impact
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Numbers that reflect our commitment to excellence and growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Active Developers", icon: <Zap className="h-8 w-8" /> },
              { number: "1B+", label: "API Requests", icon: <Zap className="h-8 w-8" /> },
              { number: "99.9%", label: "Uptime", icon: <Clock className="h-8 w-8" /> },
              { number: "150+", label: "Countries", icon: <Globe className="h-8 w-8" /> }
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

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to join our mission?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start building with our comprehensive nutrition database API today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-glow-lg hover:shadow-glow-xl transition-all duration-300 transform hover:scale-105">
                <Star className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2 border-primary-300 text-primary-600 hover:bg-primary-50 transition-all duration-300 transform hover:scale-105">
                <Heart className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
