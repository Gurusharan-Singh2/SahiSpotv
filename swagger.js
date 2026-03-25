
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Sahi Spot API',
    description: 'API Documentation',
  },
  host: `aimock-dbcq.onrender.com`, 
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['src/index.js']; 

swaggerAutogen()(outputFile, endpointsFiles, doc);
