import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import '../styles/dashboard.css'

function HotelDashboard() {
  const navigate = useNavigate()

  const [totalRooms, setTotalRooms] = useState(0)
  const [availableRooms, setAvailableRooms] = useState(0)
  const [occupiedRooms, setOccupiedRooms] = useState(0)
  const [todayBookings, setTodayBookings] = useState(0)
  const [roomList, setRoomList] = useState([])
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    const { data: rooms, error: roomsError } = await supabase
      .from('hotel_rooms')
      .select('id, room_number, room_type, status')
      .order('floor', { ascending: true })

    if (!roomsError && rooms) {
      setTotalRooms(rooms.length)
      setAvailableRooms(
        rooms.filter((room) => room.status === 'Available').length
      )
      setOccupiedRooms(
        rooms.filter((room) => room.status === 'Occupied').length
      )
      setRoomList(rooms)
    }

    const today = new Date().toLocaleDateString('en-CA')

    const { data: bookings, error: bookingsError } = await supabase
      .from('hotel_bookings')
      .select(`
        id,
        guest_name,
        check_in,
        check_out,
        booking_status,
        hotel_rooms (
          room_number
        )
      `)
      .eq('check_in', today)
      .order('created_at', { ascending: false })

    if (!bookingsError && bookings) {
      setTodayBookings(bookings.length)
    }

    const { data: recent, error: recentError } = await supabase
      .from('hotel_bookings')
      .select(`
        id,
        guest_name,
        check_in,
        check_out,
        booking_status,
        hotel_rooms (
          room_number
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!recentError && recent) {
      setRecentBookings(recent)
    }
  }

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

          <button onClick={() => navigate('/hotel/bookings')}>
            Bookings
          </button>

          <button onClick={() => navigate('/hotel/check-in-out')}>
            Check-in / Check-out
          </button>

          <button onClick={() => navigate('/hotel/payments')}>
            Payments
          </button>

          <button onClick={() => navigate('/hotel/customers')}>
            Customers
          </button>
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

          <button
            className="primary-btn"
            onClick={() => navigate('/hotel/bookings')}
          >
            + New Booking
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Rooms</span>
            <h2>{totalRooms}</h2>
          </div>

          <div className="stat-card">
            <span>Available Rooms</span>
            <h2>{availableRooms}</h2>
          </div>

          <div className="stat-card">
            <span>Occupied Rooms</span>
            <h2>{occupiedRooms}</h2>
          </div>

          <div className="stat-card">
            <span>Today's Bookings</span>
            <h2>{todayBookings}</h2>
          </div>
        </section>

        <section className="content-grid">
          <div className="content-card">
            <h3>Room Availability</h3>

            {roomList.length === 0 ? (
              <p className="empty-state">No rooms added yet.</p>
            ) : (
              <div>
                {roomList.slice(0, 5).map((room) => (
                  <div
                    key={room.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 0',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <span>
                      Room {room.room_number} — {room.room_type}
                    </span>
                    <span>{room.status}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="secondary-btn"
              onClick={() => navigate('/hotel/rooms')}
            >
              Manage Rooms
            </button>
          </div>

          <div className="content-card">
            <h3>Today's Activity</h3>

            {todayBookings === 0 ? (
              <p className="empty-state">
                No check-ins scheduled for today.
              </p>
            ) : (
              <p>
                {todayBookings} booking(s) scheduled to check in today.
              </p>
            )}

            <button
              className="secondary-btn"
              onClick={() => navigate('/hotel/check-in-out')}
            >
              Manage Check-ins
            </button>
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
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No bookings available.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.guest_name}</td>
                      <td>
                        {booking.hotel_rooms?.room_number || 'N/A'}
                      </td>
                      <td>{booking.check_in}</td>
                      <td>{booking.check_out}</td>
                      <td>{booking.booking_status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HotelDashboard