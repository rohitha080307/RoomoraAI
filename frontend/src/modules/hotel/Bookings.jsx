import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'

function Bookings() {
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [roomId, setRoomId] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1')
  const [totalAmount, setTotalAmount] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')

    const [roomsResult, bookingsResult] = await Promise.all([
      supabase
        .from('hotel_rooms')
        .select('*')
        .eq('status', 'Available')
        .order('room_number'),
      supabase
        .from('hotel_bookings')
        .select('*, hotel_rooms(room_number, room_type)')
        .order('created_at', { ascending: false }),
    ])

    if (roomsResult.error) {
      setError(roomsResult.error.message)
    } else {
      setRooms(roomsResult.data || [])
    }

    if (bookingsResult.error) {
      setError(bookingsResult.error.message)
    } else {
      setBookings(bookingsResult.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateBooking = async (event) => {
    event.preventDefault()
    setError('')

    if (!roomId || !checkIn || !checkOut || !totalAmount) {
      setError('Please fill in all booking details.')
      return
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date.')
      return
    }

    setSaving(true)

    const booking = {
      guest_name: guestName.trim(),
      phone: phone.trim(),
      room_id: Number(roomId),
      check_in: checkIn,
      check_out: checkOut,
      guests: Number(guests),
      booking_status: 'Booked',
      total_amount: Number(totalAmount),
    }

    const { data, error } = await supabase
  .from('hotel_bookings')
  .insert([booking])
  .select('*, hotel_rooms(room_number, room_type)')
  .single()

if (error) {
  if (error.code === '23P01') {
    setError(
      'This room is already booked for some or all of those dates. Please choose another room or date range.'
    )
  } else {
    setError(error.message)
  }
} else {
  setBookings((previous) => [data, ...previous])
  setGuestName('')
  setPhone('')
  setRoomId('')
  setCheckIn('')
  setCheckOut('')
  setGuests('1')
  setTotalAmount('')
}

setSaving(false)
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    setError('')

    const { data, error } = await supabase
      .from('hotel_bookings')
      .update({ booking_status: newStatus })
      .eq('id', bookingId)
      .select('*, hotel_rooms(room_number, room_type)')
      .single()

    if (error) {
      setError(error.message)
    } else {
      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId ? data : booking
        )
      )
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking?')) return

    const { error } = await supabase
      .from('hotel_bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      setError(error.message)
    } else {
      setBookings((previous) =>
        previous.filter((booking) => booking.id !== bookingId)
      )
    }
  }

  return (
    <div className="rooms-page">
      <header className="rooms-header">
        <div>
          <p className="rooms-eyebrow">HOTEL MANAGEMENT</p>
          <h1>Bookings</h1>
          <p className="rooms-subtitle">
            Create and manage guest reservations.
          </p>
        </div>

        <button className="back-button" onClick={() => navigate('/hotel')}>
          ← Back to Dashboard
        </button>
      </header>

      {error && <div className="rooms-error">{error}</div>}

      <section className="room-form-section">
        <div className="section-heading">
          <h2>Create Booking</h2>
          <p>Enter the guest and reservation details.</p>
        </div>

        <form className="room-form" onSubmit={handleCreateBooking}>
          <div className="form-field">
            <label htmlFor="guestName">Guest Name</label>
            <input
              id="guestName"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="bookingRoom">Available Room</label>
            <select
              id="bookingRoom"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              required
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.room_number} — {room.room_type} (₹
                  {Number(room.price_per_night).toLocaleString('en-IN')}/night)
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="checkIn">Check-in Date</label>
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="checkOut">Check-out Date</label>
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="guests">Number of Guests</label>
            <input
              id="guests"
              type="number"
              min="1"
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="totalAmount">Total Amount (₹)</label>
            <input
              id="totalAmount"
              type="number"
              min="0"
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
              placeholder="Enter total amount"
              required
            />
          </div>

          <button className="add-room-button" type="submit" disabled={saving}>
            {saving ? 'Saving...' : '+ Create Booking'}
          </button>
        </form>

        {rooms.length === 0 && !loading && (
          <p className="rooms-subtitle">
            No available rooms. Add a room or mark an existing room as Available.
          </p>
        )}
      </section>

      <section className="room-list-section">
        <div className="section-heading">
          <h2>Booking List</h2>
          <p>All saved reservations.</p>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Create a booking using the form above.</p>
          </div>
        ) : (
          <div className="room-table-wrapper">
            <table className="room-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Phone</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.guest_name}</td>
                    <td>{booking.phone}</td>
                    <td>
                      {booking.hotel_rooms
                        ? `Room ${booking.hotel_rooms.room_number}`
                        : 'Room'}
                    </td>
                    <td>{booking.check_in}</td>
                    <td>{booking.check_out}</td>
                    <td>{booking.guests}</td>
                    <td>
                      ₹{Number(booking.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="room-status status-available">
                        {booking.booking_status}
                      </span>
                    </td>
                    <td>
                      <div className="room-actions">
                        <select
                          value={booking.booking_status}
                          onChange={(event) =>
                            handleStatusChange(booking.id, event.target.value)
                          }
                        >
                          <option value="Booked">Booked</option>
                          <option value="Checked In">Checked In</option>
                          <option value="Checked Out">Checked Out</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          className="delete-room-button"
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Bookings