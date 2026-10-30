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
import './App.css'

function Header() {
  const { token, logout } = useAuth();
  return token
    ? <button onClick={logout} className="btn btn-logout">Déconnexion</button>
    : <Link to="/login" className="btn btn-login">Connexion</Link>;
}

function Layout() {
  return (
    <>
      <header className="site-header">
        <nav className="nav-container">
          <div className="nav-auth">
            <Header />
          </div>
          <div className="nav-links">
            <NavLink to="/" className="nav-link">Accueil</NavLink>
            <NavLink to="/dashboard" className="nav-link">Tableau de bord</NavLink>
            <NavLink to="/accounts" className="nav-link">Comptes</NavLink>
            <NavLink to="/register" className="nav-link">S'inscrire</NavLink>
          </div>
        </nav>
      </header>
      <main className="main-content">
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
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/new" element={<NewAccount />} />
            <Route path="/accounts/:id" element={<Details />} />
            <Route path="/accounts/:id/deposits" element={<Deposit />} />
            <Route path="/accounts/:id/close" element={<CloseAccount />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export { Header };
export default App;
