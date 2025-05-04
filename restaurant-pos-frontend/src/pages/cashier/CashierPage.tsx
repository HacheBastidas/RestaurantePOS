import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  BanknotesIcon, 
  EyeIcon, 
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Order, OrderStatus, OrderType } from '../../types/order'
import api from '../../services/api'

const CashierPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Obtenemos órdenes listas y entregadas que no han sido pagadas
      const response = await api.get('/orders/cashier/pending')
      setOrders(response.data)
    } catch (error) {
      console.error('Error al cargar órdenes pendientes de pago:', error)
      toast.error('Error al cargar órdenes pendientes de pago')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order)
    setPaymentAmount(order.total)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  const handleProcessPayment = async () => {
    if (!selectedOrder) return
    
    try {
      // Actualizar estado de la orden a PAID
      await api.put(`/orders/${selectedOrder.id}/status?status=${OrderStatus.PAID}`)
      
      toast.success('Pago procesado correctamente')
      handleCloseModal()
      fetchOrders()
    } catch (error) {
      console.error('Error al procesar pago:', error)
      toast.error('Error al procesar pago')
    }
  }

  const getOrderTypeText = (type: OrderType) => {
    return type === OrderType.TABLE ? 'Mesa' : 'Domicilio'
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.READY:
        return 'Listo para entregar'
      case OrderStatus.DELIVERED:
        return 'Entregado'
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Caja</h1>
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Caja</h1>

      {orders.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
          No hay órdenes pendientes de pago.
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
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <div className="mr-4">
                            <p className="text-xs text-gray-500">Subtotal: {formatCurrency(order.subtotal)}</p>
                            <p className="text-xs text-gray-500">Impuesto: {formatCurrency(order.tax)}</p>
                            <p className="font-bold">Total: {formatCurrency(order.total)}</p>
                          </div>
                          <button
                            onClick={() => handleOpenModal(order)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                          >
                            <BanknotesIcon className="h-4 w-4 mr-1" />
                            Cobrar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal de pago */}
      {isModalOpen && selectedOrder && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Procesar Pago - Orden {selectedOrder.order_number}
                    </h3>
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-sm font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Impuesto:</span>
                        <span className="text-sm font-medium">{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between mb-4 text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="paymentMethod" className="form-label">
                            Método de pago
                          </label>
                          <select
                            id="paymentMethod"
                            name="paymentMethod"
                            className="form-input"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                          </select>
                        </div>

                        {paymentMethod === 'cash' && (
                          <div>
                            <label htmlFor="paymentAmount" className="form-label">
                              Cantidad recibida
                            </label>
                            <input
                              type="number"
                              id="paymentAmount"
                              name="paymentAmount"
                              min={selectedOrder.total}
                              step="0.01"
                              className="form-input"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            />

                            {paymentAmount > selectedOrder.total && (
                              <div className="mt-2 p-2 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">Cambio a entregar:</p>
                                <p className="text-lg font-bold text-green-600">
                                  {formatCurrency(paymentAmount - selectedOrder.total)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center mt-4">
                          <input
                            id="printReceipt"
                            name="printReceipt"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="printReceipt" className="ml-2 block text-sm text-gray-900">
                            Imprimir recibo
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleProcessPayment}
                >
                  Procesar Pago
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CashierPage