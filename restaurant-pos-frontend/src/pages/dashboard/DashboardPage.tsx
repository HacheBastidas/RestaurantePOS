import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingCartIcon, 
  FireIcon, 
  CurrencyDollarIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { OrderSummary, OrderStatus } from '../../types/order'
import { Table } from '../../types/table'

const DashboardPage = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    deliveredOrders: 0,
    totalSales: 0,
    tablesFree: 0,
    tablesOccupied: 0
  })
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, podríamos tener un endpoint específico para el dashboard
        // Por ahora, hacemos múltiples llamadas para simular la obtención de datos
        
        // Obtener órdenes recientes
        const ordersResponse = await api.get('/orders')
        const orders: OrderSummary[] = ordersResponse.data
        
        // Obtener estado de las mesas
        const tablesResponse = await api.get('/tables')
        const tables: Table[] = tablesResponse.data
        
        // Calcular estadísticas
        const pendingOrders = orders.filter(order => order.status === OrderStatus.PENDING).length
        const preparingOrders = orders.filter(order => order.status === OrderStatus.PREPARING).length
        const readyOrders = orders.filter(order => order.status === OrderStatus.READY).length
        const deliveredOrders = orders.filter(order => order.status === OrderStatus.DELIVERED).length
        
        const paidOrders = orders.filter(order => order.status === OrderStatus.PAID)
        const totalSales = paidOrders.reduce((sum, order) => sum + order.total, 0)
        
        const tablesFree = tables.filter(table => !table.is_occupied).length
        const tablesOccupied = tables.filter(table => table.is_occupied).length
        
        setStats({
          pendingOrders,
          preparingOrders,
          readyOrders,
          deliveredOrders,
          totalSales,
          tablesFree,
          tablesOccupied
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
        toast.error('Error al cargar datos del dashboard')
        setIsLoading(false)
      }
    }
    
    // Para el propósito de este ejemplo, usamos datos de demostración sin llamadas reales a la API
    // En una implementación real, descomentar la función de arriba
    
    // Simulación de carga de datos
    setTimeout(() => {
      setStats({
        pendingOrders: 5,
        preparingOrders: 3,
        readyOrders: 2,
        deliveredOrders: 8,
        totalSales: 15750.50,
        tablesFree: 8,
        tablesOccupied: 4
      })
      setIsLoading(false)
    }, 1000)
    
    // fetchDashboardData()
  }, [])
  
  // Tarjetas de estadísticas para mostrar según el rol
  const statCards = [
    {
      title: 'Órdenes pendientes',
      value: stats.pendingOrders,
      icon: ShoppingCartIcon,
      color: 'bg-yellow-500',
      roles: ['admin', 'waiter', 'kitchen'],
      link: user?.role === 'kitchen' ? '/kitchen' : '/orders',
    },
    {
      title: 'Órdenes en preparación',
      value: stats.preparingOrders,
      icon: FireIcon,
      color: 'bg-orange-500',
      roles: ['admin', 'kitchen'],
      link: '/kitchen',
    },
    {
      title: 'Órdenes listas',
      value: stats.readyOrders,
      icon: ShoppingCartIcon,
      color: 'bg-green-500',
      roles: ['admin', 'waiter', 'cashier'],
      link: user?.role === 'cashier' ? '/cashier' : '/orders',
    },
    {
      title: 'Ventas totales',
      value: `$${stats.totalSales.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-blue-500',
      roles: ['admin', 'cashier'],
      link: '/cashier',
    },
    {
      title: 'Mesas disponibles',
      value: stats.tablesFree,
      icon: TableCellsIcon,
      color: 'bg-green-500',
      roles: ['admin', 'waiter'],
      link: '/tables',
    },
    {
      title: 'Mesas ocupadas',
      value: stats.tablesOccupied,
      icon: TableCellsIcon,
      color: 'bg-red-500',
      roles: ['admin', 'waiter'],
      link: '/tables',
    },
  ]
  
  const filteredStatCards = user?.role 
    ? statCards.filter(card => card.roles.includes(user.role))
    : []
  
  if (isLoading) {
    return (
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg h-32">
                <div className="h-full bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStatCards.map((card, index) => (
          <Link 
            key={index} 
            to={card.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {card.value}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Bienvenido al sistema POS de restaurante
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Selecciona una opción del menú para comenzar a trabajar.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="text-sm text-gray-500">
            <p className="mb-2">Este es un ejemplo de dashboard. En una implementación real, mostrarías:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Estadísticas en tiempo real</li>
              <li>Gráficos de ventas</li>
              <li>Órdenes recientes</li>
              <li>Productos más vendidos</li>
              <li>Y más información relevante para el usuario según su rol</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage