export enum UserRole {
    ADMIN = 'admin',
    WAITER = 'waiter',
    KITCHEN = 'kitchen',
    CASHIER = 'cashier',
  }
  
  export interface User {
    id: number
    username: string
    email: string
    full_name: string
    role: UserRole
    is_active: boolean
    created_at: string
    updated_at?: string
  }
  
  export interface UserLoginRequest {
    username: string
    password: string
  }
  
  export interface UserResponse {
    id: number
    username: string
    email: string
    full_name: string
    role: UserRole
    is_active: boolean
    created_at: string
    updated_at?: string
  }
  
  export interface UserCreateRequest {
    username: string
    email: string
    password: string
    full_name: string
    role: UserRole
  }
  
  export interface UserUpdateRequest {
    username?: string
    email?: string
    password?: string
    full_name?: string
    role?: UserRole
    is_active?: boolean
  }