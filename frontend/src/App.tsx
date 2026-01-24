import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Student } from '@/pages/Student'
import { Schools } from '@/pages/Schools'
import { Login } from '@/pages/Login'
import { MySchools } from '@/pages/MySchools'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<Student />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-schools" element={<MySchools />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
