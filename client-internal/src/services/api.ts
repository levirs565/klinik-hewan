import { API_BASE_URL, DUMMY_MODE } from '../config'
import * as dummy from '../data/dummy'
import type { AuthResponse, LoginRequest, ServiceRequest, StaffMember, StaffUser } from '../types'

class InternalAPIClient {
  private accessToken: string | null = localStorage.getItem('internal_access_token')

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    localStorage.setItem('internal_access_token', accessToken)
    localStorage.setItem('internal_refresh_token', refreshToken)
  }

  clearTokens() {
    this.accessToken = null
    localStorage.removeItem('internal_access_token')
    localStorage.removeItem('internal_refresh_token')
    localStorage.removeItem('internal_user')
  }

  async loginStaff(data: LoginRequest): Promise<AuthResponse> {
    if (DUMMY_MODE) {
      const response = await dummy.loginDummy(data)
      this.setTokens(response.access_token, response.refresh_token)
      localStorage.setItem('internal_user', JSON.stringify(response.user))
      return response
    }

    const response = await fetch(`${API_BASE_URL}/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Login gagal')
    }

    const authResponse = (await response.json()) as AuthResponse
    this.setTokens(authResponse.access_token, authResponse.refresh_token)
    localStorage.setItem('internal_user', JSON.stringify(authResponse.user))
    return authResponse
  }

  async logout() {
    this.clearTokens()
  }

  async getMe(): Promise<StaffUser> {
    if (DUMMY_MODE) return dummy.getMeDummy()

    const response = await this.fetchWithAuth('/staff/me')
    return (await response.json()) as StaffUser
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    if (DUMMY_MODE) return dummy.getServiceRequestsDummy()

    const response = await this.fetchWithAuth('/internal/service-requests')
    return (await response.json()) as ServiceRequest[]
  }

  async getStaffMembers(): Promise<StaffMember[]> {
    if (DUMMY_MODE) return dummy.getStaffMembersDummy()

    const response = await this.fetchWithAuth('/internal/staff')
    return (await response.json()) as StaffMember[]
  }

  private async fetchWithAuth(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : undefined,
    })

    if (!response.ok) {
      throw new Error('Request gagal')
    }

    return response
  }
}

export const internalApiClient = new InternalAPIClient()
