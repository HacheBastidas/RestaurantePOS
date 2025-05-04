import React, { useState, FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { isAuthenticated, login } = useAuth()
  
  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Por favor ingresa usuario y contraseña')
      return
    }
    
    setIsLoading(true)
    
    try {
      await login(username, password)
      // La redirección se maneja en el componente con la verificación de isAuthenticated
    } catch (error) {
      // El error ya se muestra en la función login mediante toast
      console.error('Error durante el inicio de sesión:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema POS para Restaurantes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="form-label">
                Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="text-sm text-center">
              <p className="text-gray-600">
                ¿Credenciales de ejemplo?
              </p>
              <ul className="mt-2 text-gray-500">
                <li>Usuario: admin - Contraseña: admin123</li>
                <li>Usuario: mesero - Contraseña: mesero123</li>
                <li>Usuario: cocina - Contraseña: cocina123</li>
                <li>Usuario: cajero - Contraseña: cajero123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage