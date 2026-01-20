'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface UsageData {
  date: string
  requests: number
  errors: number
  avgResponseTime: number
}

interface EndpointUsage {
  endpoint: string
  request_count: number
  avg_response_time: number
  error_count: number
}

interface UsageChartProps {
  data: UsageData[]
  endpointData: EndpointUsage[]
  currentUsage: number
  quota: number
  planName: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function UsageChart({ data, endpointData, currentUsage, quota, planName }: UsageChartProps) {
  const usagePercentage = quota > 0 ? (currentUsage / quota) * 100 : 0
  const remainingUsage = Math.max(0, quota - currentUsage)

  const getTrendIcon = () => {
    if (data.length < 2) return <Minus className="h-4 w-4 text-gray-400" />
    
    const latest = data[data.length - 1].requests
    const previous = data[data.length - 2].requests
    
    if (latest > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (latest < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendText = () => {
    if (data.length < 2) return 'No trend data'
    
    const latest = data[data.length - 1].requests
    const previous = data[data.length - 2].requests
    const change = latest - previous
    
    if (change > 0) return `+${change} from yesterday`
    if (change < 0) return `${change} from yesterday`
    return 'Same as yesterday'
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentUsage.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon()}
                  <span className="text-xs text-gray-500 ml-1">
                    {getTrendText()}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {remainingUsage.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {quota.toLocaleString()} total quota
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(usagePercentage)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-semibold text-gray-900">{planName}</p>
                <Badge variant="secondary" className="mt-1">
                  Active
                </Badge>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.length > 0 ? Math.round(data[data.length - 1].avgResponseTime) : 0}ms
                </p>
                <p className="text-xs text-gray-500">
                  Last 24 hours
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-yellow-600">ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  formatter={(value, name) => [
                    value.toLocaleString(), 
                    name === 'requests' ? 'Requests' : name === 'errors' ? 'Errors' : 'Avg Response Time (ms)'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Requests by Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={endpointData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="endpoint" 
                    tickFormatter={(value) => value.replace('_', ' ').toUpperCase()}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      value.toLocaleString(), 
                      name === 'request_count' ? 'Requests' : 'Errors'
                    ]}
                  />
                  <Bar dataKey="request_count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={endpointData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="request_count"
                  >
                    {endpointData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Requests']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {endpointData.map((endpoint, index) => {
                  const errorRate = endpoint.request_count > 0 
                    ? ((endpoint.error_count / endpoint.request_count) * 100).toFixed(1)
                    : '0.0'
                  
                  return (
                    <tr key={endpoint.endpoint}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-3"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {endpoint.endpoint.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {endpoint.request_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(endpoint.avg_response_time)}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          parseFloat(errorRate) > 5 
                            ? 'bg-red-100 text-red-800'
                            : parseFloat(errorRate) > 1
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {errorRate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
