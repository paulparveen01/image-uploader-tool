 <!-- tel-input.vue -->
<template>
  <vue-tel-input v-model="value" 
    v-bind="bindProps"
    mode="international"
    :validCharactersOnly="true"
    :dynamicPlaceholder="true"
    :required="true"
    :onlyCountries="['IN','US','CA','GB','IE','DE','SRB','HR','BA','AU']"
    defaultCountry="US"
    inputClasses="form-control"
    @onInput="onInput"
  ></vue-tel-input>
</template>
<!-- :onlyCountries="['US']" 
@blur="onBlur"
    @focus="onFocus"
    @input="onInput"
    @keyup.enter="onEnter"
    @keyup.space="onSpace"
-->
<script>
import { abstractField } from "vue-form-generator";
import { bus } from '../main';

export default {
  name: "TelephoneInput",
  mixins: [abstractField],
  data() {
    return {
      bindProps: {
        placeholder: "Enter a phone number",
        required: false,
      }
    };
  },
  methods: {
    onInput({ number, isValid, country }) {
      bus.$emit("isValidPhoneNumber", isValid);
    },
  }
};
</script>