import { createContext, useState, useEffect, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { UserRole } from '../types/user'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
}

interface JwtPayload {
  sub: string
  exp: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Comprobar si hay un token guardado en localStorage
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Verificar que el token no ha expirado
          const { exp } = jwtDecode<JwtPayload>(token)
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (exp < currentTime) {
            // Token expirado, eliminar token y usuario
            localStorage.removeItem('token')
            setUser(null)
            setIsLoading(false)
            return
          }
          
          // Establecer el token en el header de axios
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Obtener información del usuario
          const response = await api.get('/users/me')
          setUser(response.data)
        } catch (error) {
          console.error('Error al verificar autenticación:', error)
          localStorage.removeItem('token')
          setUser(null)
        }
      }
      
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      // Crear URLSearchParams en lugar de FormData
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      const response = await api.post('/users/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      
      // Guardar token en localStorage
      localStorage.setItem('token', access_token);
      
      // Establecer el token en el header de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Obtener información del usuario
      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      
      toast.success('¡Inicio de sesión exitoso!');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Usuario o contraseña incorrectos');
      throw error;
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('¡Sesión cerrada correctamente!')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext