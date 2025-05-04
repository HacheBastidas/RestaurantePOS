import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OrdersPage from './pages/orders/OrdersPage'
import KitchenPage from './pages/kitchen/KitchenPage'
import CashierPage from './pages/cashier/CashierPage'
import ProductsPage from './pages/products/ProductsPage'
import CategoriesPage from './pages/products/CategoriesPage'
import TablesPage from './pages/tables/TablesPage'
import UsersPage from './pages/users/UsersPage'
import NotFoundPage from './pages/NotFoundPage'

// Componente para rutas protegidas
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rutas protegidas con Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        <Route path="orders" element={<OrdersPage />} />
        
        <Route path="kitchen" element={
          <ProtectedRoute roles={['admin', 'kitchen']}>
            <KitchenPage />
          </ProtectedRoute>
        } />
        
        <Route path="cashier" element={
          <ProtectedRoute roles={['admin', 'cashier']}>
            <CashierPage />
          </ProtectedRoute>
        } />
        
        <Route path="products" element={
          <ProtectedRoute roles={['admin']}>
            <ProductsPage />
          </ProtectedRoute>
        } />
        
        <Route path="categories" element={
          <ProtectedRoute roles={['admin']}>
            <CategoriesPage />
          </ProtectedRoute>
        } />
        
        <Route path="tables" element={
          <ProtectedRoute roles={['admin']}>
            <TablesPage />
          </ProtectedRoute>
        } />
        
        <Route path="users" element={
          <ProtectedRoute roles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Página 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App