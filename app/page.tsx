'use client'

import { useState, useCallback, useEffect } from 'react'
import { StatusBar } from '@/components/status-bar'
import { QuestsSidebar, Quest } from '@/components/quests-sidebar'
import { ChatConsole } from '@/components/chat-console'
import { ParticleBackground } from '@/components/particle-background'

export default function ArisePage() {
  const [monarchRank, setMonarchRank] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isAiActive, setIsAiActive] = useState(false)
  const [quests, setQuests] = useState<Quest[]>([
    { id: '1', title: 'Initialize the Shadow System', completed: true },
    { id: '2', title: 'Establish communication with ARISE', completed: false },
    { id: '3', title: 'Complete first shadow extraction', completed: false },
  ])

  // Track typing state from chat
  useEffect(() => {
    const handleTyping = () => {
      setIsTyping(true)
      const timeout = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timeout)
    }
    // This would need to be connected to the chat input
    // For now, we'll use a simpler approach
  }, [])

  const handleAddQuest = useCallback((title: string) => {
    const newQuest: Quest = {
      id: Date.now().toString(),
      title,
      completed: false,
    }
    setQuests((prev) => [...prev, newQuest])
  }, [])

  const handleToggleQuest = useCallback((id: string) => {
    setQuests((prev) => {
      const updated = prev.map((quest) =>
        quest.id === id ? { ...quest, completed: !quest.completed } : quest
      )
      
      const completedCount = updated.filter(q => q.completed).length
      const previousCompletedCount = prev.filter(q => q.completed).length
      
      if (completedCount > previousCompletedCount && completedCount % 3 === 0) {
        setMonarchRank((r) => r + 1)
      }
      
      return updated
    })
  }, [])

  const handleRemoveQuest = useCallback((id: string) => {
    setQuests((prev) => prev.filter((quest) => quest.id !== id))
  }, [])

  // Set AI active state based on messages (simplified)
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAiActive(prev => !prev)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden relative animate-page-fade-in">
      <ParticleBackground isTyping={isTyping} isActive={isAiActive} />
      
      <div className={`relative z-10 flex flex-col h-full transition-all duration-500 ${isTyping ? 'focus-mode-active' : ''}`}>
        <StatusBar 
          monarchRank={monarchRank} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="hidden lg:flex lg:w-72 animate-stagger" style={{ animationDelay: '0.1s' }}>
            <QuestsSidebar
              quests={quests}
              onAddQuest={handleAddQuest}
              onToggleQuest={handleToggleQuest}
              onRemoveQuest={handleRemoveQuest}
            />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm animate-fade-in" 
              onClick={() => setSidebarOpen(false)} 
            />
          )}

          <div 
            className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-all duration-300 lg:hidden ${
              sidebarOpen ? 'translate-x-0 animate-sidebar-slide' : '-translate-x-full'
            }`}
          >
            <QuestsSidebar
              quests={quests}
              onAddQuest={handleAddQuest}
              onToggleQuest={handleToggleQuest}
              onRemoveQuest={handleRemoveQuest}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
          
          <div className="flex-1 animate-stagger" style={{ animationDelay: '0.2s' }}>
            <ChatConsole />
          </div>
        </div>
      </div>
    </div>
  )
}
