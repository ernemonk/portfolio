"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface ServiceHealth {
  name: string;
  port: number;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  response_time: number;
  uptime: number;
  last_check: string;
  endpoint: string;
  memory_usage?: number;
  cpu_usage?: number;
  error_rate?: number;
}

interface SystemMetrics {
  total_memory: number;
  used_memory: number;
  cpu_usage: number;
  disk_usage: number;
  active_connections: number;
  requests_per_minute: number;
  error_rate: number;
  average_response_time: number;
}

interface Alert {
  id: string;
  service: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PerformanceData {
  timestamp: string;
  response_time: number;
  cpu_usage: number;
  memory_usage: number;
  error_rate: number;
}

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemHealth();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadSystemHealth, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSystemHealth = async () => {
    try {
      // For now, we'll use mock data. In a real implementation, these would be actual API calls
      const mockServices: ServiceHealth[] = [
        {
          name: "Portfolio Service",
          port: 3001,
          status: "healthy",
          response_time: 45,
          uptime: 99.8,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3001",
          memory_usage: 128,
          cpu_usage: 15,
          error_rate: 0.1,
        },
        {
          name: "Strategy Engine",
          port: 3002,
          status: "healthy",
          response_time: 62,
          uptime: 99.9,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3002",
          memory_usage: 256,
          cpu_usage: 25,
          error_rate: 0.2,
        },
        {
          name: "Risk Management",
          port: 3003,
          status: "degraded",
          response_time: 180,
          uptime: 98.5,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3003",
          memory_usage: 192,
          cpu_usage: 45,
          error_rate: 1.2,
        },
        {
          name: "Execution Engine",
          port: 3004,
          status: "healthy",
          response_time: 38,
          uptime: 99.7,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3004",
          memory_usage: 164,
          cpu_usage: 20,
          error_rate: 0.3,
        },
        {
          name: "Analytics Service",
          port: 3006,
          status: "healthy",
          response_time: 95,
          uptime: 99.6,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3006",
          memory_usage: 512,
          cpu_usage: 35,
          error_rate: 0.5,
        },
        {
          name: "Data Ingestion",
          port: 3009,
          status: "unhealthy",
          response_time: 0,
          uptime: 95.2,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3009",
          memory_usage: 0,
          cpu_usage: 0,
          error_rate: 100,
        },
        {
          name: "Feature Store",
          port: 3010,
          status: "healthy",
          response_time: 72,
          uptime: 99.4,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3010",
          memory_usage: 384,
          cpu_usage: 30,
          error_rate: 0.8,
        },
        {
          name: "Stream Processor",
          port: 3011,
          status: "healthy",
          response_time: 25,
          uptime: 99.9,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3011",
          memory_usage: 224,
          cpu_usage: 18,
          error_rate: 0.1,
        },
        {
          name: "Backtesting Engine",
          port: 3012,
          status: "healthy",
          response_time: 156,
          uptime: 99.1,
          last_check: new Date().toISOString(),
          endpoint: "http://localhost:3012",
          memory_usage: 768,
          cpu_usage: 55,
          error_rate: 0.4,
        },
      ];

      const mockSystemMetrics: SystemMetrics = {
        total_memory: 16384,
        used_memory: 8192,
        cpu_usage: 35,
        disk_usage: 45,
        active_connections: 127,
        requests_per_minute: 1250,
        error_rate: 0.8,
        average_response_time: 85,
      };

      const mockAlerts: Alert[] = [
        {
          id: "alert-1",
          service: "Data Ingestion",
          severity: "critical",
          message: "Service is down - no response to health check",
          timestamp: "2024-03-15 14:30:00",
          resolved: false,
        },
        {
          id: "alert-2", 
          service: "Risk Management",
          severity: "warning",
          message: "High response time detected (180ms > 150ms threshold)",
          timestamp: "2024-03-15 14:25:00",
          resolved: false,
        },
        {
          id: "alert-3",
          service: "Backtesting Engine",
          severity: "warning",
          message: "High CPU usage (55% > 50% threshold)",
          timestamp: "2024-03-15 14:20:00",
          resolved: false,
        },
        {
          id: "alert-4",
          service: "Analytics Service",
          severity: "info",
          message: "Memory usage optimization completed",
          timestamp: "2024-03-15 13:45:00",
          resolved: true,
        },
      ];

      const mockPerformanceData: PerformanceData[] = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
        response_time: 50 + Math.random() * 100,
        cpu_usage: 20 + Math.random() * 40,
        memory_usage: 40 + Math.random() * 30,
        error_rate: Math.random() * 2,
      }));

      setServices(mockServices);
      setSystemMetrics(mockSystemMetrics);
      setAlerts(mockAlerts);
      setPerformanceData(mockPerformanceData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load system health:", error);
      setLoading(false);
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true }
        : alert
    ));
  };

  const restartService = async (serviceName: string, port: number) => {
    try {
      // Mock restart functionality
      setServices(services.map(service => 
        service.name === serviceName 
          ? { ...service, status: "healthy" as const, response_time: 50, error_rate: 0 }
          : service
      ));
    } catch (error) {
      console.error(`Failed to restart ${serviceName}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const healthyServices = services.filter(s => s.status === "healthy").length;
  const totalServices = services.length;
  const systemHealthScore = Math.round((healthyServices / totalServices) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-gray-400 mt-1">
            Real-time monitoring of all Trading OS services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Auto-refresh</span>
          </label>
          <button
            onClick={loadSystemHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Overview */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">System Health</p>
                <p className="text-2xl font-bold text-white">{systemHealthScore}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                systemHealthScore >= 95 ? "bg-green-500" :
                systemHealthScore >= 85 ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {healthyServices}/{totalServices} services healthy
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">{systemMetrics.average_response_time}ms</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                systemMetrics.average_response_time < 100 ? "bg-green-500" :
                systemMetrics.average_response_time < 200 ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">CPU Usage</p>
                <p className="text-2xl font-bold text-white">{systemMetrics.cpu_usage}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                systemMetrics.cpu_usage < 70 ? "bg-green-500" :
                systemMetrics.cpu_usage < 85 ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Memory Usage</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round((systemMetrics.used_memory / systemMetrics.total_memory) * 100)}%
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                (systemMetrics.used_memory / systemMetrics.total_memory) < 0.8 ? "bg-green-500" :
                (systemMetrics.used_memory / systemMetrics.total_memory) < 0.9 ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {systemMetrics.used_memory}MB / {systemMetrics.total_memory}MB
            </p>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {alerts.filter(a => !a.resolved).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    alert.severity === "critical" ? "destructive" :
                    alert.severity === "warning" ? "warning" : "default"
                  }>
                    {alert.severity}
                  </Badge>
                  <div>
                    <p className="text-white font-medium">{alert.service}</p>
                    <p className="text-gray-400 text-sm">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{alert.timestamp}</span>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Service Status */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  service.status === "healthy" ? "bg-green-500" :
                  service.status === "degraded" ? "bg-yellow-500" :
                  service.status === "unhealthy" ? "bg-red-500" : "bg-gray-500"
                }`}></div>
                <div>
                  <p className="text-white font-medium">{service.name}</p>
                  <p className="text-gray-400 text-sm">Port {service.port}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-400">Response</p>
                  <p className="text-white font-mono">{service.response_time}ms</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Uptime</p>
                  <p className="text-white font-mono">{service.uptime.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Error Rate</p>
                  <p className="text-white font-mono">{service.error_rate?.toFixed(1) || 0}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Memory</p>
                  <p className="text-white font-mono">{service.memory_usage || 0}MB</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedService(service.name)}
                  className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Details
                </button>
                {service.status === "unhealthy" && (
                  <button
                    onClick={() => restartService(service.name, service.port)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Restart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Chart */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Trends (Last 20 Minutes)</h3>
        <div className="h-64 bg-gray-800 rounded-lg p-4 flex items-end justify-between">
          {performanceData.map((data, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="flex flex-col items-center gap-px">
                {/* Response Time Bar */}
                <div 
                  className="bg-blue-500 rounded-t w-2"
                  style={{ height: `${Math.max(data.response_time / 3, 5)}px` }}
                  title={`Response Time: ${data.response_time.toFixed(0)}ms`}
                ></div>
                {/* CPU Usage Bar */}
                <div 
                  className="bg-yellow-500 w-2"
                  style={{ height: `${Math.max(data.cpu_usage * 2, 5)}px` }}
                  title={`CPU: ${data.cpu_usage.toFixed(0)}%`}
                ></div>
                {/* Memory Usage Bar */}
                <div 
                  className="bg-green-500 w-2"
                  style={{ height: `${Math.max(data.memory_usage * 2, 5)}px` }}
                  title={`Memory: ${data.memory_usage.toFixed(0)}%`}
                ></div>
                {/* Error Rate Bar */}
                <div 
                  className="bg-red-500 rounded-b w-2"
                  style={{ height: `${Math.max(data.error_rate * 10, 2)}px` }}
                  title={`Errors: ${data.error_rate.toFixed(1)}%`}
                ></div>
              </div>
              <span className="text-xs text-gray-400 transform -rotate-45 origin-top-left">
                {new Date(data.timestamp).toLocaleTimeString().slice(0, -3)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-blue-500 rounded"></div>
            <span className="text-gray-300">Response Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-yellow-500 rounded"></div>
            <span className="text-gray-300">CPU Usage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-green-500 rounded"></div>
            <span className="text-gray-300">Memory Usage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-red-500 rounded"></div>
            <span className="text-gray-300">Error Rate</span>
          </div>
        </div>
      </Card>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Service Details: {selectedService}</h2>
              <button
                onClick={() => setSelectedService(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(() => {
              const service = services.find(s => s.name === selectedService);
              if (!service) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Status</p>
                      <Badge variant={
                        service.status === "healthy" ? "success" :
                        service.status === "degraded" ? "warning" :
                        service.status === "unhealthy" ? "destructive" : "secondary"
                      }>
                        {service.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Port</p>
                      <p className="text-white text-xl font-mono">{service.port}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Response Time</p>
                      <p className="text-white text-xl font-mono">{service.response_time}ms</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Uptime</p>
                      <p className="text-white text-xl font-mono">{service.uptime.toFixed(2)}%</p>
                    </div>
                    {service.memory_usage && (
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">Memory Usage</p>
                        <p className="text-white text-xl font-mono">{service.memory_usage}MB</p>
                      </div>
                    )}
                    {service.cpu_usage && (
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">CPU Usage</p>
                        <p className="text-white text-xl font-mono">{service.cpu_usage}%</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Endpoint</p>
                    <p className="text-white font-mono">{service.endpoint}</p>
                  </div>

                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Last Health Check</p>
                    <p className="text-white">{new Date(service.last_check).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2">
                    {service.status === "unhealthy" && (
                      <button
                        onClick={() => {
                          restartService(service.name, service.port);
                          setSelectedService(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Restart Service
                      </button>
                    )}
                    <button
                      onClick={() => window.open(`${service.endpoint}/health`, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Test Endpoint
                    </button>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}
    </div>
  );
}