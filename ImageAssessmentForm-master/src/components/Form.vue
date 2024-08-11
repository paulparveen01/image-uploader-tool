<template>
  <div class="vue-tempalte wizard">
    <form-wizard class="content"
      v-if="displayAssessmentForm"
      @on-change="onStepChange"
      @on-complete="onComplete"
      @on-error="handleErrorMessage"
      title="Free Virtual Smile Assessment"
      subtitle="Fill out the all steps"
      shape="circle"
      color="#2db678"
      error-color="#ff4949"
      step-size="xs"
      ref="wizard"
    >
      <template slot="step" slot-scope="props">
        <wizard-step
          :tab="props.tab"
          :transition="props.transition"
          :key="props.tab.title"
          :index="props.index"
        >
        </wizard-step>
      </template>

      <div v-if="errorMsg">
        <span class="error">{{ errorMsg }}</span>
      </div>

      <tab-content title="" v-if="!$isMobile()">
        <hr />
        <section>
            <h5 class="bd-wizard-step-title">Continue from your Phone or Desktop?</h5>

            <p>It looks like you are on a computer.</p>
            <p>It might be easier to use your phone to take your smile selfies.</p>
            <p>Enter your mobile number or email and we will send you a link so you can continue.</p>

            <div v-if="successMsg">
              <span class="success">{{ successMsg }}</span>
            </div>

            <vue-form-generator
              :model="model"
              :schema="phoneTabSchema"
              :options="formOptions"
              ref="phoneTabSchema"
            >
            </vue-form-generator>
            <div v-if="commError">
              <span class="invalidPhone">{{ commError }}</span>
            </div>
            <!-- <vue-form-generator
              :model="model"
              :schema="telPhoneSchema"
              ref="telVerification"
            >
            </vue-form-generator> -->

            <!-- <button class="btn btn-warning" @click="sendCode">Send code</button> -->
            <!-- <button class="btn btn-info">No, I will continue here</button> -->
        </section>
      </tab-content>

      <tab-content title="" :before-change="processFirstTab">
        <!-- <h4>ENTER THE PATIENT CONTACT INFORMATION</h4> -->
        <hr />
        <h5 class="bd-wizard-step-title">Let’s get started!</h5>
        <!-- <i class="fa fa-info-circle" aria-hidden="true" v-tooltip.top-center="tooltipMsg"></i> -->
        <!-- <img src="../assets/images/info-icon.png" class="info-tooltip" v-tooltip.top-center="tooltipMsg" /> -->
        <h2 class="section-heading">Enter your Information 
          <v-popover trigger="hover" class="inline info-icon">
            <a type="button" data-container="body" data-toggle="popover" data-placement="top" data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
            </a>
            <template slot="popover">
              <a v-close-popover>Your information is secure and will only be used for the purposes of getting you treatment</a>
            </template>
          </v-popover>
        </h2>
        <p>Your information is secure and will only be used for the purposes of getting you treatment</p>

        <vue-form-generator
          :model="model"
          :schema="firstTabSchema"
          :options="formOptions"
          ref="firstTabForm"
        >
        </vue-form-generator>
      </tab-content>

      <tab-content ref="fileUploadFirst" title="" :before-change="processUploadFirst">
        <hr />
        <h5 class="bd-wizard-step-title">Upload</h5>
        <h2 class="section-heading mb-5">BIG Exaggerated Smile and Front Teeth</h2>
        <div class="instruction">
          <p>
            You might need some help with this one. Look straight ahead and give a BIG smile. Remember to use a FLASH for best results.
          </p>
        </div>
        <div class="h-flex centered">
          <div class="imagePortrait">
            <div class="outer-overlay">
              <div class="image-container">
                <div>
                  <img
                    alt="exaggerated smile"
                    src="https://d1czbxowbjd7i2.cloudfront.net/assets/1-esmile.jpg"
                  />
                </div>
                <div>
                  <label>Try to get your photo to look like this</label></div>
              </div>
              <ImageUpload
                :options="imageUploadOptions7"
                @getImageData="showImageData"
                @removeImageData="remImageData"
                @isUploadInProgress="checkIsUploadInProgress"
              />
            </div>
          </div>
        </div>
        <div class="h-flex centered">
          <div class="imagePortrait">
            <div class="outer-overlay">
              <div class="image-container">
                <div>
                  <img alt="front" src="https://d1czbxowbjd7i2.cloudfront.net/assets/2-front.jpg" />
                </div>
                <div>
                  <label>Try to get your photo to look like this</label>
                </div>
              </div>
              <ImageUpload
                :options="imageUploadOptions1"
                @getImageData="showImageData"
                @removeImageData="remImageData"
                @isUploadInProgress="checkIsUploadInProgress"
              />
            </div>
          </div>
        </div>
      </tab-content>

      <tab-content ref="fileUploadSecond" title="" :before-change="processUploadSecond">
          <hr />
          <h5 class="bd-wizard-step-title">Upload</h5>
          <h2 class="section-heading mb-5">Left and Right Side</h2>
          <div class="instruction">
            <p>
              Bit down on your back teeth and smile wide! Pull your lips and cheeks back with two fingers or a spoon to get a clear view of all the teeth.
            </p>
            <p>
              Remember to use the FLASH and TIMER for best results. You can try as many times as you need to get it right by deleting the photo after uploading.
            </p>
          </div>
          <div class="h-flex centered">
            <label><b>Left Side</b></label>
            <div class="imagePortrait">
              <div class="outer-overlay">
                <div class="image-container">
                  <div>
                    <img alt="left" src="https://d1czbxowbjd7i2.cloudfront.net/assets/3-left.jpg" />
                  </div>
                  <div>
                    <label>Try to get your photo to look like this</label>
                  </div>
                </div>
                <ImageUpload
                  :options="imageUploadOptions2"
                  @getImageData="showImageData"
                  @removeImageData="remImageData"
                  @isUploadInProgress="checkIsUploadInProgress"
                />
              </div>
            </div>
          </div>

          <div class="h-flex centered">
            <label><b>Right Side</b></label>
            <div class="imagePortrait">
              <div class="outer-overlay">
                <div class="image-container">
                  <div>
                    <img alt="right" src="https://d1czbxowbjd7i2.cloudfront.net/assets/4-right.jpg" />
                  </div>
                  <div>
                    <label>Try to get your photo to look like this</label>
                  </div>
                </div>
                <ImageUpload
                  :options="imageUploadOptions3"
                  @getImageData="showImageData"
                  @removeImageData="remImageData"
                  @isUploadInProgress="checkIsUploadInProgress"
                />
              </div>
            </div>
          </div>
      </tab-content>

      <tab-content ref="fileUploadThird" title="" :before-change="processUploadThird">
          <h5 class="bd-wizard-step-title">Upload</h5>
          <h2 class="section-heading mb-5">Chin Up, Lower teeth, Upper teeth</h2>
          <div class="h-flex centered">
            <label><b>Upper Arch</b></label>
            <div class="imagePortrait">
              <div class="outer-overlay">
                <div class="image-container">
                  <div>
                    <img alt="upper arch" src="https://d1czbxowbjd7i2.cloudfront.net/assets/5-up.jpg" />
                  </div>
                  <div>
                    <label>Try to get your photo to look like this</label>
                  </div>
                </div>
                <ImageUpload
                  :options="imageUploadOptions4"
                  @getImageData="showImageData"
                  @removeImageData="remImageData"
                  @isUploadInProgress="checkIsUploadInProgress"
                />
              </div>
            </div>
          </div>

          <div class="h-flex centered">
            <label><b>Lower Arch</b></label>
            <div class="imagePortrait">
              <div class="outer-overlay">
                <div class="image-container">
                  <div>
                    <img alt="lower arch" src="https://d1czbxowbjd7i2.cloudfront.net/assets/6-lower.jpg" />
                  </div>
                  <div>
                    <label>Try to get your photo to look like this</label>
                  </div>
                </div>
                <ImageUpload
                  :options="imageUploadOptions5"
                  @getImageData="showImageData"
                  @removeImageData="remImageData"
                  @isUploadInProgress="checkIsUploadInProgress"
                />
              </div>
            </div>
          </div>

          <div class="h-flex centered">
            <label><b>Chin Up</b></label>
            <div class="imagePortrait">
              <div class="outer-overlay">
                <div class="image-container">
                  <div>
                    <img alt="chin up" src="https://d1czbxowbjd7i2.cloudfront.net/assets/7-chinup.jpg" />
                  </div>
                  <div>
                    <label>Try to get your photo to look like this</label>
                  </div>
                </div>
                <ImageUpload
                  :options="imageUploadOptions6"
                  @getImageData="showImageData"
                  @removeImageData="remImageData"
                  @isUploadInProgress="checkIsUploadInProgress"
                />
              </div>
            </div>
          </div>
      </tab-content>

      <!-- https://jsfiddle.net/bt5dhqtf/717/ -->
      <template slot="footer" slot-scope="props">
        <!-- <div class="wizard-footer-left">
           <wizard-button  v-if="props.activeTabIndex > 0 && !props.isLastStep" @click.native="props.prevTab()" :style="props.fillButtonStyle">Previous</wizard-button>
        </div> -->
        <div class="wizard-footer-right">
          <!-- <i class='fa fa-spinner fa-spin fa-1x' v-if="isInProgress"></i> -->
          <wizard-button
            v-if="!props.isLastStep && !isInProgress"
            @click.native="props.nextTab()"
            class="wizard-footer-right"
            :style="props.fillButtonStyle"
            :disabled="isDisabled"
            >{{ (props.activeTabIndex == 0 && !$isMobile()) ? 'I will continue from here' : "Continue" }}</wizard-button
          >

          <wizard-button
            v-else-if="isInProgress"
            class="wizard-footer-right finish-button"
            :style="props.fillButtonStyle"
            :disabled=true
            >Please wait</wizard-button>

          <wizard-button
            v-else-if="!isAssessmentCompleted"
            @click.native="onComplete()"
            class="wizard-footer-right finish-button"
            :style="props.fillButtonStyle"
            :disabled="loadingWizard || isDisabled"
            >{{ props.isLastStep ? "Finish" : "Continue" }}</wizard-button
          >
          <!-- <wizard-button
            v-if="!props.isLastStep"
            @click.native="props.nextTab()"
            class="wizard-footer-right"
            :style="props.fillButtonStyle"
            :disabled="loadingWizard"
            >{{ props.activeTabIndex === 2 ? "Finish" : "Next" }}</wizard-button
          > -->
        </div>
      </template>
    </form-wizard>

    <div class="submitting-data" v-if="loadingWizard">
      <div class="title">Almost there, your Smile Selfies are being processed. Please wait</div>
      <div class="loader"></div>
    </div>

    <div class="content" v-if="isAssessmentCompleted">
      <section>
        <h5 class="bd-wizard-step-title">Hi {{ model.username }}</h5>
        <h2 class="section-heading mb-5">Thank you for submitting your Smile Selfies.</h2>
        <p>A 6MS Smile Concierge will be in touch with you within one business day. Watch your email for your Smile Gallery which will be used to determine the best treatment for your new smile.</p>
      </section>
    </div>

    <div class="form-submission-error" v-if="formSubmissionError">
      <span class="error">
        {{ formSubmissionError }}
        <button class="wizard-btn reset-btn" @click="restart">
          Start again
        </button></span
      >
    </div>
  </div>
