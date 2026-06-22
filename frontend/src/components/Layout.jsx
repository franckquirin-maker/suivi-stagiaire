import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Suivi stagiaires</span>

        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Accueil
          </NavLink>
          <NavLink to="/promos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Promos
          </NavLink>
          <NavLink to="/stagiaires" className={({ isActive }) => (isActive ? 'active' : '')}>
            Stagiaires
          </NavLink>
          <NavLink to="/types-ev" className={({ isActive }) => (isActive ? 'active' : '')}>
            Types d'événements
          </NavLink>
        </nav>

        <div className="app-user">
          <span>{user?.prenom} {user?.nom}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
