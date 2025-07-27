'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VerificationForm } from '@/components/verification/VerificationForm'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertCircle,
  Plus,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react'
import { verificationService, VerificationRequest } from '@/lib/services/verification'
import { formatDistanceToNow } from 'date-fns'
import { UserRole } from '@/lib/auth'

export default function VerificationPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('artist')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Auto-set role and show form if coming from registration
  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && ['artist', 'promoter', 'club_owner'].includes(roleParam)) {
      setSelectedRole(roleParam as UserRole)
      setShowForm(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      loadRequests()
    }
  }, [user])

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const data = await verificationService.getUserVerificationRequests()
      setRequests(data)
    } catch (error: any) {
      setError(error.message || 'Failed to load verification requests')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30', 
        icon: Clock,
        text: 'UNDER REVIEW'
      },
      approved: { 
        color: 'bg-green-400/20 text-green-400 border-green-400/30', 
        icon: CheckCircle2,
        text: 'APPROVED'
      },
      rejected: { 
        color: 'bg-red-400/20 text-red-400 border-red-400/30', 
        icon: XCircle,
        text: 'REJECTED'
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon || Clock
    
    return (
      <Badge className={`${config?.color} font-bold tracking-wider uppercase text-sm flex items-center gap-2`}>
        <Icon className="w-4 h-4" />
        {config?.text || status}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      artist: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
      promoter: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
      club_owner: 'bg-pink-400/20 text-pink-400 border-pink-400/30'
    }
    
    return (
      <Badge className={`${roleColors[role as keyof typeof roleColors]} font-bold tracking-wider uppercase text-sm`}>
        {role.replace('_', ' ')}
      </Badge>
    )
  }

  const canRequestVerification = () => {
    // Users can request verification if they don't have a pending request
    const hasPendingRequest = requests.some(req => req.status === 'pending')
    return !hasPendingRequest && user?.role === 'fan'
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    loadRequests()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="bg-white/5 border border-white/20 p-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-2">
                AUTHENTICATION REQUIRED
              </h3>
              <p className="text-white/60 font-medium tracking-wider uppercase">
                Please sign in to access verification requests
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <VerificationForm
          requestedRole={selectedRole}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-widest uppercase text-white mb-4">
            ROLE VERIFICATION
          </h1>
          <p className="text-white/80 font-medium tracking-wider uppercase">
            REQUEST VERIFICATION FOR ARTIST, PROMOTER, OR VENUE OWNER ROLES
          </p>
        </div>

        {/* Current User Status */}
        <Card className="bg-white/5 border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-2">
                CURRENT ACCOUNT STATUS
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-white/60" />
                  <span className="text-white font-medium tracking-wider uppercase">
                    {user.display_name || user.email}
                  </span>
                </div>
                {getRoleBadge(user.role)}
                {user.is_verified && (
                  <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 font-bold tracking-wider uppercase text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    VERIFIED
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => loadRequests()}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-bold tracking-wider uppercase"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              REFRESH
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-bold tracking-wider uppercase text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* New Verification Request */}
        {canRequestVerification() && (
          <Card className="bg-white/5 border border-white/20 p-6 mb-8">
            <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-4">
              REQUEST ROLE VERIFICATION
            </h3>
            <p className="text-white/80 font-medium tracking-wider uppercase mb-6">
              Choose the role you want to verify for and submit your documentation
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { id: 'artist', name: 'Artist', description: 'Manage your artist profile and gigs' },
                { id: 'promoter', name: 'Promoter', description: 'Create and manage events' },
                { id: 'club_owner', name: 'Venue Owner', description: 'Manage venue listings' }
              ].map((role) => (
                <label
                  key={role.id}
                  className={`relative flex flex-col p-4 rounded border cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-white/30 bg-black hover:bg-white/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white tracking-wider uppercase">{role.name}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === role.id
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-white/40'
                    }`}>
                      {selectedRole === role.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/60 font-medium tracking-wider uppercase">{role.description}</p>
                </label>
              ))}
            </div>
            
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-12 bg-white text-black hover:bg-cyan-400 font-bold tracking-wider uppercase transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              START VERIFICATION REQUEST
            </Button>
          </Card>
        )}

        {/* Existing Requests */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-wider uppercase text-white">
            YOUR VERIFICATION REQUESTS
          </h3>
          
          {isLoading ? (
            <Card className="bg-white/5 border border-white/20 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white border-2 border-white mx-auto mb-8 relative">
                  <div className="absolute inset-2 bg-black" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white animate-pulse" />
                  </div>
                </div>
                <p className="text-white/80 font-bold tracking-widest uppercase text-sm">
                  LOADING VERIFICATION REQUESTS...
                </p>
              </div>
            </Card>
          ) : requests.length === 0 ? (
            <Card className="bg-white/5 border border-white/20 p-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-2">
                  NO VERIFICATION REQUESTS
                </h3>
                <p className="text-white/60 font-medium tracking-wider uppercase">
                  You haven't submitted any verification requests yet
                </p>
              </div>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="bg-white/5 border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getRoleBadge(request.requested_role)}
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium tracking-wider uppercase">
                      {formatDistanceToNow(new Date(request.submitted_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-bold text-white tracking-wider uppercase mb-2">
                    {request.requested_role.replace('_', ' ')} VERIFICATION REQUEST
                  </h4>
                  <p className="text-white/80 font-medium text-sm">
                    Request to upgrade your account to {request.requested_role.replace('_', ' ')} role
                  </p>
                </div>

                {request.status === 'pending' && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-yellow-400 tracking-wider uppercase text-sm">
                        UNDER REVIEW
                      </span>
                    </div>
                    <p className="text-yellow-400/80 font-medium text-sm tracking-wider uppercase">
                      Your verification request is being reviewed by our admin team. 
                      You will be notified within 3-5 business days.
                    </p>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="bg-green-400/10 border border-green-400/30 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="font-bold text-green-400 tracking-wider uppercase text-sm">
                        APPROVED
                      </span>
                    </div>
                    <p className="text-green-400/80 font-medium text-sm tracking-wider uppercase">
                      Congratulations! Your verification request has been approved. 
                      Your account role has been updated.
                    </p>
                    {request.reviewed_at && (
                      <p className="text-green-400/60 font-medium text-xs tracking-wider uppercase mt-2">
                        Approved {formatDistanceToNow(new Date(request.reviewed_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="bg-red-400/10 border border-red-400/30 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-red-400 tracking-wider uppercase text-sm">
                        REJECTED
                      </span>
                    </div>
                    <p className="text-red-400/80 font-medium text-sm tracking-wider uppercase">
                      Your verification request has been rejected. 
                      Please review the admin notes and submit a new request with correct documentation.
                    </p>
                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-red-400/5 border border-red-400/20 rounded">
                        <p className="text-red-400/90 font-medium text-sm">
                          <strong className="tracking-wider uppercase">Admin Notes:</strong> {request.admin_notes}
                        </p>
                      </div>
                    )}
                    {request.reviewed_at && (
                      <p className="text-red-400/60 font-medium text-xs tracking-wider uppercase mt-2">
                        Rejected {formatDistanceToNow(new Date(request.reviewed_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}