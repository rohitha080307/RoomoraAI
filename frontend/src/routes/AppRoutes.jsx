import { Routes, Route } from 'react-router-dom'
import App from '../App'
import HotelDashboard from '../pages/HotelDashboard'
import PGDashboard from '../pages/PGDashboard'
import Rooms from '../modules/hotel/Rooms'
import Bookings from '../modules/hotel/Bookings'
import CheckInOut from '../modules/hotel/CheckInOut'
import Payments from '../modules/hotel/Payments'
import Customers from '../modules/hotel/Customers'

function AppRoutes() {
  return (
    <Routes>
    <Route path="/" element={<App />} />
    <Route path="/hotel" element={<HotelDashboard />} />
    <Route path="/hotel/rooms" element={<Rooms />} />
    <Route path="/hotel/bookings" element={<Bookings />} />
    <Route path="/hotel/check-in-out" element={<CheckInOut />} />
    <Route path="/hotel/payments" element={<Payments />} />
    <Route path="/hotel/customers" element={<Customers />} />
    <Route path="/pg" element={<PGDashboard />} />
    </Routes>
  )
}

export default AppRoutes