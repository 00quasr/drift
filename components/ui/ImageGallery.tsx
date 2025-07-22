'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Camera, Eye } from 'lucide-react'
import ImageViewer from './ImageViewer'

interface ImageGalleryProps {
  images: string[]
  title?: string
  className?: string
  maxDisplay?: number
  aspectRatio?: 'square' | 'video' | 'auto'
}

export default function ImageGallery({ 
  images, 
  title, 
  className = '', 
  maxDisplay = 6,
  aspectRatio = 'square'
}: ImageGalleryProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`bg-black/50 border border-white/20 p-8 text-center ${className}`}>
        <Camera className="w-12 h-12 mx-auto mb-4 text-white/30" />
        <p className="text-white/60 font-bold tracking-wider uppercase text-sm">
          No Images Available
        </p>
      </div>
    )
  }

  const openViewer = (index: number) => {
    setSelectedImageIndex(index)
    setViewerOpen(true)
  }

  const displayImages = images.slice(0, maxDisplay)
  const remainingCount = images.length - maxDisplay

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      default:
        return 'aspect-auto'
    }
  }

  return (
    <>
      <div className={`${className}`}>
        {title && (
          <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-3" />
            {title}
            <span className="ml-2 text-sm text-white/60 font-normal">
              ({images.length} {images.length === 1 ? 'image' : 'images'})
            </span>
          </h3>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayImages.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer overflow-hidden bg-black/50 border border-white/20 hover:border-white/40 transition-colors"
            >
              <div className={`relative ${getAspectRatioClass()} overflow-hidden`}>
                <Image
                  src={image}
                  alt={`${title || 'Image'} ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-white">
                    <Eye className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-wider uppercase">
                      View
                    </span>
                  </div>
                </div>

                {/* Show remaining count on last image */}
                {index === maxDisplay - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <span className="text-2xl font-bold">+{remainingCount}</span>
                      <p className="text-sm font-bold tracking-wider uppercase mt-1">
                        More
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Click handler */}
              <button
                onClick={() => openViewer(index)}
                className="absolute inset-0 w-full h-full z-10"
                aria-label={`View ${title || 'image'} ${index + 1}`}
              />
            </motion.div>
          ))}
        </div>

        {/* Show more button if there are remaining images */}
        {remainingCount > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => openViewer(0)}
              className="px-4 py-2 border border-white/30 text-white hover:border-white/60 hover:bg-white/10 transition-colors font-bold tracking-wider uppercase text-sm"
            >
              View All {images.length} Images
            </button>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={title}
      />
    </>
  )
}