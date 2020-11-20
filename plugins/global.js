import Vue from 'vue';

import { VBToggle, VBTooltip, BButton, BCol, BRow, ModalPlugin, BSpinner } from "bootstrap-vue";

Vue.directive('b-toggle', VBToggle);
Vue.directive('b-tooltip', VBTooltip);

Vue.component('b-col', BCol);
Vue.component('b-button', BButton);
Vue.component('b-row', BRow);
Vue.component('b-spinner', BSpinner);

Vue.use(ModalPlugin);
