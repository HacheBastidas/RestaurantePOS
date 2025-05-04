import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Página no encontrada</h2>
        <p className="mt-2 text-sm text-gray-600">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-primary inline-flex items-center"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage