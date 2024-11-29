import React, { useEffect, useState } from 'react'
import Productos from './Productos'
import { useParams } from 'react-router-dom'

const ItemListContainer = () => {

    const [products, setProducts] = useState([])
    const [titulo, setTitulo] = useState("Productos")
    const { categoria, marca } = useParams();

    const loadProducts = async () => {
        const response = await fetch("http://localhost:3000/products",{
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        const data = await response.json()
        if (categoria) {
            // Filtrar por categoría
            setProducts(data.filter((prod) => prod.categoria === categoria));
            setTitulo(`Categoría: ${categoria}`);
        } else if (marca) {
            // Filtrar por marca
            setProducts(data.filter((prod) => prod.marca === marca));
            setTitulo(`Marca: ${marca}`);
        } else {
            // Mostrar todos los productos
            setProducts(data);
            setTitulo("Productos");
        }
    }
    
    useEffect(()=>{
        loadProducts()
    },[categoria, marca])

    return (
        <Productos products={products} titulo={titulo}/>
    )
}
export default ItemListContainer
