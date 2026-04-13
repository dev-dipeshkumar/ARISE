'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShadowHeartbeat } from './shadow-heartbeat'

interface VoiceModeProps {
  onClose: () => void
  onSendMessage: (message: string) => void
  lastAssistantMessage: string | null
  isLoading: boolean
}

export function VoiceMode({ onClose, onSendMessage, lastAssistantMessage, isLoading }: VoiceModeProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [displayText, setDisplayText] = useState('Press the microphone to speak, Monarch...')
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const lastSpokenRef = useRef<string>('')

  // Initialize speech recognition
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

        setTranscript(transcriptText)
        setDisplayText(transcriptText)

        if (result.isFinal) {
          setIsListening(false)
          onSendMessage(transcriptText)
          setTranscript('')
          setDisplayText('Processing your command...')
        }
      }

      recognition.onerror = (event) => {
        // Handle different error types gracefully
        if (event.error === 'no-speech') {
          // No speech detected - just reset and allow retry
          setIsListening(false)
          setDisplayText('No voice detected. Press the microphone to speak again, Monarch.')
        } else if (event.error === 'aborted') {
          // User cancelled - do nothing
          setIsListening(false)
        } else if (event.error === 'not-allowed') {
          setIsListening(false)
          setDisplayText('Microphone access denied. Please enable microphone permissions.')
        } else {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setDisplayText('Voice recognition failed. Try again, Monarch.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [onSendMessage])

  // Speak assistant responses
  useEffect(() => {
    if (lastAssistantMessage && !isMuted && lastAssistantMessage !== lastSpokenRef.current && !isLoading) {
      lastSpokenRef.current = lastAssistantMessage
      speakText(lastAssistantMessage)
      setDisplayText(lastAssistantMessage)
    }
  }, [lastAssistantMessage, isMuted, isLoading])

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis || isMuted) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85 // Slower for dramatic effect
    utterance.pitch = 0.6 // Lower pitch for deep shadow voice
    utterance.volume = 1

    // Wait for voices to load then find a deep male voice
    const loadVoicesAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      const deepVoice = voices.find(
      (voice) =>
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('james') ||
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('google uk english male')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0]

      if (deepVoice) {
        utterance.voice = deepVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        setDisplayText('Awaiting your command, Monarch...')
      }
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }

    // Voices might not be loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak
    } else {
      loadVoicesAndSpeak()
    }
  }, [isMuted])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setDisplayText('Voice recognition not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      // Stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setDisplayText('Listening...')
      } catch (error) {
        console.error('Failed to start recognition:', error)
        setDisplayText('Failed to start listening. Please try again.')
      }
    }
  }, [isListening])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      return !prev
    })
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold glow-text mb-2">ARISE Voice Mode</h2>
        <p className="text-sm text-muted-foreground">Shadow Communication Channel Active</p>
      </div>

      {/* Heartbeat visualization */}
      <div className="w-full max-w-2xl px-8 mb-8">
        <ShadowHeartbeat
          isActive={isListening || isSpeaking || isLoading}
          isListening={isListening}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Display text */}
      <div className="max-w-xl px-8 mb-12 text-center">
        <p className="text-foreground font-mono text-lg leading-relaxed animate-in fade-in duration-300">
          {isLoading ? 'The shadows are gathering a response...' : displayText}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full border-2 transition-all ${
            isMuted 
              ? 'border-destructive/50 text-destructive' 
              : 'border-accent/50 text-accent hover:border-accent'
          }`}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>

        <Button
          onClick={toggleListening}
          disabled={isLoading || isSpeaking}
          className={`w-20 h-20 rounded-full transition-all ${
            isListening
              ? 'bg-primary animate-pulse-glow shadow-lg shadow-primary/50'
              : 'bg-primary/20 hover:bg-primary/40 border-2 border-primary/50'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-primary-foreground" />
          ) : (
            <Mic className="w-8 h-8 text-primary" />
          )}
        </Button>

        <div className="w-14 h-14" /> {/* Spacer for symmetry */}
      </div>

      {/* Status indicators */}
      <div className="mt-8 flex gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
          isListening ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
          Input
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
          isSpeaking ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
          Output
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
          isMuted ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-destructive' : 'bg-muted-foreground'}`} />
          {isMuted ? 'Muted' : 'Sound On'}
        </div>
      </div>
    </div>
  )
}
