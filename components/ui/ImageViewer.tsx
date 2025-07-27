'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'
import ClassicLoader from '@/components/ui/loader'

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  title?: string
}

export default function ImageViewer({ 
  images, 
  initialIndex = 0, 
  isOpen, 
  onClose, 
  title 
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsZoomed(false)
      setImageLoaded(false)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, initialIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  const goToNext = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setImageLoaded(false)
    }
  }

  const goToPrevious = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      setImageLoaded(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex])
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${currentIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  if (!images.length) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Header with controls */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center space-x-4">
              {title && (
                <h3 className="text-white font-bold tracking-wider uppercase text-lg">
                  {title}
                </h3>
              )}
              {images.length > 1 && (
                <span className="text-white/60 text-sm">
                  {currentIndex + 1} of {images.length}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsZoomed(!isZoomed)
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded"
                title={isZoomed ? "Zoom Out" : "Zoom In"}
              >
                {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded-full"
                title="Previous Image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded-full"
                title="Next Image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Main image container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`relative max-w-[90vw] max-h-[80vh] ${isZoomed ? 'max-w-none max-h-none' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading spinner */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                <ClassicLoader />
              </div>
            )}

            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className={`rounded transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'} object-contain`}
              style={{
                maxWidth: isZoomed ? 'none' : '90vw',
                maxHeight: isZoomed ? 'none' : '80vh',
                width: 'auto',
                height: 'auto'
              }}
              onLoad={() => setImageLoaded(true)}
              onClick={() => setIsZoomed(!isZoomed)}
              priority
            />
          </motion.div>

          {/* Thumbnail strip for multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentIndex(index)
                      setImageLoaded(false)
                    }}
                    className={`relative w-12 h-12 overflow-hidden rounded transition-all ${
                      index === currentIndex 
                        ? 'ring-2 ring-white scale-110' 
                        : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}