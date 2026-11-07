
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import '../../styles/payments.css'

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

  const totalReceived = payments
    .filter(payment => payment.payment_status === 'Paid')
    .reduce((total, payment) => total + Number(payment.amount), 0)

  const pendingCount = payments.filter(
    payment => payment.payment_status === 'Pending'
  ).length

  if (loading) {
    return (
      <div className="payments-page">
        <p className="payments-loading">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="payments-page">

      <div className="payments-header">
        <div>
          <span className="payments-eyebrow">FINANCIAL MANAGEMENT</span>
          <h1>Payments</h1>
          <p>Manage transactions and keep track of guest payments.</p>
        </div>
      </div>

      {message && (
        <div className={`payments-message ${
          message === 'Payment recorded successfully.'
            ? 'success'
            : 'error'
        }`}>
          {message}
        </div>
      )}

      <div className="payment-summary">

        <div className="payment-summary-card">
          <div className="payment-summary-icon">↗</div>
          <div>
            <p>Total Transactions</p>
            <h2>{payments.length}</h2>
          </div>
        </div>

        <div className="payment-summary-card">
          <div className="payment-summary-icon">₹</div>
          <div>
            <p>Amount Received</p>
            <h2>₹{totalReceived.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</h2>
          </div>
        </div>

        <div className="payment-summary-card">
          <div className="payment-summary-icon">◷</div>
          <div>
            <p>Pending Payments</p>
            <h2>{pendingCount}</h2>
          </div>
        </div>

      </div>

      <div className="payments-content">

        <section className="payment-form-card">
          <div className="payment-section-heading">
            <div>
              <span>NEW TRANSACTION</span>
              <h2>Record Payment</h2>
              <p>Enter the guest's payment details below.</p>
            </div>
          </div>

          <form onSubmit={addPayment} className="payment-form">

            <label className="payment-field">
              <span>Booking / Guest</span>
              <select
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                required
              >
                <option value="">Select a booking</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    #{booking.id} - {booking.guest_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="payment-field">
              <span>Amount (₹)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
                required
              />
            </label>

            <label className="payment-field">
              <span>Payment Method</span>
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

            <label className="payment-field">
              <span>Payment Status</span>
              <select
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </label>

            <label className="payment-field">
              <span>Notes <small>(Optional)</small></span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add any payment details..."
                rows="3"
              />
            </label>

            <button type="submit" className="payment-submit-btn">
              Record Payment
            </button>

          </form>
        </section>

        <section className="payment-history-card">
          <div className="payment-section-heading history-heading">
            <div>
              <span>TRANSACTION HISTORY</span>
              <h2>Payment Records</h2>
              <p>View all recorded guest transactions.</p>
            </div>
            <span className="payment-record-count">
              {payments.length} Records
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="payment-empty">
              <div className="payment-empty-icon">₹</div>
              <h3>No payments yet</h3>
              <p>Recorded transactions will appear here.</p>
            </div>
          ) : (
            <div className="payment-table-wrapper">
              <table className="payment-table">
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
                      <td className="payment-guest">
                        {payment.hotel_bookings?.guest_name || 'Unknown guest'}
                      </td>

                      <td className="payment-amount">
                        ₹{Number(payment.amount).toFixed(2)}
                      </td>

                      <td>{payment.payment_method}</td>

                      <td>
                        <span className={`payment-status ${
                          payment.payment_status.toLowerCase()
                        }`}>
                          {payment.payment_status}
                        </span>
                      </td>

                      <td>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>

                      <td>{payment.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

export default Payments
