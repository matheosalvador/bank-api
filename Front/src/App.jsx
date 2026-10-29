import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { Routes, Route, Outlet, NavLink, Link } from 'react-router'
import { useAuth } from "./context/AuthContext"
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

function Header() {
  const { token, logout } = useAuth();
  return token
    ? <button onClick={logout}>Déconnexion</button>
    : <Link to="/login">Connexion</Link>;
}

function Layout() {
  return (
    <>
      <header>
        <nav> 
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
          <NavLink to="/register">Register</NavLink>
          <Header />
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
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/history" element={<History />} />
          <Route path="/accounts/:id" element={<Details />} />
          <Route path="/accounts/new" element={<NewAccount />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id/close" element={<CloseAccount />} />
        </Route>
      </Routes>
    </>
  )
}

export { Header };
export default App;
