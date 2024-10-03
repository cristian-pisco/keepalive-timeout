const http = require('http');

// Configuración del endpoint y opciones
const REQUESTS_COUNT = 2000; // Número de peticiones concurrentes
const CONCURRENCY_LIMIT = 1000; // Número de peticiones al mismo tiempo

// Función para hacer una solicitud HTTP GET
async function makeRequest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost', // Cambia a la IP/host correspondiente si es necesario
      port: 8080,
      path: '/',
      method: 'GET',
      headers: {
        'Connection': 'keep-alive'
      }
    };

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let data = '';

      // Acumular los datos de la respuesta
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Cuando la respuesta esté completa
      res.on('end', () => {
        console.log(`Respuesta recibida: ${res.statusCode}`);
        resolve();
      });
    });

    // Manejo de errores
    req.on('error', (e) => {
      console.log(`Error HTTP: ${e.message}`);
      reject(e);
    });

    // Timeout de la petición
    req.on('timeout', () => {
      console.log('Error: Timeout de la petición alcanzado');
      req.abort();
      reject(new Error('Request timed out'));
    });

    // Terminar la solicitud
    req.end();
  });
}

// Función para ejecutar las solicitudes en paralelo con un límite de concurrencia
async function runLoadTest() {
  const requests = [];
  
  for (let i = 0; i < REQUESTS_COUNT; i++) {
    if (i % CONCURRENCY_LIMIT === 0) {
      await Promise.all(requests); // Espera hasta que las solicitudes actuales finalicen
      requests.length = 0; // Limpia el array
    }
    requests.push(makeRequest());
  }

  await Promise.all(requests); // Espera a que las últimas solicitudes terminen
}

console.log(`Iniciando prueba de carga con ${REQUESTS_COUNT} solicitudes...`);
runLoadTest()
  .then(() => console.log('Prueba de carga completada'))
  .catch(error => console.error(`Error en la prueba de carga: ${error.message}`));
