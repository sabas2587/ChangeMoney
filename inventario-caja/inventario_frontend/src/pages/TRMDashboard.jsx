import TRMForm from '../components/TRMForm'

function TRMDashboard() {
  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
          Gestión de Tasas de Cambio (TRM)
        </h2>
        <TRMForm />
      </div>
    </div>
  )
}

export default TRMDashboard
