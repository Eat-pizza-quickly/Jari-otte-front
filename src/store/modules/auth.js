import axios from '@/plugins/axios'

export default {
  namespaced: true,

  state: {
    token: null,
    userRole: null,
  },

  mutations: {
    setToken(state, token) {
      state.token = token
    },
    setUserRole(state, role) {
      state.userRole = role
    },
    clearAuth(state) {
      state.token = null
      state.userRole = null
    },
  },

  actions: {
    async login({ commit }, credentials) {
      const response = await axios.post('/users/login', credentials)
      return response
    },

    logout({ commit }) {
      commit('clearAuth')
    },
  },

  getters: {
    isAdmin: (state) => state.userRole === 'ADMIN',
    isAuthenticated: (state) => !!state.token,
  },
}
