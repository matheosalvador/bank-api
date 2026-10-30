import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import App, { Header } from './App';

// ============================================
// 1. TEST : Header affiche "Connexion" (non connecté)
// ============================================
test('Header affiche "Connexion" quand l\'utilisateur n\'est pas connecté', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  // Vérifie que le lien "Connexion" est présent
  const connexionLink = screen.getByText('Connexion');
  expect(connexionLink).toBeInTheDocument();
  expect(connexionLink).toHaveAttribute('href', '/login');
});

// ============================================
// 2. TEST : Header affiche "Déconnexion" (connecté)
// ============================================
test('Header affiche "Déconnexion" quand l\'utilisateur est connecté', () => {
  // Mock de localStorage pour simuler un token existant
  const mockToken = 'fake-jwt-token';
  Storage.prototype.getItem = jest.fn(() => mockToken);

  render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  // Vérifie que le bouton "Déconnexion" est présent
  const deconnexionButton = screen.getByText('Déconnexion');
  expect(deconnexionButton).toBeInTheDocument();
});

// ============================================
// 3. TEST : Cliquer sur "Déconnexion" appelle logout
// ============================================
test('Cliquer sur "Déconnexion" appelle la fonction logout', () => {
  const mockLogout = jest.fn();
  const mockUseAuth = () => ({ token: 'fake-token', logout: mockLogout });

  // Mock du hook useAuth
  jest.mock('./context/AuthContext', () => ({
    useAuth: mockUseAuth,
  }));

  render(
    <MemoryRouter>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </MemoryRouter>
  );

  const deconnexionButton = screen.getByText('Déconnexion');
  fireEvent.click(deconnexionButton);
  expect(mockLogout).toHaveBeenCalledTimes(1);
});

// ============================================
// 4. TEST : Header est présent dans Layout
// ============================================
test('Header est rendu dans le Layout', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  // Vérifie que le Header est bien monté (via ses enfants)
  expect(screen.getByText(/Connexion|Déconnexion/)).toBeInTheDocument();
});

// ============================================
// 5. TEST : Le Layout contient bien le Header + Outlet
// ============================================
test('Layout intègre Header et Outlet', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  // Vérifie la présence du Header
  expect(screen.getByRole('navigation')).toContainElement(
    screen.getByText(/Connexion|Déconnexion/)
  );
  // Vérifie que le Outlet est présent (pour les pages enfants)
  expect(screen.getByRole('main')).toBeInTheDocument();
});
