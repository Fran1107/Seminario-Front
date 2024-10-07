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
        const user = Cookies.get('user');
        return user ? JSON.parse(user) : null;
    },
    login: (user, token) => {
        Cookies.set('access_token', token)
        Cookies.set('user', JSON.stringify(user))
    },
    logout: () => {
        Cookies.remove('access_token')
        Cookies.remove('user')
        window.location.reload();
    },
}
