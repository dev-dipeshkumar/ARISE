'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { Send, Loader2, AlertTriangle, Bot, User, Mic, Search, ExternalLink, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VoiceMode } from './voice-mode'

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

function getToolInvocations(message: UIMessage) {
  if (!message.parts || !Array.isArray(message.parts)) return []
  return message.parts.filter(
    (p): p is { type: 'tool-invocation'; toolInvocation: { toolName: string; args: Record<string, unknown>; state: string; output?: unknown } } => 
      p.type === 'tool-invocation'
  )
}

export function ChatConsole() {
  const [input, setInput] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEnergySurge, setShowEnergySurge] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Energy surge effect when AI responds
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        setShowEnergySurge(true)
        const timer = setTimeout(() => setShowEnergySurge(false), 600)
        return () => clearTimeout(timer)
      }
    }
  }, [messages])

  // Handle typing state
  useEffect(() => {
    setIsTyping(input.length > 0)
  }, [input])

  // Initialize speech recognition for inline mic
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const transcriptText = result[0].transcript

        if (result.isFinal) {
          setInput(transcriptText)
          setIsListening(false)
          inputRef.current?.focus()
        }
      }

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          setIsListening(false)
        } else if (event.error === 'not-allowed') {
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleInlineMic = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Failed to start recognition:', error)
      }
    }
  }, [isListening])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleVoiceMessage = useCallback((text: string) => {
    sendMessage({ text })
  }, [sendMessage])

  const lastAssistantMessage = messages
    .filter((m) => m.role === 'assistant')
    .map((m) => getMessageText(m))
    .pop() || null

  return (
    <>
      <div className={`flex-1 flex flex-col bg-background/50 transition-all duration-500 ${showEnergySurge ? 'animate-energy-surge' : ''}`}>
        {/* Chat Header */}
        <div className="px-3 md:px-6 py-2 md:py-3 border-b border-border/50 bg-card/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider truncate">
                Command Console
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceMode(true)}
              className="flex items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary flex-shrink-0 transition-all hover-glow"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Voice Mode</span>
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
          {messages.length === 0 && (
            <WelcomeMessage />
          )}

          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              index={index}
              onEnergySurge={showEnergySurge && index === messages.length - 1}
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <LoadingMessage />
          )}

          {error && <ErrorMessage message={error.message} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-2 md:p-4 border-t border-border/50 bg-card/30">
          <div className="flex gap-2 md:gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Command, Monarch..."
                disabled={isLoading}
                className={`w-full px-3 md:px-4 py-2 md:py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all disabled:opacity-50 font-mono text-sm ${
                  isTyping 
                    ? 'border-primary ring-2 ring-primary/20 typing-glow' 
                    : 'focus:border-primary focus:ring-2 focus:ring-primary/20'
                } focus:scale-[1.02]`}
              />
              {/* Mic button for inline voice input */}
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleInlineMic}
                  disabled={isLoading}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                    isListening 
                      ? 'bg-primary text-primary-foreground animate-pulse-glow' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className={`px-3 md:px-6 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold transition-all glow-border disabled:opacity-50 flex-shrink-0 hover:scale-105 active:scale-95 ${
                showEnergySurge ? 'animate-energy-ripple' : ''
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />
              ) : (
                <Send className="w-4 md:w-5 h-4 md:h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Voice Mode Overlay */}
      {isVoiceMode && (
        <VoiceMode
          onClose={() => setIsVoiceMode(false)}
          onSendMessage={handleVoiceMessage}
          lastAssistantMessage={lastAssistantMessage}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8 md:py-12 px-4 animate-stagger">
      <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 md:mb-4 animate-layered-glow flex-shrink-0">
        <Bot className="w-6 md:w-8 h-6 md:h-8 text-primary" />
      </div>
      <h2 className="text-lg md:text-xl font-bold glow-text mb-2">System Initialized</h2>
      <p className="text-muted-foreground max-w-md text-xs md:text-sm">
        Greetings, Monarch. The shadows await your command. 
        What knowledge do you seek from the void?
      </p>
      <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-1 md:gap-2">
        <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full bg-secondary border border-border text-muted-foreground whitespace-nowrap transition-all hover:border-primary/50">
          Mana: Optimal
        </span>
        <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full bg-secondary border border-border text-muted-foreground whitespace-nowrap transition-all hover:border-primary/50">
          Shadows: Ready
        </span>
        <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full bg-secondary border border-border text-muted-foreground flex items-center gap-1 whitespace-nowrap transition-all hover:border-primary/50 hover:glow-border">
          <Search className="w-3 h-3" />
          <span className="hidden sm:inline">Web Search: Active</span>
          <span className="sm:hidden">Search: Active</span>
        </span>
        <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full bg-secondary border border-border text-muted-foreground flex items-center gap-1 whitespace-nowrap transition-all hover:border-primary/50 hover:glow-border">
          <Mic className="w-3 h-3" />
          <span className="hidden sm:inline">Voice: Available</span>
          <span className="sm:hidden">Voice: Ready</span>
        </span>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: UIMessage
  index: number
  onEnergySurge?: boolean
}

function MessageBubble({ message, index, onEnergySurge }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const text = getMessageText(message)
  const toolInvocations = getToolInvocations(message)
  
  return (
    <div 
      className={`flex gap-2 md:gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-message-enter`}
      style={{ 
        animationDelay: `${index * 0.05}s`,
        animationFillMode: 'both'
      }}
    >
      <div className={`flex-shrink-0 w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
        isUser ? 'bg-accent/30 border border-accent/50' : 'bg-primary/30 border border-primary/50'
      } ${onEnergySurge ? 'animate-energy-ripple' : ''}`}>
        {isUser ? (
          <User className="w-3 md:w-4 h-3 md:h-4 text-accent" />
        ) : (
          <Bot className="w-3 md:w-4 h-3 md:h-4 text-primary" />
        )}
      </div>
      <div className={`max-w-full sm:max-w-[70%] ${isUser ? 'text-right' : ''}`}>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          {isUser ? 'Monarch' : 'ARISE'}
        </div>
        
        {/* Show tool invocations */}
        {toolInvocations.map((tool, index) => (
          <ToolInvocationCard key={index} tool={tool.toolInvocation} />
        ))}
        
        {/* Show text content */}
        {text && (
          <div className={`px-4 py-3 rounded-lg font-mono text-sm leading-relaxed transition-all duration-300 ${
            isUser 
              ? 'bg-accent/20 border border-accent/30 text-foreground' 
              : 'bg-card border border-border text-foreground glow-border hover:glow-outer'
          }`}>
            <p className="whitespace-pre-wrap">{text}</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ToolInvocationCardProps {
  tool: {
    toolName: string
    args: Record<string, unknown>
    state: string
    output?: unknown
  }
}

function ToolInvocationCard({ tool }: ToolInvocationCardProps) {
  if (tool.toolName !== 'webSearch') return null

  const isSearching = tool.state === 'input-streaming' || tool.state === 'input-available'
  const results = tool.output as { results?: Array<{ title: string; link: string; snippet: string }> } | undefined

  return (
    <div className="mb-2 px-4 py-3 rounded-lg bg-secondary/50 border border-border glow-inner transition-all duration-300 hover:glow-border">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Shadow Web Search
        </span>
        {isSearching && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
      </div>
      
      <div className="text-sm text-foreground font-mono mb-2">
        Query: {String(tool.args.query || '')}
      </div>

      {results?.results && results.results.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Intelligence Extracted:
          </div>
          {results.results.slice(0, 3).map((result, index) => (
            <a
              key={index}
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded bg-background/50 hover:bg-background/80 transition-all duration-300 group hover:glow-border"
            >
              <div className="flex items-start gap-2">
                <ExternalLink className="w-3 h-3 mt-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="text-xs text-primary font-medium line-clamp-1 group-hover:text-layered-glow transition-all">
                    {result.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                    {result.snippet}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex gap-3 animate-message-enter">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/30 border border-primary/50 flex items-center justify-center animate-layered-glow">
        <Bot className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          ARISE
        </div>
        <div className="px-4 py-3 rounded-lg bg-card border border-border glow-border">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground font-mono animate-pulse">
              Shadows are gathering...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorMessage({ message }: { message?: string | null }) {
  return (
    <div className="flex gap-3 animate-message-enter">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-destructive/30 border border-destructive/50 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-destructive" />
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          SYSTEM
        </div>
        <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 glow-border-accent">
          <p className="text-sm text-destructive font-mono">
            {message || 'System Glitch Detected. Attempting recovery...'}
          </p>
        </div>
      </div>
    </div>
  )
}
