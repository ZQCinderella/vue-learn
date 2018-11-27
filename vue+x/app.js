import 'babel-polyfill'
import Vue from 'vue'
import store from './store'
import App from './components/index.vue'

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})