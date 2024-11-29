import Cookies from 'js-cookie'

export const AuthService = {
    setToken: (token) => {
        Cookies.set('access_token', token, { expires: 1 }) // 1 día de expiración
    },

    getToken: () => {
        return Cookies.get('access_token')
    },

    removeToken: () => {
        Cookies.remove('access_token')
    },

    isAuthenticated: () => {
        return !!Cookies.get('access_token')
    },

    getUserRole: () => {
        const user = Cookies.get('user')
        return user ? JSON.parse(user).rol : null
    },
    getUser() {
        const user = Cookies.get('user') // Obtiene la cookie del usuario
        // Verifica si la cookie existe
        if (!user) {
            return null
        }
        try {
            return JSON.parse(user) 
        } catch (error) {
            console.error('Error al analizar los datos del usuario:', error)
            return null 
        }
    },
    getUserCuil() {
        const user = this.getUser() 
        return user ? user.cli_cuil : null
    },
    login: (user, token) => {
        Cookies.set('access_token', token)
        Cookies.set('user', JSON.stringify(user))
    },
    logout: () => {
        Cookies.remove('access_token')
        Cookies.remove('user')
        window.location.href = '/' 
        setTimeout(() => {
            window.location.reload() 
        }, 100) // 100 ms de retraso
    },
}
