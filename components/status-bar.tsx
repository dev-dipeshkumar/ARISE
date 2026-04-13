'use client'

import { Activity, Zap, Crown, Shield, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatusBarProps {
  monarchRank: number
  onMenuClick?: () => void
  isSidebarOpen?: boolean
}

export function StatusBar({ monarchRank, onMenuClick, isSidebarOpen }: StatusBarProps) {
  return (
    <header className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-border bg-card/50 backdrop-blur-sm animate-stagger">
      <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 transition-all hover:scale-110 hover:bg-primary/20"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-1 md:gap-2 min-w-0">
          <Crown className="w-5 md:w-6 h-5 md:h-6 text-primary animate-orb-pulse flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-bold tracking-wider glow-text truncate">ARISE</h1>
        </div>
        <span className="hidden sm:inline text-[10px] md:text-xs text-muted-foreground px-2 py-1 rounded bg-secondary/50 border border-border whitespace-nowrap hover:border-primary/50 transition-colors">
          SHADOW MONARCH
        </span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6 flex-wrap justify-end">
        <StatusIndicator 
          icon={<Zap className="w-3 md:w-4 h-3 md:h-4" />}
          label="Mana"
          value="Optimal"
          color="text-accent"
          mobile={true}
        />
        <StatusIndicator 
          icon={<Crown className="w-3 md:w-4 h-3 md:h-4" />}
          label="Rank"
          value={`Lv.${monarchRank}`}
          color="text-primary"
          mobile={true}
        />
        <StatusIndicator 
          icon={<Shield className="w-3 md:w-4 h-3 md:h-4" />}
          label="System"
          value="Online"
          color="text-green-400"
          mobile={true}
        />
        <div className="flex items-center gap-1">
          <Activity className="w-3 md:w-4 h-3 md:h-4 text-primary animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
    </header>
  )
}

interface StatusIndicatorProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  mobile?: boolean
}

function StatusIndicator({ icon, label, value, color, mobile }: StatusIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-secondary/30 border border-border/50 transition-all duration-300 hover:border-primary/30 hover:glow-border ${
      mobile ? 'hidden sm:flex' : 'flex'
    }`}>
      <span className={`${color} transition-all duration-300`}>{icon}</span>
      <div className="hidden md:flex md:flex-col">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-semibold ${color}`}>{value}</span>
      </div>
      <span className="md:hidden text-[10px] font-semibold text-muted-foreground">{value}</span>
    </div>
  )
}
