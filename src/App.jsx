import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './components/Register'
import Admin from './components/Admin'
import Login from './components/Login'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Navbar/>
        <Routes>
          <Route path='/' element={<h1>Bienvenido Ecommerce pag principal</h1>}></Route>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>

          <Route path='/admin' element={<ProtectedRoute><Admin/></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
