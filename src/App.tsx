// AI-assisted: see AI-ATTRIBUTION.md
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { DEFAULT_PATH } from './components/authRedirect'
import { RequireAuth } from './components/RequireAuth'
import { SessionProvider } from './data/auth'
import { AdminPage } from './pages/Admin/AdminPage'
import { CharactersPage } from './pages/Characters/CharactersPage'
import { CompendiumPage } from './pages/Compendium/CompendiumPage'
import { ForgotPasswordPage } from './pages/ForgotPassword/ForgotPasswordPage'
import { LoginPage } from './pages/Login/LoginPage'
import { NotFoundPage } from './pages/NotFound/NotFoundPage'
import { NpcsPage } from './pages/Npcs/NpcsPage'
import { PlayerProfilePage } from './pages/PlayerProfile/PlayerProfilePage'
import { PlayersPage } from './pages/Players/PlayersPage'
import { RecordsPage } from './pages/Records/RecordsPage'
import { RegisterPage } from './pages/Register/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPassword/ResetPasswordPage'

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to={DEFAULT_PATH} replace />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:username" element={<PlayerProfilePage />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/npcs" element={<NpcsPage />} />
              <Route path="/compendium" element={<CompendiumPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
