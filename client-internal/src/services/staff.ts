import { internalApiClient } from './api'
import type { StaffMember } from '../types'

const STAFF_STORAGE_KEY = 'internal_staff_members'

function readSavedStaffMembers() {
  const stored = localStorage.getItem(STAFF_STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as StaffMember[]
  } catch {
    localStorage.removeItem(STAFF_STORAGE_KEY)
    return null
  }
}

function writeSavedStaffMembers(staffMembers: StaffMember[]) {
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffMembers))
  return staffMembers
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  const saved = readSavedStaffMembers()
  if (saved) return saved

  const baseStaff = await internalApiClient.getStaffMembers()
  writeSavedStaffMembers(baseStaff)
  return baseStaff
}

export function saveStaffMembers(staffMembers: StaffMember[]) {
  return writeSavedStaffMembers(staffMembers)
}

export async function addStaffMember(staffMember: StaffMember): Promise<StaffMember[]> {
  const current = await getStaffMembers()
  return writeSavedStaffMembers([staffMember, ...current])
}

export async function updateStaffMember(updatedStaff: StaffMember): Promise<StaffMember[]> {
  const current = await getStaffMembers()
  return writeSavedStaffMembers(current.map((staff) => (staff.id === updatedStaff.id ? updatedStaff : staff)))
}
