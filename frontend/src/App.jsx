import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Promos from './pages/Promos';
import Stagiaires from './pages/Stagiaires';
import StagiaireDetail from './pages/StagiaireDetail';
import TypesEv from './pages/TypesEv';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/promos" element={<Promos />} />
            <Route path="/stagiaires" element={<Stagiaires />} />
            <Route path="/stagiaires/:id" element={<StagiaireDetail />} />
            <Route path="/types-ev" element={<TypesEv />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
