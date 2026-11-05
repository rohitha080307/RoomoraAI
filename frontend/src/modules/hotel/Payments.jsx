import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import '../../styles/rooms.css'

function Payments() {
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [bookingId, setBookingId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)

    const { data: bookingData, error: bookingError } = await supabase
      .from('hotel_bookings')
      .select('id, guest_name, total_amount, booking_status')
      .order('id', { ascending: false })

    const { data: paymentData, error: paymentError } = await supabase
      .from('hotel_payments')
      .select(`
        id,
        booking_id,
        amount,
        payment_method,
        payment_status,
        payment_date,
        notes,
        hotel_bookings (
          guest_name
        )
      `)
      .order('payment_date', { ascending: false })

    if (bookingError) {
      setMessage(bookingError.message)
    } else {
      setBookings(bookingData || [])
    }

    if (paymentError) {
      setMessage(paymentError.message)
    } else {
      setPayments(paymentData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function addPayment(event) {
    event.preventDefault()
    setMessage('')

    if (!bookingId || !amount || Number(amount) <= 0) {
      setMessage('Please select a booking and enter a valid amount.')
      return
    }

    const { error } = await supabase
      .from('hotel_payments')
      .insert({
        booking_id: Number(bookingId),
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        notes: notes.trim() || null
      })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Payment recorded successfully.')
    setBookingId('')
    setAmount('')
    setPaymentMethod('UPI')
    setPaymentStatus('Paid')
    setNotes('')
    await loadData()
  }

  if (loading) {
    return <div className="rooms-page">Loading payments...</div>
  }

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div>
          <h1>Hotel Payments</h1>
          <p>Record and view guest payments</p>
        </div>
      </div>

      {message && <p className="rooms-error">{message}</p>}

      <div className="rooms-table-container" style={{ padding: '20px' }}>
        <h2>Record Payment</h2>

        <form onSubmit={addPayment}>
          <div className="form-grid">
            <label>
              Booking / Guest
              <select
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                required
              >
                <option value="">Select booking</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    #{booking.id} - {booking.guest_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label>
              Payment Method
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </label>

            <label>
              Payment Status
              <select
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </label>

            <label>
              Notes
              <input
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>

          <button type="submit" className="primary-btn">
            Record Payment
          </button>
        </form>
      </div>

      <div className="rooms-table-container" style={{ marginTop: '24px' }}>
        <h2 style={{ padding: '20px 20px 0' }}>Payment Records</h2>

        {payments.length === 0 ? (
          <p style={{ padding: '20px' }}>No payments recorded yet.</p>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    {payment.hotel_bookings?.guest_name || 'Unknown guest'}
                  </td>
                  <td>₹{Number(payment.amount).toFixed(2)}</td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.payment_status}</td>
                  <td>
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                  <td>{payment.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Payments