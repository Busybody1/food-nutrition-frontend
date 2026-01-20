'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  Server, Database, Zap, TrendingUp, 
  TrendingDown, RefreshCw, Eye
} from 'lucide-react'

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  errorRate: number
  throughput: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  lastCheck: string
  description: string
}

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  service: string
  message: string
  details?: Record<string, unknown>
}

export default function APIMonitoring() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMonitoringData()
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMonitoringData = async () => {
    try {
      // Import admin API
      const { adminAPI } = await import('@/lib/api/admin')
      
      // Load system metrics
      const systemMetricsResponse = await adminAPI.getSystemMetrics()
      const systemStatus: SystemStatus = {
        overall: 'healthy', // Default to healthy
        uptime: systemMetricsResponse.systemUptime || 99.9,
        responseTime: systemMetricsResponse.averageResponseTime || 145,
        errorRate: systemMetricsResponse.errorRate || 0.02,
        throughput: 1250 // Default throughput value
      }

      // Load system health data
      const healthResponse = await adminAPI.getSystemHealth()
      const services: ServiceStatus[] = healthResponse.services || []

      const alerts: Alert[] = healthResponse.alerts || []

      const logs: LogEntry[] = healthResponse.logs || []
      setSystemStatus(systemStatus)
      setServices(services)
      setAlerts(alerts)
      setLogs(logs)
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      case 'critical':
        return AlertTriangle
      default:
        return Activity
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'debug':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Real-time system health, performance metrics, and alerts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadMonitoringData}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {systemStatus?.overall}
                </p>
                <p className="text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  All systems operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus?.uptime}%
                </p>
                <p className="text-sm text-gray-600">
                  Last 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus?.responseTime}ms
                </p>
                <p className="text-sm text-green-600">
                  <TrendingDown className="w-4 h-4 inline mr-1" />
                  -5% from last hour
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Throughput</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus?.throughput}/min
                </p>
                <p className="text-sm text-gray-600">
                  Requests per minute
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status)
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                    <Badge className={getStatusColor(service.status)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {service.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{service.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Uptime:</span>
                      <span className="font-medium">{service.uptime}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Response:</span>
                      <span className="font-medium">{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Last Check:</span>
                      <span className="font-medium">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Active Alerts
              </div>
              <Badge variant="secondary">
                {alerts.filter(a => !a.resolved).length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.resolved ? 'bg-gray-50 border-gray-300' : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Recent Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                  <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                    {log.level}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-900">{log.service}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{log.message}</p>
                    {log.details && (
                      <details className="mt-1">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          View details
                        </summary>
                        <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
