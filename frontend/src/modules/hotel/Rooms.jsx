import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/rooms.css'

function Rooms() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([
    {
      id: 1,
      roomNumber: '101',
      floor: 1,
      type: 'Double',
      capacity: 2,
      price: 1500,
      status: 'Available',
    },
    {
      id: 2,
      roomNumber: '102',
      floor: 1,
      type: 'Single',
      capacity: 1,
      price: 1000,
      status: 'Occupied',
    },
  ])

  const [roomNumber, setRoomNumber] = useState('')
  const [floor, setFloor] = useState('1')
  const [type, setType] = useState('Double')
  const [capacity, setCapacity] = useState('2')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('Available')

  const availableRooms = rooms.filter(
    (room) => room.status === 'Available'
  ).length

  const occupiedRooms = rooms.filter(
    (room) => room.status === 'Occupied'
  ).length

  const maintenanceRooms = rooms.filter(
    (room) => room.status === 'Maintenance'
  ).length

  const handleAddRoom = (event) => {
    event.preventDefault()

    if (!roomNumber.trim() || !price || Number(price) <= 0) {
      alert('Please enter a room number and a valid price.')
      return
    }

    const roomExists = rooms.some(
      (room) =>
        room.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase()
    )

    if (roomExists) {
      alert('This room number already exists.')
      return
    }

    const newRoom = {
      id: Date.now(),
      roomNumber: roomNumber.trim(),
      floor: Number(floor),
      type,
      capacity: Number(capacity),
      price: Number(price),
      status,
    }

    setRooms((previousRooms) => [...previousRooms, newRoom])

    setRoomNumber('')
    setFloor('1')
    setType('Double')
    setCapacity('2')
    setPrice('')
    setStatus('Available')
  }

  const handleStatusChange = (roomId, newStatus) => {
    setRooms((previousRooms) =>
      previousRooms.map((room) =>
        room.id === roomId ? { ...room, status: newStatus } : room
      )
    )
  }

  const handleDeleteRoom = (roomId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this room?'
    )

    if (confirmDelete) {
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
              type="text"
              placeholder="e.g. 103"
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
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
            <label htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="price">Price per Night (₹)</label>
            <input
              id="price"
              type="number"
              min="1"
              placeholder="e.g. 1500"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
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

          <button className="add-room-button" type="submit">
            + Add Room
          </button>
        </form>
      </section>

      <section className="room-list-section">
        <div className="section-heading">
          <h2>Room List</h2>
          <p>Update room status or remove a room.</p>
        </div>

        {rooms.length === 0 ? (
          <div className="empty-state">
            <h3>No rooms added yet</h3>
            <p>Use the form above to add your first room.</p>
          </div>
        ) : (
          <div className="room-table-wrapper">
            <table className="room-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Floor</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Price / Night</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="room-number-cell">{room.roomNumber}</td>
                    <td>{room.floor}</td>
                    <td>{room.type}</td>
                    <td>{room.capacity} guests</td>
                    <td>₹{room.price.toLocaleString('en-IN')}</td>
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
                          aria-label={`Change status for room ${room.roomNumber}`}
                          value={room.status}
                          onChange={(event) =>
                            handleStatusChange(room.id, event.target.value)
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