</template>

<script>
import VueFormGenerator from "vue-form-generator";
import ImageUpload from "@/components/ImageUpload.vue";
import axios from "axios";
import AWS from 'aws-sdk';
import '@/assets/css/tooltip.scss';
import VueTelInput from 'vue-tel-input';
import { bus } from '../main';
axios.defaults.headers.common["x-api-key"] = "DOBiJWQxIS9zKym8palPM6B5xX1tXiaF8SdLR3gp";
// To run locally use base url as
// axios.defaults.baseURL = "https://d24e4p0y2o78hs.cloudfront.net";
// To run live use base url as 
axios.defaults.baseURL = "";
VueFormGenerator.validators.resources.invalidFormat = "Please enter valid Input";
AWS.config.update({ region: 'us-east-2' });
// remove it while build
const s3 = new AWS.S3();
export default {
  name: "Form",
  mixins: [VueFormGenerator],
  data() {
    return {
      imgUploadFirstData: [],
      imgUploadSecondData: [],
      imgUploadThirdData: [],
      firstTabImgLength: 2, // 2 Image upload required
      secTabImgLength: 2, // 2 Image upload required
      thirdTabImgLength: 3, // 3 Image upload required
      loadingWizard: false,
      isAssessmentCompleted: false,
      errorMsg: null,
      formSubmissionError: null,
      isInProgress: false,
      isDisabled: false,
      generatedFormId: null,
      cloudfrontUrls: [],
      successMsg: null,
      commError: null,
      isValidPhoneNumInputted: null,
      currentTabIndex: 0,
      loader: null,
      model: {
        username: "",
        phonenumber: "",
        notifyphoneNumber: "",
        notifyemail: "",
        email: "",
        zipcode: "",
        agreeToTerms: "",
        commChoice: "Text",
        treatmentGoal: "",
        treatmentStart: "",
        dentistInMind: "Yes",
        dentistName: "",
        dentistCity: "",
        dentistState: "",
        dentistChoiceHelp: "",
      },
      formOptions: {
        validationErrorClass: "has-error",
        validationSuccessClass: "has-success",
        validateAfterChanged: true,
      },
      //https://jsfiddle.net/zoul0813/d8excp36/
      // telPhoneSchema: {
      //   fields: [
      //     {
      //       type: "tel-input",
      //       label: "Phone Number",
      //       model: "notifyphoneNumber"
      //     }
      //   ]
      // },
      phoneTabSchema: {
        fields: [
          {
            type: 'radios',
            model: 'commChoice',
            values: [
              'Text',
              'Email',
            ],
          },
          {
            type: "tel-input",
            inputType: "text",
            model: "notifyphoneNumber",
            placeholder: "Phone Number", //https://blog.logrocket.com/how-to-build-reusable-forms-using-vue-form-generator/
            // min: 10,
            required: true,
            validator: (value, field, model) => {
              if (!this.isValidPhoneNumInputted) {
                return ['Please enter correct phone number']
              } else {
                return []
              }
            },
            styleClasses: "comm-phone-outer",
            visible(model, field, form) { /* show it only if sms radio selected */
                (model.commChoice == "Text") ? model.notifyemail = "" : ""; // reset value
                return model && model.commChoice == "Text";
            }
          },
          {
            type: "input",
            inputType: "email",
            model: "notifyemail",
            placeholder: "email@example.com",
            required: true,
            validator: VueFormGenerator.validators.email,
            styleClasses: "comm-phone-outer",
            visible(model, field, form) { /* show it only if email radio selected */
                (model.commChoice == "Email") ? model.notifyphoneNumber = "" : ''; // reset value
                return model && model.commChoice == "Email";
            }
          },
          {
            type: "submit",
            buttonText: "Send Link",
            onSubmit: this.onSendCodeValidated,
            validateBeforeSubmit: true,
            disabled: false,
            styleClasses: "send-code-button",
          }
        ]
      },
      firstTabSchema: {
        fields: [
          {
            type: "input",
            inputType: "text",
            model: "username",
            placeholder: "Your Name",
            required: true,
            validator: VueFormGenerator.validators.string,
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
          },
          {
            type: "input",
            inputType: "text",
            placeholder: "Zip Code",
            model: "zipcode",
            required: true,
            validator: VueFormGenerator.validators.string,
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
          },
          {
            type: "tel-input",
            inputType: "text",
            model: "phonenumber",
            placeholder: "Phone Number", //https://blog.logrocket.com/how-to-build-reusable-forms-using-vue-form-generator/
            // min: 10,
            required: true,
            validator: (value, field, model) => {
              if (!this.isValidPhoneNumInputted) {
                return ['Please enter correct phone number']
              } else {
                return []
              }
            },
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
          },
          {
            type: "input",
            inputType: "text",
            placeholder: "Email Address",
            model: "email",
            required: true,
            validator: VueFormGenerator.validators.email,
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
          },
          {
            type: "vueMultiSelect", // https://github.com/shentao/vue-multiselect/tree/2.0#install--basic-usage            
            model: "treatmentGoal",
            label: "What is your primary goal for treatment?",
            // placeholder: "What is your primary goal for treatment?",
            required: true,
            selectOptions: {
              multiple: true,
              searchable: true,
              clearOnSelect: false,
              closeOnSelect: true,
              hideSelected: true,
              selectLabel: false,
            },
            values: [
              "To straighten my teeth",
              "To close spaces and gaps in my teeth",
              "To correct my bite",
              "None of the above"
            ],
            validator: (value, field, model) => {
              if (!value) {
                return ['This field is required']
              } else {
                return []
              }
            },
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
          },
          {
            type: "vueMultiSelect",            
            model: "treatmentStart",
            label: "When do you want to start treatment?",
            // placeholder: "When do you want to start treatment?",
            required: true,
            selectOptions: {
              multiple: false,
              searchable: false,
              clearOnSelect: false,
              closeOnSelect: true,
              hideSelected: true,
              selectLabel: false,
            },
            values: [
              "I have a deadline and am ready to get started right away",
              "I want to start treatment in the next 3-6 months",
              "I am gathering information",
            ],
            validator: (value, field, model) => {
              if (!value) {
                return ['This field is required']
              } else {
                return []
              }
            },
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
          },
          {
            type: 'radios',
            label: "Do you have a dentist in mind for your treatment?",
            model: 'dentistInMind',
            values: [
              'Yes',
              'No',
            ],
            styleClasses: "col-12",
          },
          {
            type: "input",
            inputType: "text",
            model: "dentistName",
            placeholder: "What is your dentist’s name?",
            required: true,
            validator: VueFormGenerator.validators.string,
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
            visible(model, field, form) { /* show it only if dentistInMind is Yes */
                (model.dentistInMind == "No") ? model.dentistName = "" : ''; // reset value
                return model && model.dentistInMind == "Yes";
            },
          },
          {
            type: "input",
            inputType: "text",
            model: "dentistCity",
            placeholder: "City",
            required: true,
            validator: VueFormGenerator.validators.string,
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
            visible(model, field, form) { /* show it only if dentistInMind is Yes */
                (model.dentistInMind == "No") ? model.dentistCity = "" : ''; // reset value
                return model && model.dentistInMind == "Yes";
            }
          },
          {
            type: "input",
            inputType: "text",
            model: "dentistState",
            placeholder: "State",
            required: true,
            validator: VueFormGenerator.validators.string,
            styleClasses: "col-lg-6 col-md-6 col-sm-12 col-xs-12",
            visible(model, field, form) { /* show it only if dentistInMind is Yes */
                (model.dentistInMind == "No") ? model.dentistState = "" : ''; // reset value
                return model && model.dentistInMind == "Yes";
            }
          },
          {
            type: 'radios',
            label: "Do you need help in choosing a qualified Six Month Smiles provider?",
            model: 'dentistChoiceHelp',
            required: true,
            values: [
              'Yes',
              'No',
            ],
            visible(model, field, form) { /* show it only if dentistInMind is No */
                (model.dentistInMind == "Yes") ? model.dentistChoiceHelp = "" : ''; // reset value
                return model && model.dentistInMind == "No";
            },
            validator: (value, field, model) => {
              if (!value) {
                return ['This field is required']
              } else {
                return []
              }
            },
            styleClasses: "col-12",
          },
          {
            type: "checkbox",
            label:
              'I have read all the terms and conditions and provided true and accurate information.<br/>I am 18 years of age or have permission from my parent or guardian to share my information.',
            model: "agreeToTerms",
            required: true,
            styleClasses: "terms-conditions col-12",
            validator: function (value) {
              if (value !== true) return ["Please agree!"];
            },
          },
        ],
      },
      /*lastTabSchema: {
        fields: [
          {
            type: "checkbox",
            label:
              'Agree to Terms and Conditions <a href="#" class="text-success">Terms and Conditions</a>',
            model: "agreeToTerms",
            required: true,
            validator: function (value) {
              if (value !== true) return ["Please agree!"];
            },
          },
        ],
      },*/
    };
  },
  components: {
    ImageUpload,
    VueTelInput,
  },
  computed: {
    imageUploadOptions1: function () {
      return { id: "imageUpload1", maxFiles: 1 };
    },
    imageUploadOptions2: function () {
      return { id: "imageUpload2", maxFiles: 1 };
    },
    imageUploadOptions3: function () {
      return { id: "imageUpload3", maxFiles: 1 };
    },
    imageUploadOptions4: function () {
      return { id: "imageUpload4", maxFiles: 1 };
    },
    imageUploadOptions5: function () {
      return { id: "imageUpload5", maxFiles: 1 };
    },
    imageUploadOptions6: function () {
      return { id: "imageUpload6", maxFiles: 1 };
    },
    imageUploadOptions7: function () {
      return { id: "imageUpload7", maxFiles: 1 };
    },
    displayAssessmentForm: function () {
      return this.isAssessmentCompleted ||
        (!this.isAssessmentCompleted && this.loadingWizard) ||
        this.formSubmissionError
        ? false
        : true;
    },
  },
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/scss/_variables.scss";
          @import "@/scss/_mixins.scss";
        `
      }
    }
  },
  methods: {
    scrollToTop: function () {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
      // this.loadingWizard = false;
    },
    handleErrorMessage: function (errorMsg) {
      this.errorMsg = errorMsg;
    },
    restart: function () {
      this.formSubmissionError = null;
      this.cloudfrontUrls = [];
      this.generatedFormId = null;
      this.imgUploadFirstData = [];
      this.imgUploadSecondData = [];
      this.imgUploadThirdData = [];
      this.successMsg = null;
      this.errorMsg = null;
      this.commError = null,
      this.model = {
        username: "",
        phonenumber: "",
        notifyphoneNumber: "",
        notifyemail: "",
        zipcode: "",
        email: "",
        agreeToTerms: "",
        commChoice: "",
        treatmentGoal: "",
        treatmentStart: "",
        dentistInMind: "Yes",
        dentistName: "",
        dentistCity: "",
        dentistState: "",
        dentistChoiceHelp: "",
      };
      // this.$refs.wizard.navigateToTab(0)
    },
    randomString: function() {
        return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    },
    onStepChange (prevIndex, nextIndex) {
      this.currentTabIndex = nextIndex;
      this.scrollToTop(); // scroll to top on each step change
    },
    showLoader(isShow) {
      if (isShow) {
        this.loader = this.$loading.show({
          container: this.fullPage ? null : this.$refs.formContainer,
          canCancel: false,
          loader: 'dots',
          color: 'green',
          zIndex: 999,
          opacity: 0.5
        },{
          after: 'Please Wait'
        });
      } else {
        this.loader.hide();
      }
    },
    // Create pre signed url to avoid using AWS secret access key
    async getS3SignedUrl(imageKeyPath, contentType) {
      try {
        const params = {
            imageKeyPath,
            contentType
        }
        const response = await axios.post("/api/form/s3signedurl", params);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async uploadImageToS3(keyPath, bufferData) {
      const cloudfrontURL = 'https://d1czbxowbjd7i2.cloudfront.net';
      try {
        const randomString = this.randomString();
        const imageKeyPath = keyPath + `${randomString}.${bufferData.content_type}`;
        const contentType = `image/${bufferData.content_type}`;
        const res = await this.getS3SignedUrl(imageKeyPath, contentType);
        const data = await axios ({
          method:'put',
          url: res.data.signedUrl,
          baseURL: '',
          data: bufferData.buffer_data
        })
        const url = `${cloudfrontURL}/${imageKeyPath}`;
        return Promise.resolve(url);
      } catch (error) {
          console.error("Error s3 get image details: ", error);
          return Promise.reject(error);
      }
    },
    async initImageUpload(buffersData, formId) {
      try {
        const imageKeyPath = `original/${this.model.email.toLowerCase()}/${formId}`;
        let fileIndex = this.cloudfrontUrls.length;
        const promises = buffersData.reduce((prev, cur) => {
            fileIndex = parseInt(fileIndex) + 1;
            const keyPath = imageKeyPath + '/orig' + fileIndex + '_'; 
            prev.push(this.uploadImageToS3(keyPath, cur));
            return prev;
        },[]);

        const response = await Promise.all(promises);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async sendCommEmail(toemail) {
      const $this = this;
      try {
        const params = {
          email: toemail,
          commEmail: "fromstep1",
        }
        // axios.defaults.baseURL = "http://localhost:8082";
        const response = await axios.post('/api/form/sendemail', params);
        $this.commError = null;
        $this.successMsg = "The link to the virtual smile assessment has been sent to you in an email.";
        return Promise.resolve(response);
      } catch(error) {
        $this.successMsg = null;
        $this.commError = "Facing temporary issue sending email. Please contact website admin.";
        return Promise.reject(error);
      }
    },
    async sendCommSms(phnNumber) {
      const $this = this;
      try {
        const params = {
            phoneNumber: phnNumber
        }
        // axios.defaults.baseURL = "http://3.130.76.30/api/form/autoorientimage";
        // axios.defaults.baseURL = "http://localhost:8082";
        const resp = await axios.post("/api/form/sendmessage", params);
        $this.commError = null;
        $this.successMsg = "The link to the virtual smile assessment has been sent to you in a text message";
        return Promise.resolve(true);
      } catch (error){
        $this.successMsg = null;
        $this.commError = "Seems Invalid phone number. Please try with correct!";
        return Promise.reject(error);
      }
    },
    async onSendCodeValidated(resp, actBtn) {
      const $this = this;
      try {
        actBtn.disabled = true;
        if(resp.commChoice === 'Text') {
          await $this.sendCommSms(resp.notifyphoneNumber);
          actBtn.disabled = false;
        }
        
        if(resp.commChoice === 'Email') {
          await $this.sendCommEmail(resp.notifyemail);
          actBtn.disabled = false;
        }
      } catch (error){
        actBtn.disabled = false;
        return Promise.reject(error);
      }
    },
    async processFirstTab () {
      const $this = this;
      try {
        const isSuccess = $this.$refs.firstTabForm.validate();
        if(!isSuccess){
          return Promise.reject(false);
        }

        /* This will save initial user details and generate formId */
        const params = {
            name: $this.model.username, 
            email: $this.model.email.toLowerCase(), 
            phonenumber: $this.model.phonenumber, 
            zipcode: $this.model.zipcode,
            frommobile: this.$isMobile(),
            treatmentGoal: $this.model.treatmentGoal,
            treatmentStart: $this.model.treatmentStart,
            dentistInMind: $this.model.dentistInMind,
            dentistName: $this.model.dentistName,
            dentistCity: $this.model.dentistCity,
            dentistState: $this.model.dentistState,
            dentistChoiceHelp: $this.model.dentistChoiceHelp,
        }
        
        $this.isInProgress = true;
        // axios.defaults.baseURL = "https://d24e4p0y2o78hs.cloudfront.net";
        const resp = await axios.post("/api/form", params);
        console.info('formId=',resp.data.formId);
        $this.generatedFormId = resp.data.formId;
        $this.isInProgress = false;
        return Promise.resolve(true);
      } catch (error){
        $this.isInProgress = false;
        return Promise.reject(error);
      }
    },
    async processUploadFirst() {
      const $this = this;
      $this.isInProgress = true;
      // this.pendingDropzoneUploads = this.allDropzoneId.filter((word) => !this.childDropzoneid.includes(word));
      $this.$refs.fileUploadFirst.$children.forEach((element) => {
        if (!element.$el.children[0].className.includes("dz-started")) {
          element.$el.style.border = "1px solid red";
        }
      });

      // console.log('len1=',$this.imgUploadFirstData.length);
      if ($this.imgUploadFirstData.length < $this.firstTabImgLength) {
        $this.scrollToTop();
        $this.isInProgress = false;
        return Promise.reject("Please upload pictures.");
      }
      try {
        const imageData = $this.imgUploadFirstData;
        const formId = $this.generatedFormId;
        const cloudfrontUrls = await $this.initImageUpload(imageData, formId);
        // console.log("cloudfrontUrls: ", cloudfrontUrls);
        $this.cloudfrontUrls = $this.cloudfrontUrls.concat(cloudfrontUrls);
        $this.isInProgress = false;
        return Promise.resolve(true);
      } catch (error) {
        $this.isInProgress = false;
        return Promise.reject(error);
      }
    },
    async processUploadSecond () {
      const $this = this;
      $this.isInProgress = true;
      $this.$refs.fileUploadSecond.$children.forEach((element) => {
        if (!element.$el.children[0].className.includes("dz-started")) {
          element.$el.style.border = "1px solid red";
        }
      });
      // console.log('len2=',$this.imgUploadSecondData.length);
      if ($this.imgUploadSecondData.length < $this.secTabImgLength) {
        $this.scrollToTop();
        $this.isInProgress = false;
        return Promise.reject("Please upload pictures");
      }

      try {
        const imageData = $this.imgUploadSecondData;
        const formId = $this.generatedFormId;
        const cloudfrontUrls = await $this.initImageUpload(imageData, formId);
        // console.log("cloudfrontUrls: ", cloudfrontUrls);
        $this.cloudfrontUrls = $this.cloudfrontUrls.concat(cloudfrontUrls);
        $this.isInProgress = false;
        return Promise.resolve(true);
      } catch (error) {
        $this.isInProgress = false;
        return Promise.reject(error);
      }
    },
    async processUploadThird () {
      const $this = this;
      $this.isInProgress = true;
      $this.$refs.fileUploadThird.$children.forEach((element) => {
        if (!element.$el.children[0].className.includes("dz-started")) {
          element.$el.style.border = "1px solid red";
        }
      });
      //console.log('len3=',$this.imgUploadThirdData.length);
      if ($this.imgUploadThirdData.length < $this.thirdTabImgLength) {
        $this.scrollToTop();
        $this.isInProgress = false;
        return Promise.reject("Please upload pictures");
      }

      try {
        const imageData = $this.imgUploadThirdData;
        const formId = $this.generatedFormId;
        const cloudfrontUrls = await $this.initImageUpload(imageData, formId);
        //console.log("cloudfrontUrls: ", cloudfrontUrls);
        $this.cloudfrontUrls = $this.cloudfrontUrls.concat(cloudfrontUrls);
        $this.isInProgress = false;
        return Promise.resolve(true);
      } catch (error) {
        $this.isInProgress = false;
        return Promise.reject(error);
      }
    },
    async updateFormDetails() {
      const $this = this;
      try {
          const formId = $this.generatedFormId;
          const cloudfrontUrls = $this.cloudfrontUrls;
          const response = await axios.post(`/api/form/${formId}/upload`, { images: cloudfrontUrls })
          /* Send Email to 6MS Admin and to User */
          const params = {
            name: $this.model.username, 
            email: $this.model.email.toLowerCase(),
            phonenumber: $this.model.phonenumber,
            zipcode: $this.model.zipcode,
            formId: formId
          }
          await axios.post('/api/form/sendemail', params);
          return Promise.resolve(response);
      } catch (error) {
          $this.formSubmissionError = "Error processing your request. Please contact us Or "
          return Promise.reject(error);
      }      
    },
    async onComplete () {
      // console.log("Form Complete called.");
      try {
        await this.processUploadThird();
        this.loadingWizard = true;
        const response = await this.updateFormDetails();
        this.isAssessmentCompleted = true;
        this.loadingWizard = false;
        return Promise.resolve(true);
      } catch (error) {
        this.loadingWizard = false;
        this.handleErrorMessage(error);
        return Promise.reject(error);
      }
    },
    async showImageData(imgDetails) {
      try {
          this.isInProgress = true;
          const currentImgTab = await this.getActiveUploadTab();
          const curImgTab = currentImgTab.imgTab;
          const curImgTabData = currentImgTab.imgTabData;
          curImgTabData.push(imgDetails);
          /* Check if all image of current step is still in progress */
          if( (curImgTab == 1 && curImgTabData.length < this.firstTabImgLength) 
          || (curImgTab == 2 && curImgTabData.length < this.secTabImgLength) 
          || (curImgTab == 3 && curImgTabData.length < this.thirdTabImgLength) ) {
            this.isDisabled = true;
          } else {
            this.isDisabled = false;
          }
          this.isInProgress = false;
      } catch (error) {
        console.error('showImageData', error);
      }
    },
    async remImageData(removefile) {
      try {
        const currentImgTab = await this.getActiveUploadTab();
        const curImgTabData = currentImgTab.imgTabData;
        curImgTabData.splice(curImgTabData.indexOf(removefile.dataURL), 1);
      } catch (error) {
        console.error("remImageData: ", error)
      }
    },
    async checkIsUploadInProgress(fileStatus) {
      if(fileStatus) {
        this.isInProgress = true;
      } else {
        this.isInProgress = false;
      }
    },
    async getActiveUploadTab () {
      if(this.$refs.fileUploadFirst.active == true ) {
        return {'imgTab' : 1, 'imgTabData' : this.imgUploadFirstData};
      } else if (this.$refs.fileUploadSecond.active == true) {
        return {'imgTab' : 2, 'imgTabData' : this.imgUploadSecondData};
      } else if (this.$refs.fileUploadThird.active == true) {
        return {'imgTab' : 3, 'imgTabData' : this.imgUploadThirdData};
      }
    },
  },
  created: function () {
    const $this = this;
    bus.$on('isValidPhoneNumber', (data) => {
      $this.isValidPhoneNumInputted = data;
    })
  },
  watch: {
    commError(val) {
      if (val){
        setTimeout(()=>this.commError="", 5000);
      }
    },
    successMsg(val) {
      if (val){
        setTimeout(()=>this.successMsg="", 10000);
      }
    },
    isValidPhoneNumInputted() {
      const currentTabIndex = this.currentTabIndex
      if( currentTabIndex == 0 ) {
        this.$refs.phoneTabSchema.validate();
      } 
      if( currentTabIndex == 1 ) {
        this.$refs.firstTabForm.validate();
      }
    },
    isInProgress(isActive) {
      if(isActive) {
        this.showLoader(true);
      } else {
        this.showLoader(false);
      }
    }
  },
};
</script>
