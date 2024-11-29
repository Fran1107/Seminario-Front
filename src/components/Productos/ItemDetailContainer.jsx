import React, { useEffect, useState } from 'react'
import ItemDetail from './ItemDetail'

import { useParams } from 'react-router-dom'

const ItemDetailContainer = () => {
    const { id } = useParams()
    const [item, setItem] = useState([])
    const loadItem = async () => {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        setItem(data)
    }
    useEffect(() => {
        loadItem()
    }, [id])
    return (
        <div>
            {item && <ItemDetail item={item} />}
        </div>
    )
}

export default ItemDetailContainer
