import { authService } from '@/lib/auth'

export interface Favorite {
  id: string
  user_id: string
  target_type: 'artist' | 'venue' | 'event'
  target_id: string
  created_at: string
}

class FavoritesService {
  private async getAuthHeaders() {
    const token = await authService.getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  async getFavorites(params?: {
    userId?: string
    targetType?: string
    targetId?: string
  }): Promise<Favorite[]> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.userId) searchParams.append('user_id', params.userId)
      if (params?.targetType) searchParams.append('target_type', params.targetType)
      if (params?.targetId) searchParams.append('target_id', params.targetId)

      const url = `/api/favorites${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      const response = await fetch(url, {
        headers: await this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
  }

  async addFavorite(targetType: 'artist' | 'venue' | 'event', targetId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          // Already favorited, return true
          return true
        }
        throw new Error(error.error || 'Failed to add favorite')
      }

      return true
    } catch (error) {
      console.error('Error adding favorite:', error)
      throw error
    }
  }

  async removeFavorite(targetType: 'artist' | 'venue' | 'event', targetId: string): Promise<boolean> {
    try {
      const searchParams = new URLSearchParams({
        target_type: targetType,
        target_id: targetId
      })

      const response = await fetch(`/api/favorites?${searchParams.toString()}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }

      return true
    } catch (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  }

  async toggleFavorite(targetType: 'artist' | 'venue' | 'event', targetId: string): Promise<boolean> {
    try {
      // Check if it's currently favorited
      const favorites = await this.getFavorites({ targetType, targetId })
      const isFavorited = favorites.length > 0

      if (isFavorited) {
        await this.removeFavorite(targetType, targetId)
        return false
      } else {
        await this.addFavorite(targetType, targetId)
        return true
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  async isFavorited(targetType: 'artist' | 'venue' | 'event', targetId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites({ targetType, targetId })
      return favorites.length > 0
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
    }
  }
}

export const favoritesService = new FavoritesService()