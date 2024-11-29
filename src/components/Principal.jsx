import React, { useContext, useEffect, useState } from 'react';
import { PrincipalContext } from './Context/PrincipalContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import Item from './Productos/Item';
import { AuthService } from '../Cookies/AuthService';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from "framer-motion";

const Principal = () => {
    const { products } = useContext(PrincipalContext)
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [productImages, setProductImages] = useState({});
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        
        fetch('http://localhost:3000/marcas')
            .then(response => response.json())
            .then(data => {
                setBrands(data);
            })
            .catch(error => console.error('Error fetching brands:', error));

        
        const loggedUser = AuthService.getUser();
        if (loggedUser && loggedUser.cli_cuil < 10000000) {
            navigate('/EditarPerfil');
            Swal.fire('¡BIENVENIDO!', 'COMPLETA TUS DATOS PARA SEGUIR NAVEGANDO POR FAVOR', 'warning');
        }
    }, []);

    useEffect(() => {

        const fetchProductImages = async () => {
            const images = {};
            for (let product of products) {
                try {
                    const response = await fetch(`http://localhost:3000/imgproduct/getImagesByProductId/${product.cod_prod}`);
                    const result = await response.json();

                    if (result.status == 'success' && Array.isArray(result.data)) {
                        images[product.cod_prod] = result.data.map(img => img.url_imagen); 

                    }
                } catch (error) {
                    console.error(`Error fetching image for product ${product.cod_prod}:`, error);
                }
            }
            setProductImages(images);
        };

        if (products.length > 0) {
            fetchProductImages();
        }
    }, [products]);

    useEffect(() => {
        // Fetch categorías
        fetch('http://localhost:3000/categorias')
            .then((response) => response.json())
            .then((data) => setCategorias(data))
            .catch((error) => console.error('Error fetching categorías:', error));
    }, []);

    if (categorias.length === 0) return <p>Cargando categorías...</p>;

    return (
        <div className="p-8">
            <motion.h1
                className="text-3xl font-bold text-center mb-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                Conoce nuestros <span className="text-[#0D6E6E]">productos destacados</span>
            </motion.h1>
            <Swiper modules={[Navigation, Pagination]} spaceBetween={20} slidesPerView={1}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }}
                navigation pagination={{
                    clickable: true,
                    el: '.custom-pagination2',
                }} className="w-full">
                {products
                    .filter(product => product.prod_destacado && product.habilitar)
                    .slice(0, 10) // muestra solo 10 productos
                    .map(product => (
                        <SwiperSlide key={product.cod_prod} className="flex justify-center">

                            <Item producto={product} />

                        </SwiperSlide>
                    ))}
            </Swiper>
            {/* Contenedor para la paginación personalizada (3 puntitos) */}
            <div className="custom-pagination2 mt-6 flex justify-center"></div>
            <div className="p-8">
                <motion.h1
                    className="text-3xl font-bold text-center mb-6"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: [0, 1], y: [50, 0] }} // Secuencia de animación
                    transition={{
                        duration: 1.5, // Duracion de la animacion
                        repeat: Infinity, // Se repite infinitamente
                        repeatDelay: 4.5, // Pausa de 4.5 segundos entre cada animación (total 6 segundos)
                        ease: "easeOut",
                    }}
                >
                    Explorá nuestras <span className="text-[#0D6E6E]">categorías</span>
                </motion.h1>

                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
                    navigation
                    pagination={{
                        clickable: true,
                        el: '.custom-pagination',
                    }}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 4 },
                    }}
                >
                    {/* Mapear todas las categorías */}
                    {categorias.map((categoria) => (
                        <SwiperSlide key={categoria.cat_nombre}>
                            <div
                                className="relative border shadow-lg rounded-lg cursor-pointer"
                                onClick={() => navigate(`/productos/${categoria.cat_nombre}`)}
                            >
                                {/* Contenedor de la imagen con overflow-hidden */}
                                <div className="overflow-hidden rounded-t-lg">
                                    <img
                                        src={categoria.url}
                                        alt={categoria.cat_nombre}
                                        className="w-full h-40 object-cover rounded-t-lg transform transition-transform duration-300 hover:scale-110"
                                    />
                                </div>
                                {/* Texto de la categoría */}
                                <div className="bg-gray-100 p-2 text-center rounded-b-lg">
                                    <span className="text-lg font-semibold">
                                        {categoria.cat_nombre.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                {/* Contenedor para la paginación personalizada (3 puntitos) */}
                <div className="custom-pagination mt-6 flex justify-center"></div>
            </div>

            <div className="p-6">
                <h1 className="text-3xl font-bold text-center mb-6 mt-8">Las <span className="text-[#0D6E6E]">mejores marcas</span> para vos</h1>
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    navigation
                    pagination={{
                        clickable: true,
                        el: '.custom-pagination1',
                    }}
                    className="w-full"
                >
                    {brands.map((brand) => (
                        <SwiperSlide key={brand.marca_id} className="flex justify-center">
                            <div className="bg-white rounded-lg shadow-lg p-4 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-[#0D1F2D] mt-4 mb-4" onClick={() => navigate(`/productos/marcas/${brand.marca_nombre}`)}>
                                {/* Brand logo */}
                                <div className="flex justify-center mb-4 " >
                                    <img src={brand.logo_url} alt={brand.marca_nombre} className="w-24 h-24 object-contain" />
                                </div>
                                <h3 className="text-center font-semibold mb-4">{brand.marca_nombre}</h3>
                                {/* Fetch and display two product images for each brand */}
                                <div className="flex justify-around ">
                                    {products
                                        .filter(product => product.marca == brand.marca_nombre)
                                        .slice(0, 2)
                                        .map(product => {
                                            return (
                                                <img
                                                    key={product.cod_prod}
                                                    src={productImages[product.cod_prod]?.[0]} 
                                                    alt={product.nombre}
                                                    className="w-24 h-24 object-contain"
                                                />
                                            );
                                        })}
                                </div>

                                {/* View more link */}
                                <div className="text-center mt-4 cursor-pointer" onClick={() => navigate(`/productos/marcas/${brand.marca_nombre}`)}>
                                    <Link to='' className="bg-[#0D6E6E] text-white px-4 py-2 rounded-full hover:bg-[#4a9d9c] transition-all duration-300">
                                        Ver más
                                    </Link>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

                </Swiper>
                {/* Contenedor para la paginación personalizada (3 puntitos) */}
                <div className="custom-pagination1 mt-6 flex justify-center"></div>
            </div>
        </div>

    )
}



export default Principal;
