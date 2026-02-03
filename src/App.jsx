import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LeadEntry from './components/LeadEntry'
import CRMInvisalignApple from './components/CRMInvisalignApple'
import LoginApple from './components/LoginApple'

function App() {
  return (
    <BrowserRouter>
      {/* Dev Navigation */}
      <div className="fixed top-0 right-0 p-2 z-50 opacity-50 hover:opacity-100 bg-white/80 rounded-bl-lg text-xs">
        <Link to="/" className="mr-2 text-blue-500">Login</Link>
        <Link to="/dashboard" className="mr-2 text-blue-500">Dashboard</Link>
        <Link to="/entry" className="text-blue-500">Entry</Link>
      </div>

      <Routes>
        <Route path="/" element={<LoginApple />} />
        <Route path="/dashboard" element={<CRMInvisalignApple />} />
        <Route path="/entry" element={<LeadEntry />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
