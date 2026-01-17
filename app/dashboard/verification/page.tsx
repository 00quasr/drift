'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  FileText, 
  Globe, 
  Building,
  Eye,
  Calendar,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react'
import { verificationService, VerificationRequest } from '@/lib/services/verification'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    by_role: {} as Record<string, number>
  })

  useEffect(() => {
    loadRequests()
    loadStats()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, filterStatus, searchTerm])

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const data = await verificationService.getAllVerificationRequests()
      setRequests(data)
    } catch (error: any) {
      setError(error.message || 'Failed to load verification requests')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await verificationService.getVerificationStats()
      setStats(statsData)
    } catch (error: any) {
      console.error('Failed to load stats:', error)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requested_role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await verificationService.updateVerificationRequest(requestId, {
        status,
        admin_notes: notes
      })
      
      // Refresh data
      await loadRequests()
      await loadStats()
      setSelectedRequest(null)
    } catch (error: any) {
      setError(error.message || 'Failed to update request status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30', icon: Clock },
      approved: { color: 'bg-green-400/20 text-green-400 border-green-400/30', icon: CheckCircle2 },
      rejected: { color: 'bg-red-400/20 text-red-400 border-red-400/30', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon || Clock
    
    return (
      <Badge className={`${config?.color} font-bold tracking-wider uppercase text-xs flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      fan: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
      artist: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
      promoter: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
      club_owner: 'bg-pink-400/20 text-pink-400 border-pink-400/30'
    }
    
    return (
      <Badge className={`${roleColors[role as keyof typeof roleColors]} font-bold tracking-wider uppercase text-xs`}>
        {role.replace('_', ' ')}
      </Badge>
    )
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-widest uppercase text-white mb-4">
            VERIFICATION DASHBOARD
          </h1>
          <p className="text-white/80 font-medium tracking-wider uppercase">
            REVIEW AND APPROVE USER ROLE VERIFICATION REQUESTS
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded mb-6">
            <p className="text-red-400 font-bold tracking-wider uppercase text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border border-white/20 p-6">
            <div className="text-2xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
              TOTAL REQUESTS
            </div>
          </Card>
          <Card className="bg-yellow-400/10 border border-yellow-400/30 p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.pending}</div>
            <div className="text-yellow-400/80 font-bold tracking-wider uppercase text-sm">
              PENDING REVIEW
            </div>
          </Card>
          <Card className="bg-green-400/10 border border-green-400/30 p-6">
            <div className="text-2xl font-bold text-green-400 mb-2">{stats.approved}</div>
            <div className="text-green-400/80 font-bold tracking-wider uppercase text-sm">
              APPROVED
            </div>
          </Card>
          <Card className="bg-red-400/10 border border-red-400/30 p-6">
            <div className="text-2xl font-bold text-red-400 mb-2">{stats.rejected}</div>
            <div className="text-red-400/80 font-bold tracking-wider uppercase text-sm">
              REJECTED
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="SEARCH BY NAME OR ROLE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase text-sm rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <Button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  className={`font-bold tracking-wider uppercase text-sm ${
                    filterStatus === status
                      ? 'bg-white text-black'
                      : 'border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="bg-white/5 border border-white/20 p-6 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="relative w-12 h-12 bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                    {request.user?.avatar_url ? (
                      <Image
                        src={request.user.avatar_url}
                        alt={request.user.display_name || 'User'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white/60" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white tracking-wider uppercase">
                        {request.user?.display_name || 'Unknown User'}
                      </h3>
                      {getRoleBadge(request.requested_role)}
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <span className="font-medium tracking-wider uppercase">{request.user?.display_name || 'Unknown User'}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium tracking-wider uppercase">
                          {formatDistanceToNow(new Date(request.submitted_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedRequest(request)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-bold tracking-wider uppercase text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    REVIEW
                  </Button>
                  
                  {request.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold tracking-wider uppercase text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        APPROVE
                      </Button>
                      <Button
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold tracking-wider uppercase text-sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        REJECT
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredRequests.length === 0 && (
            <Card className="bg-white/5 border border-white/20 p-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold tracking-wider uppercase text-white mb-2">
                  NO REQUESTS FOUND
                </h3>
                <p className="text-white/60 font-medium tracking-wider uppercase">
                  {filterStatus === 'all' 
                    ? 'No verification requests submitted yet'
                    : `No ${filterStatus} verification requests found`
                  }
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-black border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-wider uppercase text-white">
                    VERIFICATION REQUEST DETAILS
                  </h2>
                  <Button
                    onClick={() => setSelectedRequest(null)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    CLOSE
                  </Button>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-bold tracking-wider uppercase text-white mb-4">USER INFORMATION</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-white/60 font-bold tracking-wider uppercase text-sm">Name:</span>
                        <p className="text-white font-medium">{selectedRequest.user?.display_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-white/60 font-bold tracking-wider uppercase text-sm">Current Role:</span>
                        <div className="mt-1">{getRoleBadge(selectedRequest.user?.role || 'fan')}</div>
                      </div>
                      <div>
                        <span className="text-white/60 font-bold tracking-wider uppercase text-sm">Requested Role:</span>
                        <div className="mt-1">{getRoleBadge(selectedRequest.requested_role)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold tracking-wider uppercase text-white mb-4">REQUEST STATUS</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-white/60 font-bold tracking-wider uppercase text-sm">Status:</span>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      <div>
                        <span className="text-white/60 font-bold tracking-wider uppercase text-sm">Submitted:</span>
                        <p className="text-white font-medium">
                          {formatDistanceToNow(new Date(selectedRequest.submitted_at), { addSuffix: true })}
                        </p>
                      </div>
                      {selectedRequest.reviewed_at && (
                        <div>
                          <span className="text-white/60 font-bold tracking-wider uppercase text-sm">Reviewed:</span>
                          <p className="text-white font-medium">
                            {formatDistanceToNow(new Date(selectedRequest.reviewed_at), { addSuffix: true })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    DOCUMENTS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedRequest.documents).map(([key, value]) => (
                      <div key={key} className="bg-white/5 border border-white/20 p-4 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 font-bold tracking-wider uppercase text-sm">
                            {key.replace('_', ' ')}:
                          </span>
                          {value && (
                            <Link href={value as string} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 text-xs">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                VIEW
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    SOCIAL LINKS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedRequest.social_links).map(([key, value]) => (
                      <div key={key} className="bg-white/5 border border-white/20 p-4 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 font-bold tracking-wider uppercase text-sm">
                            {key}:
                          </span>
                          {value && (
                            <Link href={value as string} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 text-xs">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                VISIT
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    BUSINESS INFORMATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedRequest.business_info).map(([key, value]) => (
                      <div key={key} className="bg-white/5 border border-white/20 p-4 rounded">
                        <span className="text-white/60 font-bold tracking-wider uppercase text-sm block mb-1">
                          {key.replace('_', ' ')}:
                        </span>
                        <p className="text-white font-medium">
                          {Array.isArray(value) ? value.join(', ') : value?.toString() || 'Not provided'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedRequest.admin_notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold tracking-wider uppercase text-white mb-4">ADMIN NOTES</h3>
                    <div className="bg-white/5 border border-white/20 p-4 rounded">
                      <p className="text-white font-medium">{selectedRequest.admin_notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-4 justify-end">
                    <Button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'rejected', 'Request rejected by admin')}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold tracking-wider uppercase"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      REJECT REQUEST
                    </Button>
                    <Button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'approved', 'Request approved by admin')}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold tracking-wider uppercase"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      APPROVE REQUEST
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}