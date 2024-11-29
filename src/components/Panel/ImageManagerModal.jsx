import React, { useState, useEffect } from 'react';

const ImageManagerModal = ({ product, isOpen, onClose }) => {
    const [images, setImages] = useState([]);
    const [hiddenImages, setHiddenImages] = useState(new Set()); 
    const [newImageUrl, setNewImageUrl] = useState('');

    useEffect(() => {
        if (product) {
            fetch(`http://localhost:3000/imgproduct/getImagesByProductId/${product.cod_prod}`)
                .then(response => response.json())
                .then(data => {
                    
                    setImages(data.data || [])
                }); 
        }
    }, [product]);

    const handleAddImage = async (event) => {
        event.preventDefault();

        if (!newImageUrl) {
            alert("Selecciona una imagen para subir.");
            return;
        }

        const formData = new FormData();
        formData.append("photo", newImageUrl); 

        try {
            const response = await fetch(`http://localhost:3000/imgproduct/addImage/${product.cod_prod}`, {
                method: "POST",
                body: formData, 
            });

            if (response.ok) {
                const result = await response.json();
                setImages((prev) => [...prev, { url_imagen: result.data.url_imagen }]);
                setNewImageUrl(null); 
            } else {
                console.error("Error al agregar la imagen");
            }
        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
        }
    };

    const toggleVisibility = async (imgprod_id, currentHiddenStatus) => {
        console.log("imgprod_id:", imgprod_id);
        console.log("currentHiddenStatus:", currentHiddenStatus);
        try {
            const response = await fetch(`http://localhost:3000/imgproduct/toggleVisibility/${imgprod_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hidden: !currentHiddenStatus }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);

                // Actualizamos el estado de la visibilidad en la lista de imágenes
                setImages((prevImages) =>
                    prevImages.map((img) =>
                        img.imgprod_id === imgprod_id
                            ? { ...img, hidden: !currentHiddenStatus }
                            : img
                    )
                );
            } else {
                console.error("Error al cambiar visibilidad:", response.statusText);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
        
    };

    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg w-[40rem] lg:w-[40rem] max-w-full relative">
            <h2 className="text-2xl mb-4">Imágenes para {product.prod_nombre}</h2>
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">Imágenes Existentes</h3>
                {images.length > 0 ? (
                    <ul className="mb-4 space-y-2">
                        
                        {images.map((img) => (
                            
                            <li 
                                key={img.imgprod_id} 
                                className="flex items-center justify-between p-2 bg-gray-100 border rounded"
                            >
                                {/* Imagen */}
                                <img 
                                    src={img.url_imagen} 
                                    alt={`Imagen ${img.imgprod_id}`} 
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <span className="flex-1 ml-2 text-sm truncate">{img.url_imagen}</span>
                                {/* Botón de Ocultar/Mostrar */}
                                <button
                                
                                    onClick={() => toggleVisibility(img.imgprod_id, img.hidden)}
                                    className={`px-2 py-1 rounded text-xs ${
                                        img.hidden
                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                            : "bg-yellow-500 hover:bg-yellow-600 text-white"
                                    }`}
                                >
                                    {img.hidden ? "Mostrar" : "Ocultar"}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Este producto aún no tiene imágenes.</p>
                )}
            </div>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImageUrl(e.target.files[0])}
                className="w-full p-2 border rounded mb-2"
            />
            <button onClick={handleAddImage} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2">Agregar Imagen</button>
            <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cerrar</button>
        </div>
    </div>
    );
};

export default ImageManagerModal;
