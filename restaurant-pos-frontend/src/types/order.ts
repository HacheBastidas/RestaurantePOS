import { ProductSimple } from './product'
import { Table } from './table'

export enum OrderType {
  TABLE = 'table',
  DELIVERY = 'delivery',
}

export enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  PAID = 'paid',
}

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
  notes?: string
  created_at: string
  updated_at?: string
  product: ProductSimple
}

export interface OrderItemCreate {
  product_id: number
  quantity: number
  notes?: string
}

export interface OrderItemUpdate {
  quantity?: number
  notes?: string
}

export interface Order {
  id: number
  order_number: string
  order_type: OrderType
  status: OrderStatus
  table_id?: number
  customer_name?: string
  customer_phone?: string
  customer_address?: string
  subtotal: number
  tax: number
  total: number
  created_by: number
  created_at: string
  updated_at?: string
  items: OrderItem[]
  table?: Table
}

export interface OrderSummary {
  id: number
  order_number: string
  order_type: OrderType
  status: OrderStatus
  total: number
  created_at: string
  table_id?: number
  customer_name?: string
}

export interface OrderCreate {
  order_type: OrderType
  table_id?: number
  customer_name?: string
  customer_phone?: string
  customer_address?: string
  items: OrderItemCreate[]
}

export interface OrderUpdate {
  status?: OrderStatus
  table_id?: number
  customer_name?: string
  customer_phone?: string
  customer_address?: string
}

export interface OrderItemsCreate {
  items: OrderItemCreate[]
}