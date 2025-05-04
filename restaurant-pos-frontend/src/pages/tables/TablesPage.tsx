import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: 4,
    status: 'available'
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      toast.error('Error al cargar mesas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTable) {
        await api.put(`/tables/${selectedTable.id}`, formData);
        toast.success('Mesa actualizada correctamente');
      } else {
        await api.post('/tables', formData);
        toast.success('Mesa creada correctamente');
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (error) {
      console.error('Error al guardar mesa:', error);
      toast.error('Error al guardar mesa');
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mesas</h1>
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
        <h1 className="text-2xl font-semibold text-gray-900">Mesas</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Mesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div 
            key={table.id} 
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">Mesa {table.number}</h3>
                <p className="text-sm text-gray-500">Capacidad: {table.capacity} personas</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2
                  ${table.status === 'available' ? 'bg-green-100 text-green-800' : 
                    table.status === 'occupied' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}
                >
                  {table.status === 'available' ? 'Disponible' : 
                   table.status === 'occupied' ? 'Ocupada' : 'Reservada'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedTable(table);
                    setFormData({
                      number: table.number.toString(),
                      capacity: table.capacity,
                      status: table.status
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
        ))}
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
                    {selectedTable ? 'Editar Mesa' : 'Nueva Mesa'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="number" className="form-label">Número de Mesa</label>
                      <input
                        type="number"
                        name="number"
                        id="number"
                        required
                        min="1"
                        className="form-input"
                        value={formData.number}
                        onChange={(e) => setFormData({...formData, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="capacity" className="form-label">Capacidad</label>
                      <input
                        type="number"
                        name="capacity"
                        id="capacity"
                        required
                        min="1"
                        className="form-input"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3"
                  >
                    {selectedTable ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline mt-3 sm:mt-0"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedTable(null);
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

export default TablesPage;