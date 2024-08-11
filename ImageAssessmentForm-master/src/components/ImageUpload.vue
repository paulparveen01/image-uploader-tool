<template>
  <div class="secondstep">
    <vue-dropzone
      :id="options.id"
      :ref="'myVueDropzone' + options.id"
      :useCustomSlot="true"
      :options="dropzoneOptions"
      @vdropzone-file-added="fileAdded"
      @vdropzone-thumbnail="thumbnail"
      @vdropzone-removed-file="removeThisFile"
    >
      <div class="dropzone-custom-content">
        <!-- <div class='more'>+<img class="face-overlay" v-if="isDisplayOverlay" src="https://us.smilemate.com/webjars/website-client/assets/images/face-overlay.svg"></div> -->
        <div class="more">+</div>
        <!-- <h3 class="dropzone-custom-title">Drag and drop Image!</h3>
        <div class="subtitle">
          upload your photo
        </div> -->
        <!-- <img src="removebutton.png" alt="Click me to remove the file." data-dz-remove /> -->
      </div>
    </vue-dropzone>
    <div>
      <label>Does your photo look like the example? If not retake the photo</label>
    </div>
  </div>
</template>

<script>
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import imageCompression from 'browser-image-compression';

export default {
  name: "ImageUpload",
  props: {
       options: Object
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      errorMsg: null,
      dropzoneOptions: {
        url: "https://httpbin.org/post",
        maxFilesize: 100, // MB
        maxThumbnailFilesize: 100,
        acceptedFiles: ".jpg,.jpeg,.png,.gif",
        paramName: function (n) {
          return "file[]";
        },
        includeStyling: true,
        thumbnailWidth: 300,
        thumbnailHeight: 300,
        maxFiles: this.options.maxFiles ? this.options.maxFiles : 1,
        addRemoveLinks: true,
        autoProcessQueue: false,
        dictRemoveFile: "<i class='fa fa-trash fa-3x'></i>",
        init: function() {
          this.on("maxfilesexceeded", function(file){
              this.errorMsg = 'No more files please!';
              this.removeFile(file);
          });
          this.on("error", function (file, message) {
              // console.log(message);
              // this.removeFile(file);
          }); 
        }
      },
    };
  },
  components: {
    vueDropzone: vue2Dropzone,
  },
  computed: {

  },
  methods: {
    fileAdded(file) {
      this.$emit("isUploadInProgress", true);
      // Construct your file object to render in the UI
    },
    async thumbnail(file) {
      try {
        const dropzoneId = this.options.id;
        const activeFiles = this.$refs['myVueDropzone' + dropzoneId].getQueuedFiles(); // getAddedFiles getActiveFiles getAcceptedFiles getQueuedFiles
        if(activeFiles[0]) {
          const imgDataUrl = activeFiles[0].dataURL
          this.$refs['myVueDropzone' + dropzoneId].$el.parentElement.style.border = "";
          const options = {
            maxSizeMB: 10,
            maxIteration: 5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            exifOrientation: true
          }
          const compressedFile = await imageCompression(activeFiles[0], options);
          let imageUrl = await imageCompression.getDataUrlFromFile(compressedFile);
          const orientation = await imageCompression.getExifOrientation(compressedFile);
          // console.log('compressedFile: ', imageUrl);
          // console.log('orientation: ', orientation);
          
          if (orientation > -1) {
            imageUrl = await this.applyRotation(imageUrl, orientation, 1920);
            // console.log("rotatedImage: ", imageUrl);
          }
          const base64ImageBuffer = Buffer.from(imageUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64');
          const imageDetails = {
            buffer_data: base64ImageBuffer,
            content_type: imageUrl.split(';')[0].split('/')[1]
          }
          this.$emit("getImageData", imageDetails); // it will read by parent compnent
          this.$emit("isUploadInProgress", false);
        }
      } catch (error) {
        console.error("error: ", error);
      }
    },
    removeThisFile: function (thisFile) {
        if(thisFile.status != "error") {
          console.log("remove file called");
          this.$emit("removeImageData", thisFile);
        }
    },
    async applyRotation(file, orientation, maxWidth){
      return new Promise(resolve => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          let { width, height } = image;
          const [outputWidth, outputHeight] = orientation >= 5 && orientation <= 8 ? [height, width] : [width, height];
          const scale = outputWidth > maxWidth ? maxWidth / outputWidth : 1;
          width = width * scale;
          height = height * scale;

          // set proper canvas dimensions before transform & export
          canvas.width = outputWidth * scale;
          canvas.height = outputHeight * scale;

          // transform context before drawing image
          switch (orientation) {
            case 2: context.transform(-1, 0, 0, 1, width, 0); break;
            case 3: context.transform(-1, 0, 0, -1, width, height); break;
            case 4: context.transform(1, 0, 0, -1, 0, height); break;
            case 5: context.transform(0, 1, 1, 0, 0, 0); break;
            case 6: context.transform(0, 1, -1, 0, height, 0); break;
            case 7: context.transform(0, -1, -1, 0, height, width); break;
            case 8: context.transform(0, -1, 1, 0, 0, width); break;
            default: break;
          }
                
          // draw image
          context.drawImage(image, 0, 0, width, height);

          // export base64
          resolve(canvas.toDataURL("image/jpeg"));
        };

        image.src = file;
      });
    }
  },
};
</script>

<style>
.dropzone-custom-content {
  text-align: center;
}
.dropzone-custom-title {
  margin-top: 0;
  color: #00b782;
}
.subtitle {
  color: #314b5f;
}
.dropzone.dz-clickable * {
  cursor: pointer;
}
.fa-trash {
  color: green;
}
.vue-dropzone > .dz-preview .dz-remove {
  border: 2px green solid;
  opacity: 1;
}
/* on hover image background color */
.vue-dropzone > .dz-preview .dz-details {
  background-color: rgb(255 255 255 / 0%);
  opacity: 1;
}
/* do not show blur image on hover */
.dropzone .dz-preview:hover .dz-image img {
  filter: none;
}
.dz-details .dz-filename {
  display: none;
}
</style>