import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <section>
      <p className="eyebrow">Bonjour</p>
      <h1>{user ? `${user.prenom} ${user.nom}` : 'Bienvenue'}</h1>
      <p>Choisis une section pour commencer :</p>

      <div className="dashboard-links">
        <Link className="dashboard-card" to="/promos">
          <h2>Promotions</h2>
          <p>Créer et gérer les promotions de stagiaires.</p>
        </Link>
        <Link className="dashboard-card" to="/stagiaires">
          <h2>Stagiaires</h2>
          <p>Gérer la liste des stagiaires par promo.</p>
        </Link>
      </div>
    </section>
  );
}

export default Dashboard;
