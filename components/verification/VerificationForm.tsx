'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Image, 
  Globe, 
  Instagram, 
  Music, 
  MapPin,
  Building,
  Users,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react'
import { UserRole } from '@/lib/auth'
import { verificationService, CreateVerificationRequest } from '@/lib/services/verification'

interface VerificationFormProps {
  requestedRole: UserRole
  onSuccess?: () => void
  onCancel?: () => void
}

export function VerificationForm({ requestedRole, onSuccess, onCancel }: VerificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState<CreateVerificationRequest>({
    requested_role: requestedRole,
    documents: {},
    social_links: {},
    business_info: {}
  })

  const handleInputChange = (section: keyof CreateVerificationRequest, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await verificationService.submitVerificationRequest(formData)
      setSuccess('Verification request submitted successfully! We will review your application within 3-5 business days.')
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Failed to submit verification request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleConfig = {
    artist: {
      title: 'Artist Verification',
      description: 'Verify your identity as a music artist to manage your profile and gigs',
      requirements: [
        'Government-issued ID or passport',
        'Portfolio of your music work',
        'Social media profiles showing your music activity',
        'Streaming platform links (Spotify, SoundCloud, etc.)'
      ]
    },
    promoter: {
      title: 'Promoter Verification', 
      description: 'Verify your identity as an event promoter to create and manage events',
      requirements: [
        'Government-issued ID or passport',
        'Business license or registration documents',
        'Portfolio of previous events you have organized',
        'Social media profiles or website showing your promotion activity'
      ]
    },
    club_owner: {
      title: 'Venue Owner Verification',
      description: 'Verify your ownership or management of a venue to list it on Drift',
      requirements: [
        'Government-issued ID or passport',
        'Business license and venue permits',
        'Proof of venue ownership or management agreement',
        'Photos of your venue interior and exterior'
      ]
    }
  }

  const config = roleConfig[requestedRole as keyof typeof roleConfig]
  if (!config) return null

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold tracking-wider uppercase text-white">
            {config.title}
          </h1>
          <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 font-bold tracking-wider uppercase">
            VERIFICATION REQUIRED
          </Badge>
        </div>
        <p className="text-white/80 font-medium tracking-wider uppercase">
          {config.description}
        </p>
      </div>

      {/* Requirements */}
      <Card className="bg-white/5 border border-white/20 p-6 mb-8">
        <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          REQUIRED DOCUMENTS
        </h3>
        <ul className="space-y-2">
          {config.requirements.map((requirement, index) => (
            <li key={index} className="flex items-center gap-3 text-white/80 font-medium tracking-wider uppercase text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              {requirement}
            </li>
          ))}
        </ul>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 font-bold tracking-wider uppercase text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-green-400 font-bold tracking-wider uppercase text-sm">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity Documents */}
        <Card className="bg-white/5 border border-white/20 p-6">
          <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            IDENTITY DOCUMENTS
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-white font-bold tracking-widest uppercase text-sm">
                Government-issued ID or Passport URL
              </Label>
              <Input
                type="url"
                placeholder="UPLOAD TO CLOUD AND PASTE URL HERE"
                value={formData.documents.identity_document || ''}
                onChange={(e) => handleInputChange('documents', 'identity_document', e.target.value)}
                className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                required
              />
            </div>

            {requestedRole !== 'artist' && (
              <div>
                <Label className="text-white font-bold tracking-widest uppercase text-sm">
                  Business License URL
                </Label>
                <Input
                  type="url"
                  placeholder="UPLOAD YOUR BUSINESS LICENSE AND PASTE URL"
                  value={formData.documents.business_license || ''}
                  onChange={(e) => handleInputChange('documents', 'business_license', e.target.value)}
                  className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  required
                />
              </div>
            )}

            {requestedRole === 'artist' && (
              <div>
                <Label className="text-white font-bold tracking-widest uppercase text-sm">
                  Artist Portfolio URL
                </Label>
                <Input
                  type="url"
                  placeholder="LINK TO YOUR MUSIC PORTFOLIO OR PRESS KIT"
                  value={formData.documents.artist_portfolio || ''}
                  onChange={(e) => handleInputChange('documents', 'artist_portfolio', e.target.value)}
                  className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  required
                />
              </div>
            )}
          </div>
        </Card>

        {/* Social Media Links */}
        <Card className="bg-white/5 border border-white/20 p-6">
          <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            SOCIAL MEDIA & ONLINE PRESENCE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white font-bold tracking-widest uppercase text-sm">Website</Label>
              <Input
                type="url"
                placeholder="YOUR OFFICIAL WEBSITE"
                value={formData.social_links.website || ''}
                onChange={(e) => handleInputChange('social_links', 'website', e.target.value)}
                className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
              />
            </div>
            <div>
              <Label className="text-white font-bold tracking-widest uppercase text-sm">Instagram</Label>
              <Input
                type="url"
                placeholder="INSTAGRAM PROFILE URL"
                value={formData.social_links.instagram || ''}
                onChange={(e) => handleInputChange('social_links', 'instagram', e.target.value)}
                className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
              />
            </div>
            <div>
              <Label className="text-white font-bold tracking-widest uppercase text-sm">SoundCloud</Label>
              <Input
                type="url"
                placeholder="SOUNDCLOUD PROFILE URL"
                value={formData.social_links.soundcloud || ''}
                onChange={(e) => handleInputChange('social_links', 'soundcloud', e.target.value)}
                className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
              />
            </div>
            <div>
              <Label className="text-white font-bold tracking-widest uppercase text-sm">Spotify</Label>
              <Input
                type="url"
                placeholder="SPOTIFY ARTIST URL"
                value={formData.social_links.spotify || ''}
                onChange={(e) => handleInputChange('social_links', 'spotify', e.target.value)}
                className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
              />
            </div>
          </div>
        </Card>

        {/* Business Information */}
        <Card className="bg-white/5 border border-white/20 p-6">
          <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            {requestedRole === 'artist' ? 'ARTIST INFORMATION' : 'BUSINESS INFORMATION'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requestedRole === 'artist' ? (
              <>
                <div>
                  <Label className="text-white font-bold tracking-widest uppercase text-sm">Artist Name</Label>
                  <Input
                    type="text"
                    placeholder="YOUR STAGE NAME"
                    value={formData.business_info.artist_name || ''}
                    onChange={(e) => handleInputChange('business_info', 'artist_name', e.target.value)}
                    className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white font-bold tracking-widest uppercase text-sm">Genres</Label>
                  <Input
                    type="text"
                    placeholder="TECHNO, HOUSE, TRANCE (COMMA SEPARATED)"
                    value={formData.business_info.genres?.join(', ') || ''}
                    onChange={(e) => handleInputChange('business_info', 'genres', e.target.value.split(',').map(g => g.trim()))}
                    className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  />
                </div>
              </>
            ) : requestedRole === 'club_owner' ? (
              <>
                <div>
                  <Label className="text-white font-bold tracking-widest uppercase text-sm">Venue Name</Label>
                  <Input
                    type="text"
                    placeholder="YOUR VENUE NAME"
                    value={formData.business_info.venue_name || ''}
                    onChange={(e) => handleInputChange('business_info', 'venue_name', e.target.value)}
                    className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white font-bold tracking-widest uppercase text-sm">Venue Address</Label>
                  <Input
                    type="text"
                    placeholder="FULL VENUE ADDRESS"
                    value={formData.business_info.venue_address || ''}
                    onChange={(e) => handleInputChange('business_info', 'venue_address', e.target.value)}
                    className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white font-bold tracking-widest uppercase text-sm">Capacity</Label>
                  <Input
                    type="number"
                    placeholder="MAXIMUM CAPACITY"
                    value={formData.business_info.capacity || ''}
                    onChange={(e) => handleInputChange('business_info', 'capacity', parseInt(e.target.value))}
                    className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-white font-bold tracking-widest uppercase text-sm">Company Name</Label>
                  <Input
                    type="text"
                    placeholder="YOUR COMPANY NAME"
                    value={formData.business_info.company_name || ''}
                    onChange={(e) => handleInputChange('business_info', 'company_name', e.target.value)}
                    className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white font-bold tracking-widest uppercase text-sm">Business Address</Label>
                  <Input
                    type="text"
                    placeholder="BUSINESS ADDRESS"
                    value={formData.business_info.business_address || ''}
                    onChange={(e) => handleInputChange('business_info', 'business_address', e.target.value)}
                    className="mt-2 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                    required
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-8 h-12 border-2 border-white/30 text-white hover:bg-white/10 font-bold tracking-wider uppercase"
          >
            <X className="w-4 h-4 mr-2" />
            CANCEL
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 h-12 bg-white text-black hover:bg-cyan-400 font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              'SUBMITTING...'
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                SUBMIT VERIFICATION
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}