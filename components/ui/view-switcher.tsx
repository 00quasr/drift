'use client'

import { Grid3X3, List } from 'lucide-react'

export type ViewMode = 'grid' | 'list'

interface ViewSwitcherProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  itemCount: number
  className?: string
}

export function ViewSwitcher({ viewMode, onViewModeChange, itemCount, className = '' }: ViewSwitcherProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* View Mode Switcher */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/20 p-1">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 transition-all duration-200 ${
            viewMode === 'grid'
              ? 'bg-white text-black'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Grid View"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 transition-all duration-200 ${
            viewMode === 'list'
              ? 'bg-white text-black'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="List View"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-white/60">
        <span className="font-medium tracking-wider uppercase text-sm">
          {itemCount} ITEMS
        </span>
      </div>
    </div>
  )
}