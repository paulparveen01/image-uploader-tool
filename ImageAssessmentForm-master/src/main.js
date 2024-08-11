import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueFormGenerator from 'vue-form-generator'
import 'vue-form-generator/dist/vfg.css'

Vue.config.productionTip = false

import Element from 'element-ui'
import FormWizard from "vue-form-wizard";
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import locale from 'element-ui/lib/locale/lang/en'

import { BootstrapVue, LayoutPlugin } from 'bootstrap-vue'
// Install BootstrapVue
Vue.use(BootstrapVue)
Vue.use(LayoutPlugin)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/assets/css/main.css'
import '@/assets/css/bd-wizard.css'

Vue.use(Element, { locale })
Vue.use(FormWizard);
Vue.use(VueFormGenerator, {
  validators: {
    validatePhone: (value, field, model) => {
      // let regex = /\D*([2-9]\d{2})(\D*)([2-9]\d{2})(\D*)(\d{4})\D*/
      // let regex = /^\(?(\d{3})\)?[-\. ]?(\d{3})[-\. ]?(\d{4})( x\d{4})?$/
      /*let regex = /^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/ //validate US phone numbers
      if (!regex.test(value)) {
        return ['Please enter correct phone number']
      } else {
        return []
      }*/
    }
  },
});

import VueTelInput from "vue-tel-input";
import TelInput from './components/tel-input.vue';
// import 'vue-tel-input/dist/vue-tel-input.css';
Vue.use(VueTelInput);
Vue.component('field-tel-input', TelInput);

import VueMobileDetection from 'vue-mobile-detection';
Vue.use(VueMobileDetection);

import VTooltip from 'v-tooltip';
Vue.use(VTooltip);

import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
Vue.use(Loading);

import Multiselect from "vue-multiselect";
import 'vue-multiselect/dist/vue-multiselect.min.css';
Vue.component("multiselect", Multiselect);

export const bus = new Vue();

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
