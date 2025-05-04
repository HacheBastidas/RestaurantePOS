import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline'
import { OrderSummary, OrderStatus, OrderType } from '../../types/order'
import api from '../../services/api'

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [selectedType, setSelectedType] = useState<OrderType | ''>('')

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus, selectedType])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      let url = '/orders?'
      if (selectedStatus) {
        url += `status=${selectedStatus}&`
      }
      if (selectedType) {
        url += `order_type=${selectedType}&`
      }
      
      const response = await api.get(url)
      setOrders(response.data)
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
      toast.error('Error al cargar órdenes')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case OrderStatus.PREPARING:
        return 'bg-blue-100 text-blue-800'
      case OrderStatus.READY:
        return 'bg-green-100 text-green-800'
      case OrderStatus.DELIVERED:
        return 'bg-purple-100 text-purple-800'
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800'
      case OrderStatus.PAID:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente'
      case OrderStatus.PREPARING:
        return 'Preparando'
      case OrderStatus.READY:
        return 'Listo'
      case OrderStatus.DELIVERED:
        return 'Entregado'
      case OrderStatus.CANCELLED:
        return 'Cancelado'
      case OrderStatus.PAID:
        return 'Pagado'
      default:
        return status
    }
  }

  const getOrderTypeText = (type: OrderType) => {
    return type === OrderType.TABLE ? 'Mesa' : 'Domicilio'
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Órdenes</h1>
        <div className="animate-pulse">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <li key={i}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Órdenes</h1>
        <button 
          onClick={() => {/* Aquí iría la lógica para crear una nueva orden */}}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Orden
        </button>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="form-label">Estado</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
              >
                <option value="">Todos los estados</option>
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type" className="form-label">Tipo</label>
              <select
                id="type"
                name="type"
                className="form-input"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as OrderType | '')}
              >
                <option value="">Todos los tipos</option>
                {Object.values(OrderType).map((type) => (
                  <option key={type} value={type}>
                    {getOrderTypeText(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
          No hay órdenes disponibles con los filtros seleccionados.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {order.order_number}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {getOrderTypeText(order.order_type)}
                            {order.order_type === OrderType.TABLE ? (
                              <span className="ml-1">
                                {order.table_id ? `- Mesa ${order.table_id}` : ''}
                              </span>
                            ) : (
                              <span className="ml-1">
                                {order.customer_name ? `- ${order.customer_name}` : ''}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <button
                        onClick={() => {/* Aquí iría la lógica para ver detalle */}}
                        className="text-gray-400 hover:text-primary-600"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default OrdersPage