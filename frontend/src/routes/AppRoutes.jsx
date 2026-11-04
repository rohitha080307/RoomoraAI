import { Routes, Route } from 'react-router-dom'
import App from '../App'
import HotelDashboard from '../pages/HotelDashboard'
import PGDashboard from '../pages/PGDashboard'
import Rooms from '../modules/hotel/Rooms'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/hotel" element={<HotelDashboard />} />
      <Route path="/hotel/rooms" element={<Rooms />} />
      <Route path="/pg" element={<PGDashboard />} />
    </Routes>
  )
}

export default AppRoutes