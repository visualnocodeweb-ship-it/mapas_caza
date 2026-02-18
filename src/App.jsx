import { useState } from 'react';
import SubmissionForm from './components/SubmissionForm';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="app">
      <div className="container">
        <div className="tab-buttons">
          <button
            className={!showAdmin ? 'active' : ''}
            onClick={() => setShowAdmin(false)}
          >
            📝 Nuevo Registro
          </button>
          <button
            className={showAdmin ? 'active' : ''}
            onClick={() => setShowAdmin(true)}
          >
            📊 Administración
          </button>
        </div>

        {showAdmin ? <AdminPanel /> : <SubmissionForm />}
      </div>

      <footer className="footer">
        <p>Sistema de Registro de Campos de Caza 2026 - Fauna</p>
      </footer>
    </div>
  );
}

export default App;
