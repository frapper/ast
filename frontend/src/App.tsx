import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Student } from '@/pages/Student'
import { Schools } from '@/pages/Schools'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<Student />} />
        <Route path="/schools" element={<Schools />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
