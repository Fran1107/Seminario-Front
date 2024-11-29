import React, { createContext, useState, useEffect } from 'react';

export const PrincipalContext = createContext();

const PrincipalProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    const loadProducts = async () => {
        const response = await fetch("http://localhost:3000/products", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        setProducts(data);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <PrincipalContext.Provider value={{ products }}>
            {children}
        </PrincipalContext.Provider>
    );
};

export default PrincipalProvider;
