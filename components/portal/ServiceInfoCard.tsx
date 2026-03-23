"use client";

import React, { useState } from "react";
import { SERVICE_DETAILED_INFO, ServiceDetailedInfo } from "@/lib/service-info";

interface ServiceInfoCardProps {
  serviceId: string;
}

export default function ServiceInfoCard({ serviceId }: ServiceInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const info = SERVICE_DETAILED_INFO[serviceId];

  if (!info) {
    return null;
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📘</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold">Service Information</h3>
            <p className="text-sm text-white/60">
              Learn what this service does and how it works
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/5 p-6 space-y-6">
          {/* Overview */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-2">OVERVIEW</h4>
            <p className="text-white/80 leading-relaxed">{info.overview}</p>
          </div>

          {/* Responsibilities */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">
              RESPONSIBILITIES
            </h4>
            <ul className="space-y-2">
              {info.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">KEY FEATURES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {info.keyFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-white/70 bg-white/[0.02] p-3 rounded-lg"
                >
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">API ENDPOINTS</h4>
            <div className="space-y-2">
              {info.endpoints.map((endpoint, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono ${
                        endpoint.method === "GET"
                          ? "bg-blue-500/20 text-blue-400"
                          : endpoint.method === "POST"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : endpoint.method === "PUT"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-sm text-white/90">
                      {endpoint.path}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 ml-2">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">DEPENDENCIES</h4>
            <div className="flex flex-wrap gap-2">
              {info.dependencies.map((dep, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-white/[0.02] border border-white/10 rounded-full text-xs text-white/70"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>

          {/* Service Interactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inbound */}
            <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <span>📥</span> INBOUND SERVICES
              </h4>
              <div className="space-y-3">
                {info.serviceInteractions.inbound.map((interaction, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white/90">
                      {interaction.service}
                    </span>
                    <span className="text-xs text-white/60 pl-2">
                      → {interaction.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outbound */}
            <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <span>📤</span> OUTBOUND SERVICES
              </h4>
              <div className="space-y-3">
                {info.serviceInteractions.outbound.map((interaction, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white/90">
                      {interaction.service}
                    </span>
                    <span className="text-xs text-white/60 pl-2">
                      → {interaction.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs */}
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-emerald-400 mb-3">
                📥 INPUTS
              </h4>
              <ul className="space-y-2">
                {info.dataFlow.inputs.map((input, idx) => (
                  <li key={idx} className="text-xs text-white/70 flex items-start gap-2">
                    <span className="text-emerald-400">→</span>
                    <span>{input}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outputs */}
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-3">📤 OUTPUTS</h4>
              <ul className="space-y-2">
                {info.dataFlow.outputs.map((output, idx) => (
                  <li key={idx} className="text-xs text-white/70 flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span>{output}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">
              CONFIGURATION OPTIONS
            </h4>
            <div className="space-y-2">
              {info.configuration.map((config, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/5 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-mono text-sm text-white/90 mb-1">
                        {config.key}
                      </div>
                      <div className="text-xs text-white/60">{config.description}</div>
                    </div>
                    {config.default && (
                      <div className="shrink-0">
                        <span className="text-xs text-white/40">Default:</span>
                        <span className="ml-2 px-2 py-1 bg-white/5 rounded text-xs font-mono text-white/80">
                          {config.default}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-3">
              ⚡ PERFORMANCE
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/60 mb-1">Average Response Time</div>
                <div className="text-sm font-mono text-white/90">
                  {info.performance.avgResponseTime}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Throughput</div>
                <div className="text-sm font-mono text-white/90">
                  {info.performance.throughput}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
