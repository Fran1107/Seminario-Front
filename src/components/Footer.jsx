import { Link } from "react-router-dom";

export const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="bg-gradient-to-r from-[#0D1F2D] via-[#1d2e3d] to-[#354656] text-white p-6 text-center">
            <div className="container mx-auto">
                <p className="mb-2">© {year} | Todos los derechos reservados | Franco Espinoza</p>
                <div className="flex justify-center space-x-4">
                    <Link to="/productos" className="hover:text-gray-300 transition duration-300">Productos</Link>
                    <Link to="/ayuda" className="hover:text-gray-300 transition duration-300">Ayuda</Link>
                </div>
            </div>
        </footer>
    )
}
