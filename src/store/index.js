import Vue from 'vue'
import Vuex from 'vuex'
import stock from './stock.module'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    stock,
  },
})