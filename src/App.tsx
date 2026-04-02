import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { OrderFormProvider } from './context/OrderFormContext'
import { FixFormProvider } from './context/FixFormContext'
import { BottomNav } from './components/BottomNav'
import { LoginPage } from './pages/LoginPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { FixOrderPage } from './pages/FixOrderPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { SettingsPage } from './pages/SettingsPage'

function AppRoutes() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <>
      <div className="max-w-lg mx-auto min-h-screen pb-[68px]">
        <Routes>
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/new" element={
            <OrderFormProvider>
              <NewOrderPage />
            </OrderFormProvider>
          } />
          <Route path="/orders/fix" element={
            <FixFormProvider>
              <FixOrderPage />
            </FixFormProvider>
          } />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
