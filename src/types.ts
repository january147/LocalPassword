export interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  website?: string
  notes?: string
  category: string
  created_at: string
  updated_at: string
}

export interface GeneratePasswordConfig {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}
