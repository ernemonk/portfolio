"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { callWithRetry } from "@/lib/trading-api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  modelUsed?: string;
}

interface ChatSession {
  id: string;
  modelId: string;
  name: string;
  messages: ChatMessage[];
  lastModified: number;
  messageCount: number;
}

interface ModelChatProps {
  selectedModel: string | null;
  onModelSelect?: (model: string) => void;
}

// LocalStorage keys
const CHAT_SESSIONS_KEY = 'model-chat-sessions';
const LAST_SESSION_KEY = 'model-chat-last-session';
const MAX_SESSIONS = 20; // Limit stored sessions
const MAX_CONTEXT_MESSAGES = 50; // Limit context for API calls

export default function ModelChat({ selectedModel, onModelSelect }: ModelChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessionsList, setShowSessionsList] = useState(false);
  const [enableContext, setEnableContext] = useState(true);
  const [modelLoading, setModelLoading] = useState(false);
  const [lastLoadedModel, setLastLoadedModel] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // LocalStorage utilities with async optimization
  const loadSessions = useCallback(async (): Promise<ChatSession[]> => {
    return new Promise((resolve) => {
      // Use setTimeout to make this async and non-blocking
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(CHAT_SESSIONS_KEY);
          resolve(stored ? JSON.parse(stored) : []);
        } catch {
          resolve([]);
        }
      }, 0);
    });
  }, []);

  const saveSessions = useCallback(async (newSessions: ChatSession[]) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          // Keep only the most recent sessions
          const limitedSessions = newSessions
            .sort((a, b) => b.lastModified - a.lastModified)
            .slice(0, MAX_SESSIONS);
          localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(limitedSessions));
          setSessions(limitedSessions);
        } catch (error) {
          console.warn('Failed to save chat sessions:', error);
        }
        resolve();
      }, 0);
    });
  }, []);

  const saveCurrentSession = useCallback(async () => {
    if (!selectedModel || !currentSessionId || messages.length === 0) return;
    
    try {
      const allSessions = await loadSessions();
      const existingIndex = allSessions.findIndex(s => s.id === currentSessionId);
      
      const session: ChatSession = {
        id: currentSessionId,
        modelId: selectedModel,
        name: generateSessionName(messages),
        messages: messages,
        lastModified: Date.now(),
        messageCount: messages.length
      };

      if (existingIndex >= 0) {
        allSessions[existingIndex] = session;
      } else {
        allSessions.push(session);
      }
      
      await saveSessions(allSessions);
      localStorage.setItem(LAST_SESSION_KEY, currentSessionId);
    } catch (error) {
      console.warn('Failed to save current session:', error);
    }
  }, [selectedModel, currentSessionId, messages, loadSessions, saveSessions]);

  const generateSessionName = (msgs: ChatMessage[]): string => {
    if (msgs.length === 0) return 'New Chat';
    const firstUserMessage = msgs.find(m => m.role === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.content.substring(0, 30);
      return content.length < firstUserMessage.content.length ? content + '...' : content;
    }
    return 'Chat Session';
  };

  const loadSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const allSessions = await loadSessions();
      const session = allSessions.find(s => s.id === sessionId);
      if (session && session.modelId === selectedModel) {
        setMessages(session.messages);
        setCurrentSessionId(sessionId);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to load session:', error);
      return false;
    }
  }, [selectedModel, loadSessions]);

  const startNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setIsSaved(false);
  }, []);

  // Debounced async model loading
  const loadModelSessions = useCallback(async (modelId: string) => {
    if (modelId === lastLoadedModel) return; // Skip if already loaded
    
    setModelLoading(true);
    
    try {
      const allSessions = await loadSessions();
      setSessions(allSessions);
      
      const lastSessionId = localStorage.getItem(LAST_SESSION_KEY);
      
      // Try to load last session for this model
      if (lastSessionId) {
        const loaded = await loadSession(lastSessionId);
        if (loaded) {
          setLastLoadedModel(modelId);
          setModelLoading(false);
          return;
        }
      }
      
      // Try to find an existing session for this model
      const modelSessions = allSessions.filter(s => s.modelId === modelId);
      if (modelSessions.length > 0) {
        const mostRecent = modelSessions.sort((a, b) => b.lastModified - a.lastModified)[0];
        await loadSession(mostRecent.id);
      } else {
        startNewSession();
      }
      
      setLastLoadedModel(modelId);
    } catch (error) {
      console.warn('Failed to load model sessions:', error);
      startNewSession();
    } finally {
      setModelLoading(false);
    }
  }, [lastLoadedModel, loadSessions, loadSession, startNewSession]);

  // Initialize sessions and load last session with debouncing
  useEffect(() => {
    if (!selectedModel) return;
    
    // Clear any pending timeout
    if (modelChangeTimeoutRef.current) {
      clearTimeout(modelChangeTimeoutRef.current);
    }
    
    // Debounce model changes to prevent rapid switching issues
    modelChangeTimeoutRef.current = setTimeout(() => {
      loadModelSessions(selectedModel);
    }, 150); // 150ms debounce
    
    return () => {
      if (modelChangeTimeoutRef.current) {
        clearTimeout(modelChangeTimeoutRef.current);
      }
    };
  }, [selectedModel, loadModelSessions]);

  // Load initial sessions
  useEffect(() => {
    loadSessions().then(setSessions).catch(() => setSessions([]));
  }, [loadSessions]);

  // Memoized filtered sessions for current model
  const currentModelSessions = useMemo(() => {
    return sessions
      .filter(s => s.modelId === selectedModel)
      .sort((a, b) => b.lastModified - a.lastModified)
      .slice(0, 8);
  }, [sessions, selectedModel]);

  // Auto-save current session when messages change (debounced)
  useEffect(() => {
    if (messages.length > 0 && !modelLoading) {
      const timeoutId = setTimeout(() => {
        saveCurrentSession().catch(console.warn);
      }, 1500); // Increased debounce for performance
      return () => clearTimeout(timeoutId);
    }
  }, [messages, saveCurrentSession, modelLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedModel || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const inputText = input;
    setInput("");
    setLoading(true);

    try {
      // Prepare context messages (limit for API efficiency)
      const contextMessages = enableContext 
        ? messages.slice(-MAX_CONTEXT_MESSAGES).map(m => ({
            role: m.role,
            content: m.content
          }))
        : [];

      const allMessages = [
        ...contextMessages,
        { role: "user", content: inputText }
      ];

      const response = await callWithRetry("local_ai", "/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: allMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: (response as any).choices?.[0]?.message?.content || "No response",
        timestamp: Date.now(),
        modelUsed: selectedModel
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsSaved(false);
    } catch (error) {
      // Provide helpful error messages based on common issues
      let errorContent = "Failed to get response";
      const errMsg = error instanceof Error ? error.message : String(error);
      
      if (errMsg.includes("502") || errMsg.includes("connection")) {
        errorContent = `🔴 Model Connection Error\n\nThe model "${selectedModel}" failed to respond. This usually means:\n• Model is still loading (can take 1-2 minutes for first use)\n• Model is not downloaded yet\n• Model is too large for available memory\n\n💡 Try using "orca-mini-3b-gguf2-q4_0" - it's the most reliable local model.`;
      } else if (errMsg.includes("404")) {
        errorContent = `🔴 Model Not Found\n\nThe model "${selectedModel}" is not available. Please select a different model.`;
      } else if (errMsg.includes("500") || errMsg.includes("Tensor")) {
        errorContent = `🔴 Model Error\n\nThe model "${selectedModel}" encountered an internal error. This model may not be compatible with chat.\n\n💡 Try "orca-mini-3b-gguf2-q4_0" instead.`;
      } else if (errMsg.includes("timeout") || errMsg.includes("Timeout")) {
        errorContent = `🔴 Timeout Error\n\nThe model took too long to respond. It may still be loading.\n\n💡 Wait 30 seconds and try again, or use "orca-mini-3b-gguf2-q4_0" for faster responses.`;
      } else {
        errorContent = `Error: ${errMsg}`;
      }
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: errorContent,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (currentSessionId) {
      // Remove session from localStorage
      const allSessions = loadSessions().filter(s => s.id !== currentSessionId);
      saveSessions(allSessions);
    }
    startNewSession();
  };

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const allSessions = await loadSessions();
      const filteredSessions = allSessions.filter(s => s.id !== sessionId);
      await saveSessions(filteredSessions);
      
      if (sessionId === currentSessionId) {
        startNewSession();
      }
    } catch (error) {
      console.warn('Failed to delete session:', error);
    }
  }, [loadSessions, saveSessions, currentSessionId, startNewSession]);

  const saveHistory = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId,
      model: selectedModel,
      messages: messages,
      messageCount: messages.length,
      contextEnabled: enableContext
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model-chat-${selectedModel?.replace(/\//g, "-")}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsSaved(true);
  }, [currentSessionId, selectedModel, messages, enableContext]);

  const clearAllSessions = useCallback(() => {
    localStorage.removeItem(CHAT_SESSIONS_KEY);
    localStorage.removeItem(LAST_SESSION_KEY);
    setSessions([]);
    setLastLoadedModel(null);
    startNewSession();
  }, [startNewSession]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 right-0 w-96 max-h-96 bg-black/95 border-l border-t border-emerald-500/30 rounded-tl-xl shadow-2xl overflow-hidden z-40"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-emerald-500/30">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400">CHAT PERSIST</span>
            <span className="text-xs text-gray-400">
              {selectedModel ? `${selectedModel.split("/").pop()}` : "No model"}
            </span>
            {modelLoading && (
              <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-mono animate-pulse">
                LOAD
              </span>
            )}
            {enableContext && !modelLoading && (
              <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded font-mono">
                CTX
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSessionsList(!showSessionsList);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono"
            >
              📁
            </button>
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className="text-emerald-400"
            >
              ▼
            </motion.div>
          </div>
        </div>
        
        {/* Sessions dropdown */}
        <AnimatePresence>
          {showSessionsList && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-emerald-500/20 bg-black/80 max-h-32 overflow-y-auto"
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={startNewSession}
                  className="w-full text-left px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20 rounded"
                >
                  + New Session
                </button>
                {currentModelSessions.map(session => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between px-2 py-1 text-xs rounded ${
                        session.id === currentSessionId
                          ? "bg-emerald-500/30 text-emerald-300"
                          : "text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <button
                        onClick={() => {
                          loadSession(session.id).catch(console.warn);
                          setShowSessionsList(false);
                        }}
                        className="flex-1 text-left truncate"
                        disabled={modelLoading}
                      >
                        {session.name} ({session.messageCount})
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id).catch(console.warn);
                        }}
                        className="text-red-400 hover:text-red-300 ml-2"
                        disabled={modelLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                {currentModelSessions.length === 0 && (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    {modelLoading ? "Loading sessions..." : "No saved sessions"}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Messages Container */}
            <div className="h-48 overflow-y-auto border-b border-emerald-500/20 bg-black/50 p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-6">
                  Select a model and start chatting to test capabilities
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-xs ${
                        msg.role === "user"
                          ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30"
                          : "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30"
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      {msg.modelUsed && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          {msg.modelUsed}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-b border-emerald-500/20 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  disabled={!selectedModel || loading || modelLoading}
                  placeholder={
                    modelLoading ? "Loading model..." : 
                    selectedModel ? "Ask the model..." : "Select a model first"
                  }
                  className="flex-1 bg-black/50 border border-emerald-500/30 rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60"
                />
                <button
                  onClick={() => setEnableContext(!enableContext)}
                  className={`px-2 py-1 rounded text-xs font-mono border transition-all ${
                    enableContext
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                      : "bg-gray-500/20 border-gray-500/50 text-gray-400"
                  }`}
                  title={`Context: ${enableContext ? 'ON' : 'OFF'} - ${enableContext ? 'Chat history provides context' : 'Each message independent'}`}
                >
                  CTX
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!selectedModel || loading || !input.trim()}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 rounded text-xs font-mono text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>

              {/* Info Text */}
              {selectedModel && (
                <p className="text-[10px] text-gray-500">
                  <span className="text-emerald-400">{selectedModel}</span> • 
                  {messages.length} msgs • 
                  {enableContext ? (
                    <span className="text-cyan-400">context: last {Math.min(messages.length, MAX_CONTEXT_MESSAGES)}</span>
                  ) : (
                    <span className="text-gray-400">no context</span>
                  )} • 
                  <span className="text-purple-400">{generateSessionName(messages)}</span>
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="p-3 bg-black/70 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={startNewSession}
                  className="flex-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 rounded text-xs font-mono text-emerald-400 transition-all"
                >
                  New
                </button>
                <button
                  onClick={clearHistory}
                  disabled={messages.length === 0}
                  className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded text-xs font-mono text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={saveHistory}
                  disabled={messages.length === 0}
                  className={`flex-1 px-2 py-1 border rounded text-xs font-mono transition-all ${
                    isSaved
                      ? "bg-green-500/40 border-green-500/50 text-green-400"
                      : "bg-blue-500/20 hover:bg-blue-500/40 border-blue-500/50 text-blue-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSaved ? "✓ Saved" : "Export"}
                </button>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1 text-xs text-gray-500">
                  {currentModelSessions.length} sessions stored
                </div>
                <button
                  onClick={clearAllSessions}
                  className="px-2 py-1 bg-gray-500/20 hover:bg-gray-500/40 border border-gray-500/50 rounded text-xs font-mono text-gray-400 transition-all"
                  title="Clear all saved sessions"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
