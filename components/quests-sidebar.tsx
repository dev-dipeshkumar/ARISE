'use client'

import { useState } from 'react'
import { Scroll, Plus, X, CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface Quest {
  id: string
  title: string
  completed: boolean
}

interface QuestsSidebarProps {
  quests: Quest[]
  onAddQuest: (title: string) => void
  onToggleQuest: (id: string) => void
  onRemoveQuest: (id: string) => void
  onClose?: () => void
}

export function QuestsSidebar({ quests, onAddQuest, onToggleQuest, onRemoveQuest, onClose }: QuestsSidebarProps) {
  const [newQuest, setNewQuest] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newQuest.trim()) {
      onAddQuest(newQuest.trim())
      setNewQuest('')
    }
  }

  const activeQuests = quests.filter(q => !q.completed)
  const completedQuests = quests.filter(q => q.completed)

  return (
    <aside className="w-64 sm:w-72 flex flex-col border-r border-border bg-card/30 backdrop-blur-sm animate-sidebar-slide">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Scroll className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-sm font-bold tracking-wider uppercase">Active Quests</h2>
        </div>
        <p className="text-xs text-muted-foreground">Track your objectives, Monarch</p>
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-b border-border/50">
        <div className="flex gap-2">
          <Input
            value={newQuest}
            onChange={(e) => setNewQuest(e.target.value)}
            placeholder="Add new quest..."
            className="flex-1 bg-input border-border/50 text-sm h-9 focus:border-primary focus:ring-primary/30 transition-all focus:scale-[1.02]"
          />
          <Button 
            type="submit" 
            size="sm"
            className="bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary h-9 px-3 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeQuests.length === 0 && completedQuests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-stagger">
            <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-2 animate-float" />
            <p className="text-xs text-muted-foreground">No quests active</p>
            <p className="text-[10px] text-muted-foreground/70">Add a quest to begin, Monarch</p>
          </div>
        )}

        {activeQuests.map((quest, index) => (
          <QuestCard 
            key={quest.id} 
            quest={quest} 
            onToggle={onToggleQuest}
            onRemove={onRemoveQuest}
            index={index}
          />
        ))}

        {completedQuests.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</span>
            </div>
            {completedQuests.map((quest, index) => (
              <QuestCard 
                key={quest.id} 
                quest={quest} 
                onToggle={onToggleQuest}
                onRemove={onRemoveQuest}
                index={index + activeQuests.length}
              />
            ))}
          </>
        )}
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Quest Progress</span>
          <span className="text-primary font-semibold">
            {completedQuests.length}/{quests.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 animate-layered-glow"
            style={{ width: quests.length > 0 ? `${(completedQuests.length / quests.length) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </aside>
  )
}

interface QuestCardProps {
  quest: Quest
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  index: number
}

function QuestCard({ quest, onToggle, onRemove, index }: QuestCardProps) {
  return (
    <div 
      className={`group flex items-start gap-2 p-2.5 rounded-lg border transition-all duration-200 animate-task-slide ${
        quest.completed 
          ? 'bg-secondary/20 border-border/30 opacity-60' 
          : 'bg-secondary/40 border-border/50 hover:border-primary/50 hover:bg-secondary/60 hover:glow-border'
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        onClick={() => onToggle(quest.id)}
        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
      >
        {quest.completed ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 animate-layered-glow" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>
      <span className={`flex-1 text-sm leading-tight transition-all ${quest.completed ? 'line-through text-muted-foreground' : ''}`}>
        {quest.title}
      </span>
      <button
        onClick={() => onRemove(quest.id)}
        className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
      </button>
    </div>
  )
}
