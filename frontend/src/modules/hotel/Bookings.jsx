
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import '../../styles/bookings.css'

function Bookings() {
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [bookedRoomIds, setBookedRoomIds] = useState([])

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

  const selectedRoom = rooms.find(
    (room) => String(room.id) === roomId
  )

  // Load rooms and bookings
  const loadData = async () => {
    setLoading(true)
    setError('')

    const { data: roomData, error: roomError } = await supabase
      .from('hotel_rooms')
      .select('*')
      .eq('status', 'Available')
      .order('room_number')

    if (roomError) {
      setError(roomError.message)
      setLoading(false)
      return
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from('hotel_bookings')
      .select(`
        *,
        hotel_rooms (
          room_number,
          room_type
        )
      `)
      .order('created_at', { ascending: false })

    if (bookingError) {
      setError(bookingError.message)
      setLoading(false)
      return
    }

    setRooms(roomData || [])
    setBookings(bookingData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Check room availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkIn || !checkOut || checkOut <= checkIn) {
        setBookedRoomIds([])
        return
      }

      const { data, error: availabilityError } = await supabase
        .from('hotel_bookings')
        .select('room_id')
        .neq('booking_status', 'Cancelled')
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)

      if (availabilityError) {
        setError(availabilityError.message)
        return
      }

      setBookedRoomIds(
        (data || []).map((booking) => booking.room_id)
      )
    }

    checkAvailability()
  }, [checkIn, checkOut])

  // Calculate total amount
  useEffect(() => {
    if (!selectedRoom || !checkIn || !checkOut || checkOut <= checkIn) {
      setTotalAmount('')
      return
    }

    const numberOfNights = Math.round(
      (new Date(checkOut) - new Date(checkIn)) /
        (1000 * 60 * 60 * 24)
    )

    const total =
      Number(selectedRoom.price_per_night) * numberOfNights

    setTotalAmount(String(total))
  }, [roomId, checkIn, checkOut, rooms])

  // Create booking
  const handleCreateBooking = async (event) => {
    event.preventDefault()
    setError('')

    if (
      !guestName.trim() ||
      !phone.trim() ||
      !roomId ||
      !checkIn ||
      !checkOut ||
      !guests
    ) {
      setError('Please fill in all required fields.')
      return
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date.')
      return
    }

    if (Number(guests) < 1) {
      setError('Number of guests must be at least 1.')
      return
    }

    if (!selectedRoom) {
      setError('Please select a valid room.')
      return
    }

    if (Number(guests) > Number(selectedRoom.capacity)) {
      setError(
        `This room allows a maximum of ${selectedRoom.capacity} guests.`
      )
      return
    }

    if (bookedRoomIds.includes(Number(roomId))) {
      setError(
        'This room is already booked for the selected dates. Please choose another room.'
      )
      return
    }

    setSaving(true)

    const { error: insertError } = await supabase
      .from('hotel_bookings')
      .insert([
        {
          guest_name: guestName.trim(),
          phone: phone.trim(),
          room_id: Number(roomId),
          check_in: checkIn,
          check_out: checkOut,
          guests: Number(guests),
          total_amount: Number(totalAmount),
          booking_status: 'Booked',
        },
      ])

    if (insertError) {
      if (insertError.code === '23P01') {
        setError(
          'This room is already booked for the selected dates. Please choose another room.'
        )
      } else {
        setError(insertError.message)
      }

      setSaving(false)
      return
    }

    setGuestName('')
    setPhone('')
    setRoomId('')
    setCheckIn('')
    setCheckOut('')
    setGuests('1')
    setTotalAmount('')

    await loadData()
    setSaving(false)
  }

  // Update booking status
  const handleStatusChange = async (id, status) => {
    const { error: updateError } = await supabase
      .from('hotel_bookings')
      .update({ booking_status: status })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await loadData()
  }

  // Delete booking
  const handleDeleteBooking = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this booking?'
    )

    if (!confirmed) return

    const { error: deleteError } = await supabase
      .from('hotel_bookings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await loadData()
  }

  if (loading) {
    return (
      <div className="bookings-page">
        <p>Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="bookings-page">

      {/* Header */}
      <div className="bookings-header">
        <div>
          <h1>Manage Bookings</h1>
          <p>Manage guest reservations and room bookings.</p>
        </div>

        <button
          className="booking-back-button"
          onClick={() => navigate('/hotel')}
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="booking-error">
          {error}
        </div>
      )}

      {/* Create Booking Form */}
      <div className="booking-form-section">
        <h2>Create New Booking</h2>

        <form
          className="booking-form"
          onSubmit={handleCreateBooking}
        >

          <div className="form-field">
            <label htmlFor="guestName">Guest Name</label>
            <input
              id="guestName"
              type="text"
              placeholder="Enter guest name"
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
              placeholder="Enter phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="roomId">Select Room</label>
            <select
              id="roomId"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              required
            >
              <option value="">Select a room</option>

              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.room_number} - {room.room_type} -
                  ₹{room.price_per_night}/night -
                  Max {room.capacity} guests
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
              min={checkIn || undefined}
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
              max={selectedRoom?.capacity || undefined}
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              required
            />

            {selectedRoom && (
              <small>
                Maximum guests allowed: {selectedRoom.capacity}
              </small>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="totalAmount">Total Amount (₹)</label>
            <input
              id="totalAmount"
              type="number"
              value={totalAmount}
              readOnly
            />
          </div>

          {selectedRoom && (
            <div className="booking-summary">
              <p>
                <strong>Selected Room:</strong> {selectedRoom.room_number}
              </p>
              <p>
                <strong>Maximum Capacity:</strong> {selectedRoom.capacity} guests
              </p>
              <p>
                <strong>Price per Night:</strong> ₹{selectedRoom.price_per_night}
              </p>
            </div>
          )}

          <button
            className="create-booking-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Creating Booking...' : 'Create Booking'}
          </button>

        </form>
      </div>

      {/* Booking List */}
      <div className="booking-list-section">
        <h2>All Bookings</h2>

        {bookings.length === 0 ? (
          <div className="booking-empty">
            No bookings found.
          </div>
        ) : (
          <div className="booking-table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Guest Name</th>
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
                      {booking.hotel_rooms?.room_number || 'N/A'}
                    </td>

                    <td>{booking.check_in}</td>
                    <td>{booking.check_out}</td>
                    <td>{booking.guests}</td>
                    <td>₹{booking.total_amount}</td>

                    <td>
                      <span
                        className={`booking-status ${
                          booking.booking_status
                            .toLowerCase()
                            .replace(' ', '-')
                        }`}
                      >
                        {booking.booking_status}
                      </span>
                    </td>

                    <td>
                      <div className="booking-actions">
                        <select
                          value={booking.booking_status}
                          onChange={(event) =>
                            handleStatusChange(
                              booking.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Booked">Booked</option>
                          <option value="Checked In">Checked In</option>
                          <option value="Checked Out">Checked Out</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          className="delete-booking-button"
                          type="button"
                          onClick={() =>
                            handleDeleteBooking(booking.id)
                          }
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
      </div>

    </div>
  )
}

export default Bookings
