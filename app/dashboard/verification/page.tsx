'use client'

import { useState, useEffect } from 'react'
import { H1 } from '@/components/ui/typography'
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
import ClassicLoader from '@/components/ui/loader'

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

      await loadRequests()
      await loadStats()
      setSelectedRequest(null)
    } catch (error: any) {
      setError(error.message || 'Failed to update request status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'text-amber-400 border-amber-400/50 bg-amber-400/10', icon: Clock },
      approved: { color: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10', icon: CheckCircle2 },
      rejected: { color: 'text-red-400 border-red-400/50 bg-red-400/10', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon || Clock

    return (
      <span className={`px-2 py-0.5 text-xs font-medium tracking-wider uppercase border ${config?.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      fan: 'text-blue-400 border-blue-400/50 bg-blue-400/10',
      artist: 'text-purple-400 border-purple-400/50 bg-purple-400/10',
      promoter: 'text-orange-400 border-orange-400/50 bg-orange-400/10',
      club_owner: 'text-pink-400 border-pink-400/50 bg-pink-400/10'
    }

    return (
      <span className={`px-2 py-0.5 text-xs font-medium tracking-wider uppercase border ${roleColors[role as keyof typeof roleColors]}`}>
        {role.replace('_', ' ')}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClassicLoader />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <H1 variant="display" className="mb-2">
          Verification Requests
        </H1>
        <p className="text-white/50 font-medium tracking-wider uppercase text-sm">
          Review and approve user role verification requests
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-center space-x-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Total Requests
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-amber-400 mb-1">{stats.pending}</div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Pending Review
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-emerald-400 mb-1">{stats.approved}</div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Approved
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-red-400 mb-1">{stats.rejected}</div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Rejected
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900/50 border border-white/10 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-900/50 border border-white/10 text-white placeholder-white/40 focus:border-white/20 transition-colors font-medium tracking-wider text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 font-medium tracking-wider uppercase text-xs transition-colors border ${
                  filterStatus === status
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-900/50 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-neutral-900/50 border border-white/10 p-5 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div className="relative w-10 h-10 bg-white/5 overflow-hidden flex items-center justify-center">
                  {request.user?.avatar_url ? (
                    <Image
                      src={request.user.avatar_url}
                      alt={request.user.display_name || 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white/40" />
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
                  <div className="flex items-center gap-4 text-white/50 text-xs">
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
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors font-medium tracking-wider uppercase text-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review</span>
                </button>

                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'approved')}
                      className="flex items-center space-x-2 px-3 py-2 border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 transition-colors font-medium tracking-wider uppercase text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                      className="flex items-center space-x-2 px-3 py-2 border border-red-400/50 text-red-400 hover:bg-red-400/10 transition-colors font-medium tracking-wider uppercase text-xs"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2 tracking-wider uppercase">
              No Requests Found
            </h3>
            <p className="text-white/50 text-sm">
              {filterStatus === 'all'
                ? 'No verification requests submitted yet'
                : `No ${filterStatus} verification requests found`
              }
            </p>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-6">
                <h2 className="text-xl font-bold tracking-wider uppercase text-white">
                  Verification Request Details
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-colors font-medium tracking-wider uppercase text-xs"
                >
                  Close
                </button>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4">User Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/40 text-xs font-medium tracking-wider uppercase">Name:</span>
                      <p className="text-white">{selectedRequest.user?.display_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs font-medium tracking-wider uppercase">Current Role:</span>
                      <div className="mt-1">{getRoleBadge(selectedRequest.user?.role || 'fan')}</div>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs font-medium tracking-wider uppercase">Requested Role:</span>
                      <div className="mt-1">{getRoleBadge(selectedRequest.requested_role)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4">Request Status</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/40 text-xs font-medium tracking-wider uppercase">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs font-medium tracking-wider uppercase">Submitted:</span>
                      <p className="text-white">
                        {formatDistanceToNow(new Date(selectedRequest.submitted_at), { addSuffix: true })}
                      </p>
                    </div>
                    {selectedRequest.reviewed_at && (
                      <div>
                        <span className="text-white/40 text-xs font-medium tracking-wider uppercase">Reviewed:</span>
                        <p className="text-white">
                          {formatDistanceToNow(new Date(selectedRequest.reviewed_at), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(selectedRequest.documents).map(([key, value]) => (
                    <div key={key} className="bg-neutral-900/50 border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/50 text-xs font-medium tracking-wider uppercase">
                          {key.replace('_', ' ')}:
                        </span>
                        {value && (
                          <Link href={value as string} target="_blank" rel="noopener noreferrer">
                            <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs font-medium tracking-wider uppercase">
                              <ExternalLink className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-6">
                <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(selectedRequest.social_links).map(([key, value]) => (
                    <div key={key} className="bg-neutral-900/50 border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/50 text-xs font-medium tracking-wider uppercase">
                          {key}:
                        </span>
                        {value && (
                          <Link href={value as string} target="_blank" rel="noopener noreferrer">
                            <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs font-medium tracking-wider uppercase">
                              <ExternalLink className="w-3 h-3" />
                              <span>Visit</span>
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(selectedRequest.business_info).map(([key, value]) => (
                    <div key={key} className="bg-neutral-900/50 border border-white/10 p-4">
                      <span className="text-white/40 text-xs font-medium tracking-wider uppercase block mb-1">
                        {key.replace('_', ' ')}:
                      </span>
                      <p className="text-white text-sm">
                        {Array.isArray(value) ? value.join(', ') : value?.toString() || 'Not provided'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.admin_notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4">Admin Notes</h3>
                  <div className="bg-neutral-900/50 border border-white/10 p-4">
                    <p className="text-white text-sm">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 justify-end border-t border-white/10 pt-6">
                  <button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected', 'Request rejected by admin')}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-400/50 text-red-400 hover:bg-red-400/10 transition-colors font-medium tracking-wider uppercase text-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Request</span>
                  </button>
                  <button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'approved', 'Request approved by admin')}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium tracking-wider uppercase text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Request</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
