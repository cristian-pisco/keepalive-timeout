const http = require('http');

const TOTAL_REQUESTS = 30;
const DELAY_BETWEEN_REQUESTS = 100; // milisegundos

function makeRequest(index) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/',
      method: 'GET',
      headers: {
        'Connection': 'keep-alive'
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          index,
          statusCode: res.statusCode,
          time: endTime - startTime,
          connection: res.headers['connection'],
          socketReused: req.reusedSocket
        });
      });
    });

    req.on('error', (error) => {
      reject({ index, error: error.message });
    });

    req.end();
  });
}

async function runLoadTest() {
  console.log(`Iniciando prueba de carga con ${TOTAL_REQUESTS} solicitudes...`);

  const results = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    try {
      const result = await makeRequest(i);
      results.push(result);
      console.log(`Solicitud ${i + 1}: Estado ${result.statusCode}, Tiempo ${result.time}ms, Conexión ${result.connection}, Socket reutilizado: ${result.socketReused}`);
    } catch (error) {
      console.error(`Error en solicitud ${error.index + 1}:`, error.error);
    }

    if (i < TOTAL_REQUESTS - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }

  console.log('\nResumen:');
  const socketReuses = results.filter(r => r.socketReused).length;
  console.log(`Total de solicitudes: ${results.length}`);
  console.log(`Conexiones reutilizadas: ${socketReuses}`);
  console.log(`Porcentaje de reutilización: ${(socketReuses / results.length * 100).toFixed(2)}%`);
}

runLoadTest();