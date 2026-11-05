import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import '../../styles/rooms.css'

function CheckInOut() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadBookings() {
    setLoading(true)

    const { data, error } = await supabase
      .from('hotel_bookings')
      .select(`
        id,
        room_id,
        guest_name,
        phone,
        check_in,
        check_out,
        booking_status,
        actual_check_in,
        actual_check_out,
        hotel_rooms (
          room_number,
          room_type
        )
      `)
      .in('booking_status', ['Booked', 'Checked In'])
      .order('check_in', { ascending: true })

    if (error) {
      setMessage(error.message)
    } else {
      setBookings(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadBookings()
  }, [])

  async function checkIn(booking) {
    setMessage('')

    const { error: bookingError } = await supabase
      .from('hotel_bookings')
      .update({
        booking_status: 'Checked In',
        actual_check_in: new Date().toISOString()
      })
      .eq('id', booking.id)

    if (bookingError) {
      setMessage(bookingError.message)
      return
    }

    const { error: roomError } = await supabase
      .from('hotel_rooms')
      .update({ status: 'Occupied' })
      .eq('id', booking.room_id)

    if (roomError) {
      setMessage(
        `Booking checked in, but room status could not be updated: ${roomError.message}`
      )
      await loadBookings()
      return
    }

    setMessage(`${booking.guest_name} checked in successfully.`)
    await loadBookings()
  }

  async function checkOut(booking) {
    setMessage('')

    const { error: bookingError } = await supabase
      .from('hotel_bookings')
      .update({
        booking_status: 'Checked Out',
        actual_check_out: new Date().toISOString()
      })
      .eq('id', booking.id)

    if (bookingError) {
      setMessage(bookingError.message)
      return
    }

    const { error: roomError } = await supabase
      .from('hotel_rooms')
      .update({ status: 'Available' })
      .eq('id', booking.room_id)

    if (roomError) {
      setMessage(
        `Guest checked out, but room status could not be updated: ${roomError.message}`
      )
      await loadBookings()
      return
    }

    setMessage(`${booking.guest_name} checked out successfully.`)
    await loadBookings()
  }

  if (loading) {
    return <div className="rooms-page">Loading bookings...</div>
  }

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div>
          <h1>Check-in / Check-out</h1>
          <p>Manage guest arrivals and departures</p>
        </div>
      </div>

      {message && <p className="rooms-error">{message}</p>}

      {bookings.length === 0 ? (
        <p>No bookings are waiting for check-in or check-out.</p>
      ) : (
        <div className="rooms-table-container">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Planned Check-in</th>
                <th>Planned Check-out</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.guest_name}</strong>
                    <br />
                    {booking.phone}
                  </td>

                  <td>
                    {booking.hotel_rooms?.room_number || 'N/A'}
                    <br />
                    {booking.hotel_rooms?.room_type || ''}
                  </td>

                  <td>{booking.check_in}</td>
                  <td>{booking.check_out}</td>
                  <td>{booking.booking_status}</td>

                  <td>
                    {booking.booking_status === 'Booked' && (
                      <button onClick={() => checkIn(booking)}>
                        Check In
                      </button>
                    )}

                    {booking.booking_status === 'Checked In' && (
                      <button onClick={() => checkOut(booking)}>
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CheckInOut