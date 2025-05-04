import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Product, Category, ProductCreateRequest, ProductUpdateRequest } from '../../types/product'
import api from '../../services/api'

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductCreateRequest | ProductUpdateRequest>({
    name: '',
    description: '',
    price: 0,
    category_id: 0
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      toast.error('Error al cargar categorías')
    }
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: categories.length > 0 ? categories[0].id : 0
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleOpenDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedProduct(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'category_id' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (selectedProduct) {
        // Actualizar producto existente
        await api.put(`/products/${selectedProduct.id}`, formData)
        toast.success('Producto actualizado correctamente')
      } else {
        // Crear nuevo producto
        await api.post('/products', formData)
        toast.success('Producto creado correctamente')
      }
      
      handleCloseModal()
      fetchProducts()
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast.error('Error al guardar producto')
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    
    try {
      await api.delete(`/products/${selectedProduct.id}`)
      toast.success('Producto eliminado correctamente')
      handleCloseDeleteModal()
      fetchProducts()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      toast.error('Error al eliminar producto')
    }
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Productos</h1>
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
        <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
          No hay productos disponibles. ¡Agrega uno nuevo!
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {product.name}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="truncate">{product.description}</span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary-100 text-secondary-800">
                          {product.category.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-gray-400 hover:text-primary-600 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(product)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal para crear/editar producto */}
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
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="form-label">Nombre</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="form-input"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="form-label">Descripción</label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        className="form-input"
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="price" className="form-label">Precio</label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        min="0"
                        step="0.01"
                        required
                        className="form-input"
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="category_id" className="form-label">Categoría</label>
                      <select
                        name="category_id"
                        id="category_id"
                        required
                        className="form-input"
                        value={formData.category_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3"
                  >
                    {selectedProduct ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline mt-3 sm:mt-0"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar Producto
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro que deseas eliminar el producto "{selectedProduct.name}"? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-danger sm:ml-3"
                  onClick={handleDelete}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  className="btn-outline mt-3 sm:mt-0"
                  onClick={handleCloseDeleteModal}
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

export default ProductsPage
