import { useState } from 'react'
import './App.css'
import { Routes, Route, Outlet, NavLink, Link } from 'react-router'
import { useAuth } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import HomePage from "./pages/HomePage.jsx"
import Accounts from "./pages/Accounts.jsx"
import Register from "./pages/Register.jsx"
import CloseAccount from "./pages/CloseAccount.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Deposit from "./pages/Deposit.jsx"
import Details from "./pages/Details.jsx"
import History from "./pages/History.jsx"
import Login from "./pages/Login.jsx"
import NewAccount from "./pages/NewAccount.jsx"
import Transfer from "./pages/Transfer.jsx"

// Import CSS for pages
import './pages/Auth.css'
import './pages/Dashboard.css'
import './pages/Accounts.css'
import './pages/Forms.css'
import './pages/Details.css'
import './pages/History.css'
import './pages/HomePage.css'

function Header() {
  const { token, logout, user } = useAuth();
  return (
    <header className="site-header">
      <nav className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">Banque en Ligne</Link>
        </div>
        <div className="nav-links">
          <NavLink to="/" className="nav-link">Accueil</NavLink>
          {token && (
            <>
              <NavLink to="/dashboard" className="nav-link">Tableau de bord</NavLink>
              <NavLink to="/accounts" className="nav-link">Comptes</NavLink>
              <NavLink to="/transfer" className="nav-link">Virements</NavLink>
              <NavLink to="/history" className="nav-link">Historique</NavLink>
            </>
          )}
          <NavLink to="/register" className="nav-link">S'inscrire</NavLink>
        </div>
        <div className="nav-auth">
          {token ? (
            <>
              <span className="user-email">{user?.email}</span>
              <button onClick={logout} className="btn-logout">Déconnexion</button>
            </>
          ) : (
            <Link to="/login" className="btn-login">Connexion</Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function Layout() {
  return (
    <>
      <header>
        <nav>
          <Header />
          <main className="main-content">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées (nécessitent un token) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/history" element={<History />} />
            <Route path="/accounts/:id" element={<Details />} />
            <Route path="/accounts/new" element={<NewAccount />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:id/close" element={<CloseAccount />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export { Header };
export default App;
