import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import '../../styles/rooms.css'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadCustomers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('hotel_bookings')
      .select(`
        id,
        guest_name,
        phone,
        check_in,
        check_out,
        booking_status,
        total_amount
      `)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      setCustomers([])
    } else {
      // Group bookings by guest phone number
      const grouped = {}

      data.forEach((booking) => {
        const key = booking.phone

        if (!grouped[key]) {
          grouped[key] = {
            guest_name: booking.guest_name,
            phone: booking.phone,
            bookings: [],
            total_spent: 0
          }
        }

        grouped[key].bookings.push(booking)
        grouped[key].total_spent += Number(booking.total_amount || 0)
      })

      setCustomers(Object.values(grouped))
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  if (loading) {
    return <div className="rooms-page">Loading customers...</div>
  }

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div>
          <h1>Hotel Customers</h1>
          <p>Guest records and booking history</p>
        </div>
      </div>

      {message && <p className="rooms-error">{message}</p>}

      <div className="rooms-table-container">
        {customers.length === 0 ? (
          <p style={{ padding: '20px' }}>No customer records found.</p>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Phone</th>
                <th>Total Bookings</th>
                <th>Booking History</th>
                <th>Total Booking Amount</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.phone}>
                  <td><strong>{customer.guest_name}</strong></td>
                  <td>{customer.phone}</td>
                  <td>{customer.bookings.length}</td>
                  <td>
                    {customer.bookings.map((booking) => (
                      <div key={booking.id}>
                        {booking.check_in} → {booking.check_out}
                        {' '}({booking.booking_status})
                      </div>
                    ))}
                  </td>
                  <td>₹{customer.total_spent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Customers