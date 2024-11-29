import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { AuthService } from "../../Cookies/AuthService";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    // En CartContext
    const [addresses, setAddresses] = useState([
        {
            calle: 'Completar',
            numero: 'Completar',
            piso: '',
            dpto: '',
        }
    ]);
    
    const [address, setAddress] = useState(addresses[0]); // Domicilio seleccionado

    const [provinces, setProvinces] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [costoEnvio, setCostoEnvio] = useState(null);

    const cli_cuil = AuthService.getUserCuil()

    // cuando se monte el componente, tiene que traer lso datos del carrito de las cookies
    // Al montar, carga el carrito desde la API
    useEffect(() => {
        if (cli_cuil) {
            fetch(`http://localhost:3000/cart/getCart/${cli_cuil}`)
                .then(response => response.json())
                .then(data => {
                    setCartItems(data);
                    Cookies.set("cartItems", JSON.stringify(data), { expires: 7 });
                })
                .catch(error => {
                    console.error("Error loading cart:", error);
                    setCartItems([]);
                });
        }
    }, [cli_cuil]);

    // se obtiene la cantidad de un prod en el carrito
    const getProductQuantity = (cod_prod) => {
        const item = cartItems.find(item => item.cod_prod === cod_prod);
        return item ? item.cantidad : 0;
    };

    // agrega un prod al carrito
    const addToCart = async (product) => {
        const existingItem = cartItems.find(item => item.cod_prod === product.cod_prod);
        const maxQuantity = Math.min(product.prod_stock, 5);

        if (existingItem && existingItem.cantidad >= maxQuantity) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cart/addToCart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cli_cuil,
                    cod_prod: product.cod_prod,
                    cantidad: 1,
                }),
            });

            if (response.ok) {
                const updatedCart = await response.json();
                setCartItems(updatedCart);
            } else {
                console.error("Error al sincronizar con el servidor");
            }
        } catch (error) {
            console.error("Error al sincronizar con el servidor:", error);
        }
    };

    // actualiza la cantidad de un prod en el carrito el máximo de 5 y de stock
    // Función para actualizar la cantidad de un producto en el carrito
    const updateCartItemQuantity = async (cod_prod, newQuantity, prod_stock) => {
        const maxQuantity = Math.min(prod_stock, 5);

        if (newQuantity > 0 && newQuantity <= maxQuantity) {
            const updatedCartItems = cartItems.map(item =>
                item.cod_prod === cod_prod ? { ...item, cantidad: newQuantity } : item
            );

            setCartItems(updatedCartItems);
            try {
                const response = await fetch(`http://localhost:3000/cart/updateQuantity`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cli_cuil, cod_prod, cantidad: newQuantity }),
                });

                if (response.ok) {
                    const updatedCart = await response.json();
                    console.log('Respuesta de la actualización:', updatedCart);
                    setCartItems(updatedCart);
                } else {
                    console.error('Error al actualizar la cantidad del producto en el carrito');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else if (newQuantity <= 0) {
            // Si la cantidad es menor o igual a 0, se elimina del carrito
            removeFromCart(cod_prod);
        }
    };


    // Función para eliminar un producto del carrito
    const removeFromCart = async (cod_prod) => {
        try {
            await fetch(`http://localhost:3000/cart/removeFromCart`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cli_cuil, cod_prod })
            });
            setCartItems(prevItems => prevItems.filter(item => item.cod_prod !== cod_prod));
        } catch (error) {
            console.error("Error al eliminar del carrito:", error);
        }
    };

    // Función para vaciar el carrito
    const clearCart = async () => {
        try {
            const response = await fetch(`http://localhost:3000/cart/clearCart/${cli_cuil}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCartItems([]);
            } else {
                console.error('Error clearing cart');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para obtener la dirección del cliente desde el backend
    const fetchAddress = async () => {
        try {
            const response = await fetch(`http://localhost:3000/domicilio/${cli_cuil}`);
            if (response.ok) {
                const data = await response.json();

                if (data.length > 0) {
                    setAddress(data);
                } else {
                    // Si no se encuentra la dirección, deja los valores por defecto
                    setAddress({
                        calle: 'Completar',
                        numero: 'Completar',
                        piso: 'Completar',
                        dpto: 'Completar',
                    });
                }
            } else {
                console.error("Error al obtener el domicilio");
            }
        } catch (error) {
            console.error("Error al obtener el domicilio:", error);
        }

    };

    useEffect(() => {
        if (cli_cuil) {
            fetchAddress();
        }
    }, [cli_cuil]);

    useEffect(() => {
        // Cargar las provincias al iniciar el componente
        const fetchProvinces = async () => {
            try {
                const response = await fetch('http://localhost:3000/provincias');
                if (response.ok) {
                    const data = await response.json();
                    setProvinces(data);
                } else {
                    console.error("Error al obtener el domicilio");
                }


            } catch (error) {
                console.error('Error al obtener provincias:', error);
            }
        };

        fetchProvinces();
    }, []);


    // Cargar las localidades 
    const fetchLocalidades = async (prov_id) => {
        try {
            const response = await fetch(`http://localhost:3000/localidades/${prov_id}`);
            if (response.ok) {
                const data = await response.json();
                setLocalidades(data);
            } else {
                console.error("Error al obtener las localidades");
            }
        } catch (error) {
            console.error('Error al obtener localidades:', error);
        }
    };

    // Fetch de costo de envío
    const fetchCostoEnvio = async (prov_id) => {
        try {
            const response = await fetch(`http://localhost:3000/costoenvio/getCosto/${prov_id}`);
            if (response.ok) {
                const data = await response.json();
                setCostoEnvio(data[0]?.costo || 0);
            } else {
                console.error("Error al obtener los costos de envio por prov id");
            }
        } catch (error) {
            console.error('Error al obtener el costo de envio por prov id:', error);
        }
    };



    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getProductQuantity, updateCartItemQuantity, address, setAddress,addresses, setAddresses, provinces, localidades, fetchLocalidades, costoEnvio, fetchCostoEnvio }}>
            {children}
        </CartContext.Provider>

    );
};