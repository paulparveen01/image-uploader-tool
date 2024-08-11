# Image Assesment

## Project setup and Installing dependencies
```
gh repo clone anjan6ms/ImageAssessmentForm

npm install
```

### Compiles and it will ready to run locally
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
Build is now ready in dist folder. To deploy, just copy all dist folder files and upload on S3 face-detection.com bucket

### API
```
- To Upload image to S3
AWS S3 SDK
- To store data into DynamoDB
POST https://d24e4p0y2o78hs.cloudfront.net/api/form
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
