
import { useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'

function HotelDashboard() {
  const navigate = useNavigate()

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Roomora AI</h2>
        <p className="side-label">HOTEL MANAGEMENT</p>

        <nav>
          <button className="active">Dashboard</button>
          <button onClick={() => navigate('/hotel/rooms')}>
            Rooms
          </button>
          <button>Bookings</button>
          <button>Check-in / Check-out</button>
          <button>Payments</button>
          <button>Customers</button>
        </nav>

        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>Hotel Dashboard</h1>
            <p>Welcome back! Here's your hotel overview.</p>
          </div>

          <button className="primary-btn">+ New Booking</button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Rooms</span>
            <h2>0</h2>
          </div>

          <div className="stat-card">
            <span>Available Rooms</span>
            <h2>0</h2>
          </div>

          <div className="stat-card">
            <span>Occupied Rooms</span>
            <h2>0</h2>
          </div>

          <div className="stat-card">
            <span>Today's Bookings</span>
            <h2>0</h2>
          </div>
        </section>

        <section className="content-grid">
          <div className="content-card">
            <h3>Room Availability</h3>
            <p className="empty-state">
              No rooms added yet.
            </p>
            <button className="secondary-btn">Manage Rooms</button>
          </div>

          <div className="content-card">
            <h3>Today's Activity</h3>
            <p className="empty-state">
              No check-ins or check-outs scheduled.
            </p>
          </div>
        </section>

        <section className="content-card recent-bookings">
          <h3>Recent Bookings</h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="5" className="empty-state">
                    No bookings available.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HotelDashboard
