import { useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <h1>Roomora AI</h1>
      <p>Your Stay. Smarter Managed.</p>

      <div className="options">
        <div className="option-card">
          <h2>Hotel Management</h2>
          <p>Manage bookings, rooms, check-ins and payments.</p>
          <button onClick={() => navigate('/hotel')}>
            Continue as Hotel
          </button>
        </div>

        <div className="option-card">
          <h2>PG Management</h2>
          <p>Manage residents, rent, bills and room allocation.</p>
          <button onClick={() => navigate('/pg')}>
            Continue as PG
          </button>
        </div>
      </div>
    </div>
  )
}

export default App