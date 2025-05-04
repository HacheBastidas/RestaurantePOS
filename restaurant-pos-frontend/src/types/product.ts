export interface Category {
    id: number
    name: string
    description?: string
    created_at: string
    updated_at?: string
  }
  
  export interface CategoryCreateRequest {
    name: string
    description?: string
  }
  
  export interface CategoryUpdateRequest {
    name?: string
    description?: string
  }
  
  export interface Product {
    id: number
    name: string
    description?: string
    price: number
    category_id: number
    category: Category
    created_at: string
    updated_at?: string
  }
  
  export interface ProductSimple {
    id: number
    name: string
    description?: string
    price: number
    category_id: number
    created_at: string
    updated_at?: string
  }
  
  export interface ProductCreateRequest {
    name: string
    description?: string
    price: number
    category_id: number
  }
  
  export interface ProductUpdateRequest {
    name?: string
    description?: string
    price?: number
    category_id?: number
  }