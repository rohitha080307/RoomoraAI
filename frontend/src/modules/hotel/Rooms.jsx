
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import '../../styles/rooms.css'

function Rooms() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [roomNumber, setRoomNumber] = useState('')
  const [floor, setFloor] = useState('1')
  const [type, setType] = useState('Double')
  const [capacity, setCapacity] = useState('2')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('Available')

  const loadRooms = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('*')
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setRooms(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadRooms()
  }, [])

  const availableRooms = rooms.filter(
    (room) => room.status === 'Available'
  ).length

  const occupiedRooms = rooms.filter(
    (room) => room.status === 'Occupied'
  ).length

  const maintenanceRooms = rooms.filter(
    (room) => room.status === 'Maintenance'
  ).length

  // Add new room
  const handleAddRoom = async (event) => {
    event.preventDefault()
    setError('')

    if (
      !roomNumber.trim() ||
      !price ||
      Number(price) <= 0 ||
      !capacity ||
      Number(capacity) < 1
    ) {
      setError(
        'Please enter a room number, valid price and maximum guest capacity.'
      )
      return
    }

    setSaving(true)

    const newRoom = {
      room_number: roomNumber.trim(),
      floor: Number(floor),
      room_type: type,
      capacity: Number(capacity),
      price_per_night: Number(price),
      status,
    }

    const { data, error } = await supabase
      .from('hotel_rooms')
      .insert([newRoom])
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setRooms((previousRooms) => [...previousRooms, data])

      setRoomNumber('')
      setFloor('1')
      setType('Double')
      setCapacity('2')
      setPrice('')
      setStatus('Available')
    }

    setSaving(false)
  }

  // Update room status
  const handleStatusChange = async (roomId, newStatus) => {
    setError('')

    const { data, error } = await supabase
      .from('hotel_rooms')
      .update({ status: newStatus })
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setRooms((previousRooms) =>
        previousRooms.map((room) =>
          room.id === roomId ? data : room
        )
      )
    }
  }

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this room?'
    )

    if (!confirmDelete) return

    setError('')

    const { error } = await supabase
      .from('hotel_rooms')
      .delete()
      .eq('id', roomId)

    if (error) {
      setError(error.message)
    } else {
      setRooms((previousRooms) =>
        previousRooms.filter((room) => room.id !== roomId)
      )
    }
  }

  return (
    <div className="rooms-page">
      <header className="rooms-header">
        <div>
          <p className="rooms-eyebrow">HOTEL MANAGEMENT</p>
          <h1>Rooms Management</h1>
          <p className="rooms-subtitle">
            Add rooms, manage room details, and update availability.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate('/hotel')}
        >
          ← Back to Dashboard
        </button>
      </header>

      {error && <div className="rooms-error">{error}</div>}

      {/* Room Summary */}
      <section className="room-summary">
        <div className="summary-card">
          <span>Total Rooms</span>
          <strong>{rooms.length}</strong>
        </div>

        <div className="summary-card available-card">
          <span>Available</span>
          <strong>{availableRooms}</strong>
        </div>

        <div className="summary-card occupied-card">
          <span>Occupied</span>
          <strong>{occupiedRooms}</strong>
        </div>

        <div className="summary-card maintenance-card">
          <span>Maintenance</span>
          <strong>{maintenanceRooms}</strong>
        </div>
      </section>

      {/* Add Room Form */}
      <section className="room-form-section">
        <div className="section-heading">
          <h2>Add New Room</h2>
          <p>Enter the room details below.</p>
        </div>

        <form className="room-form" onSubmit={handleAddRoom}>
          <div className="form-field">
            <label htmlFor="roomNumber">Room Number</label>
            <input
              id="roomNumber"
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              placeholder="e.g. 103"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="floor">Floor</label>
            <input
              id="floor"
              type="number"
              min="0"
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="roomType">Room Type</label>
            <select
              id="roomType"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Family">Family</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="capacity">
              Maximum Guests Allowed
            </label>
            <input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              required
            />
            <small>
              Set the maximum number of guests permitted in this room.
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="price">Price per Night (₹)</label>
            <input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="e.g. 1500"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="roomStatus">Initial Status</label>
            <select
              id="roomStatus"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <button
            className="add-room-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : '+ Add Room'}
          </button>
        </form>
      </section>

      {/* Room List */}
      <section className="room-list-section">
        <div className="section-heading">
          <h2>Room List</h2>
          <p>Room details saved in your database.</p>
        </div>

        {loading ? (
          <p>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <h3>No rooms added yet</h3>
            <p>Add your first room using the form above.</p>
          </div>
        ) : (
          <div className="room-table-wrapper">
            <table className="room-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Floor</th>
                  <th>Type</th>
                  <th>Maximum Guests</th>
                  <th>Price / Night</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="room-number-cell">
                      {room.room_number}
                    </td>
                    <td>{room.floor}</td>
                    <td>{room.room_type}</td>
                    <td>{room.capacity} guests</td>
                    <td>
                      ₹
                      {Number(room.price_per_night).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className={`room-status status-${room.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <div className="room-actions">
                        <select
                          value={room.status}
                          aria-label={`Status for room ${room.room_number}`}
                          onChange={(event) =>
                            handleStatusChange(
                              room.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>

                        <button
                          className="delete-room-button"
                          onClick={() => handleDeleteRoom(room.id)}
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

export default Rooms
