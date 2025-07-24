"use client"

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
  label?: string
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 10,
  label,
  readonly = false,
  size = 'md',
  className
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const handleStarClick = (starValue: number) => {
    if (!readonly) {
      onChange(starValue)
    }
  }

  const handleStarHover = (starValue: number) => {
    if (!readonly) {
      setHoverValue(starValue)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null)
    }
  }

  const getStarFill = (starIndex: number) => {
    const currentValue = hoverValue !== null ? hoverValue : value
    
    if (starIndex <= currentValue) {
      return 'fill-white text-white'
    } else {
      return 'fill-transparent text-white/30'
    }
  }

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      {label && (
        <label className="text-white/80 font-bold tracking-widest uppercase text-sm">
          {label}
        </label>
      )}
      
      <div className="flex items-center justify-between" onMouseLeave={handleMouseLeave}>
        <div className="flex items-center space-x-1">
          {Array.from({ length: max }, (_, index) => {
            const starValue = index + 1
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => handleStarHover(starValue)}
                disabled={readonly}
                className={cn(
                  "transition-all duration-200 hover:scale-110",
                  readonly ? "cursor-default" : "cursor-pointer",
                  sizeClasses[size]
                )}
              >
                <Star className={cn("transition-colors duration-200", getStarFill(starValue))} />
              </button>
            )
          })}
        </div>
        
        {!readonly && (
          <div className="bg-white/5 border border-white/20 px-4 py-2 min-w-[80px] text-center">
            <span className="text-white font-bold text-lg">
              {hoverValue !== null ? hoverValue : value || 0}
            </span>
            <span className="text-white/60 font-medium tracking-wider uppercase text-sm ml-1">
              /10
            </span>
          </div>
        )}
        
        {readonly && value > 0 && (
          <div className="bg-white/5 border border-white/20 px-3 py-1">
            <span className="text-white font-bold text-sm">
              {value.toFixed(1)}/10
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// 4-Category Rating Component
interface RatingFormProps {
  ratings: {
    sound: number
    vibe: number
    crowd: number
    overall: number
  }
  onChange: (ratings: { sound: number; vibe: number; crowd: number; overall: number }) => void
  readonly?: boolean
}

export const FourCategoryRating: React.FC<RatingFormProps> = ({
  ratings,
  onChange,
  readonly = false
}) => {
  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    onChange({
      ...ratings,
      [category]: value
    })
  }

  const categories = [
    { key: 'sound' as const, label: 'SOUND', description: 'Audio quality & mixing' },
    { key: 'vibe' as const, label: 'VIBE', description: 'Atmosphere & energy' },
    { key: 'crowd' as const, label: 'CROWD', description: 'People & dancing' },
    { key: 'overall' as const, label: 'OVERALL', description: 'General experience' }
  ]

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.key} className="bg-white/5 border border-white/20 p-6">
          <div className="mb-4">
            <h4 className="text-white font-bold tracking-widest uppercase text-sm mb-1">
              {category.label}
            </h4>
            <p className="text-white/60 text-xs tracking-wider uppercase">
              {category.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 10 }, (_, index) => {
                const starValue = index + 1
                const isActive = starValue <= ratings[category.key]
                
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => handleRatingChange(category.key, starValue)}
                    disabled={readonly}
                    className="transition-all duration-200 hover:scale-110 cursor-pointer w-5 h-5"
                  >
                    <Star 
                      className={`transition-colors duration-200 ${
                        isActive ? 'fill-white text-white' : 'fill-transparent text-white/30'
                      }`} 
                    />
                  </button>
                )
              })}
            </div>
            
            <div className="bg-black border border-white/30 px-4 py-2 min-w-[80px] text-center">
              <span className="text-white font-bold text-xl">
                {ratings[category.key] || 0}
              </span>
              <span className="text-white/60 font-medium tracking-wider uppercase text-sm ml-1">
                /10
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}