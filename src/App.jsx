import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './components/User/Register'
import Admin from './components/Panel/Admin'
import Login from './components/User/Login'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './components/User/Profile'
import EditarPerfil from './components/User/EditarPerfil'
import { Footer } from './components/Footer'
import ItemListContainer from './components/Productos/ItemListContainer'
import ItemDetailContainer from './components/Productos/ItemDetailContainer'
import Carrito from './components/Productos/Carrito'
import Users from './components/Panel/Users'
import SearchResults from './components/SearchResult'
import ManageProducts from './components/Panel/ManageProducts'
import Operador from './components/Panel/Operador'
import Principal from './components/Principal'
import Ayuda from './components/Ayuda'
import Categorias from './components/Panel/Categorias'
import Pedido from './components/User/Pedido'
import Ventas from './components/Panel/Ventas'
import Marcas from './components/Panel/Marcas'


const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
        <Navbar />
        <main className="flex-grow mt-28">

          <Routes>
            {/* Clientes */}
            <Route path='/' element={<Principal />}></Route>
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/EditarPerfil' element={<EditarPerfil />} />
            <Route path='/Ayuda' element={<Ayuda />} />
            <Route path='/productos' element={<ItemListContainer />} />
            <Route path='/productos/:categoria' element={<ItemListContainer />} />
            <Route path='/productos/marcas/:marca' element={<ItemListContainer />} />
            <Route path='/products/:id' element={<ItemDetailContainer />} />
            <Route path='/carrito' element={<Carrito />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/pedido/getPedido/:id" element={<Pedido />} />


            {/* Admin */}
            <Route path='/admin' element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path='/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path='/manage-products' element={<ProtectedRoute><ManageProducts /></ProtectedRoute>} />
            <Route path='/categorias' element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
            <Route path='/ventas' element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
            <Route path='/marcas' element={<ProtectedRoute><Marcas /></ProtectedRoute>} />

            {/* Operador */}
            <Route path='/Operador' element={<ProtectedRoute><Operador /></ProtectedRoute>} />

          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
