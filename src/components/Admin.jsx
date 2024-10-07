import React, { useEffect, useState } from 'react'

const Admin = () => {
    
    const[users,setUsers] = useState([])
    const loadUsers = async () => {
        const response = await fetch("http://localhost:1822/user",{
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        const data = await response.json()
        console.log(data)
        setUsers(data)
    }

    useEffect(() => {
        loadUsers()
    }, [])

return (
    <>
        <h1>prueba admin traer todos los usuarios registrados</h1>
        {users.map((usuarios) => (
            <div key={usuarios.usu_id}>
                <p>{usuarios.nombre}</p>
                <p>{usuarios.apellido}</p>
                <p>{usuarios.email}</p><br/>
            </div>
            ))}
    </>
)
}

export default Admin
