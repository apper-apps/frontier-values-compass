import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from './Layout'
import { routes, routeArray } from './config/routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {routeArray.map(route => (
            <Route 
              key={route.id}
              path={route.path}
              element={<route.component />}
            />
          ))}
          <Route path="*" element={<div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-display text-primary mb-4">Page Not Found</h2>
              <p className="text-secondary">The page you're looking for doesn't exist.</p>
            </div>
          </div>} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-[9999]"
        toastClassName="bg-white border border-surface-200 shadow-lg"
        bodyClassName="font-body text-sm text-gray-700"
        progressClassName="bg-primary"
      />
    </BrowserRouter>
  )
}

export default App