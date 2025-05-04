import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, formData);
        toast.success('Usuario actualizado correctamente');
      } else {
        await api.post('/users', formData);
        toast.success('Usuario creado correctamente');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error('Error al guardar usuario');
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Usuarios</h1>
        <div className="animate-pulse">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-primary-600">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setFormData({
                          username: user.username,
                          email: user.email,
                          password: '',
                          role: user.role,
                          is_active: user.is_active
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="form-label">Nombre de usuario</label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        required
                        className="form-input"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">Correo electrónico</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="form-label">
                        Contraseña {selectedUser && '(dejar en blanco para mantener la actual)'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        required={!selectedUser}
                        className="form-input"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="form-label">Rol</label>
                      <select
                        name="role"
                        id="role"
                        required
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        className="form-checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      />
                      <label htmlFor="is_active" className="ml-2">Usuario activo</label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3"
                  >
                    {selectedUser ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline mt-3 sm:mt-0"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;