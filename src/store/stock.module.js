import ApiService from '@/services/common/api.service'

const stock = {
  namespaced: true,
  state: () => ({
    errors: null,
    stocks: null,
    isLoading: false,
  }),
  getters: {
    // For get stocks
    getStocks(state) {
      return state.stocks
    }
  },
  actions: {
    // For get stock
    fetchStocks(context, content) {
      return new Promise((resolve, reject) => {
        ApiService.init()
        context.commit('setLoading', true)
        ApiService.get(`/api/stock`, {
          perPage: content.perPage,
          page: content.page,
          sortField: content.sortField,
          sortOrder: content.sortOrder,
          search: content.search,
          fromDate: content.fromDate,
          toDate: content.toDate,
          filterBy: content.filterBy,
          isZeroStock: content.isZeroStock,
        }).then(
          response => {
            if (response.status === 200) {
              context.commit('setStocks', response.data)
              context.commit('setLoading', false)
              resolve(response)
            }
          },
          error => {
            context.commit('setLoading', false)
            reject(error)
          }
        )
      })
    },

    // For import stock
    importStock(context, content) {
      return new Promise((resolve, reject) => {
        ApiService.init()
        context.commit('setLoading', true)
        let formData = new FormData();
        formData.append("file", content.file);
        ApiService.post(`/api/stock/import`, formData, true)
          .then(
            response => {
              if (response.status === 200) {
                resolve(response)
              }
            },
            error => {
              reject(error)
            }
          );
      })
    }
  },
  mutations: {
    // For set loading
    setLoading(state, data) {
      state.isLoading = data
    },

    // For set stock
    setStocks(state, data) {
      state.stocks = data
    },
  }
}

export default stock