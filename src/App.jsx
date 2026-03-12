// =================================================
// File: App.jsx
// Componente principale dell'applicazione
// @author: Full Stack Senior Developer
// @version: 1.0.0 2026-01-14
// =================================================

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from '../components/Login/Login';
import Registration from '../components/Registration/Registration';
import Consegne from '../components/Consegne/Consegne';
import Clienti from '../components/Clienti/Clienti';
import Utenti from '../components/Utenti/Utenti';
import Tracking from '../components/Tracking/Tracking';
import './App.css';

/**
 * Componente per la dashboard (schermata dopo il login)
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'consegne', 'clienti', 'utenti'

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Sistema Gestione Consegne</h1>
        </div>
        <div className="header-right">
          <span className="user-name">👤 {user?.email}</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {/* Menu di navigazione */}
      <nav className="dashboard-nav">
        <button
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          🏠 Home
        </button>
        <button
          className={`nav-item ${currentPage === 'consegne' ? 'active' : ''}`}
          onClick={() => setCurrentPage('consegne')}
        >
          🚚 Consegne
        </button>
        {(user?.ruolo === 'Operatore' || user?.ruolo === 'Amministratore') && (
          <button
            className={`nav-item ${currentPage === 'clienti' ? 'active' : ''}`}
            onClick={() => setCurrentPage('clienti')}
          >
            👥 Clienti
          </button>
        )}
        {user?.ruolo === 'Amministratore' && (
          <button
            className={`nav-item ${currentPage === 'utenti' ? 'active' : ''}`}
            onClick={() => setCurrentPage('utenti')}
          >
            🧑‍💼 Utenti
          </button>
        )}
      </nav>

      {/* Contenuto della pagina */}
      <div className="dashboard-content">
        {currentPage === 'home' && (
          <div className="user-info-card">
            <h2>Informazioni Utente</h2>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ruolo:</span>
              <span className={`badge badge-${user?.ruolo?.toLowerCase()}`}>
                {user?.ruolo}
              </span>
            </div>

            {/* Quick actions */}
            <div className="quick-actions">
              <h3>Azioni Rapide</h3>
              <button
                className="btn-action"
                onClick={() => setCurrentPage('consegne')}
              >
                🚚 Vai a Gestione Consegne →
              </button>
              {(user?.ruolo === 'Operatore' || user?.ruolo === 'Amministratore') && (
                <button
                  className="btn-action"
                  onClick={() => setCurrentPage('clienti')}
                >
                  👥 Vai a Gestione Clienti →
                </button>
              )}
              {user?.ruolo === 'Amministratore' && (
                <button
                  className="btn-action"
                  onClick={() => setCurrentPage('utenti')}
                >
                  🧑‍💼 Vai a Gestione Utenti →
                </button>
              )}
            </div>
          </div>
        )}
        {currentPage === 'consegne' && <Consegne />}
        {currentPage === 'clienti' && <Clienti />}
        {currentPage === 'utenti' && <Utenti />}
      </div>
    </div>
  );
};

/**
 * Componente principale con routing
 */
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('tracking'); // 'login' | 'register' | 'tracking'

  // Mostra uno spinner durante il caricamento iniziale
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  // Se l'utente è autenticato, mostra la dashboard
  if (isAuthenticated()) {
    return <Dashboard />;
  }

  // Altrimenti mostra login o registrazione
  return (
    <>
      {currentView === 'login' && (
        <Login
          onSwitchToRegister={() => setCurrentView('register')}
          onLoginSuccess={(user) => {
            console.log('Login completato per:', user);
          }}
          onGoToTracking={() => setCurrentView('tracking')}
        />
      )}
      {currentView === 'register' && (
        <Registration
          onSwitchToLogin={() => setCurrentView('login')}
          onRegistrationSuccess={(user) => {
            console.log('Registrazione completata per:', user);
          }}
          onGoToTracking={() => setCurrentView('tracking')}
        />
      )}
      {currentView === 'tracking' && <Tracking />}

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {currentView !== 'tracking' ? (
          <button
            type="button"
            className="link-button"
            onClick={() => setCurrentView('tracking')}
          >
            🔍 Vai al Tracking Consegne
          </button>
        ) : (
          <button
            type="button"
            className="link-button"
            onClick={() => setCurrentView('login')}
          >
            🔐 Torna al Login
          </button>
        )}
      </div>
    </>
  );
};

/**
 * Componente App principale con Provider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
