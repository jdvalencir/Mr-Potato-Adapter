import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'API de Mascotas',
        description: 'Documentación de la API para la gestión de mascotas',
    },
    host: '0.0.0.0:3000',
    schemes: ['http'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['../index.js']; // Cambia este archivo según el punto de entrada de tu API

swaggerAutogen(outputFile, endpointsFiles).then(() => {
    import('../index.js'); // Importa tu archivo principal de la API aquí
});