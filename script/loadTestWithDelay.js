const http = require('http');

const TOTAL_REQUESTS = 100;
const REQUESTS_BEFORE_DELAY = 5;
const INACTIVITY_DELAY = 6000; // 3 segundos, más que el keepAliveTimeout

function makeRequest(index) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const options = {
      hostname: 'localhost',
      port: 3000,
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
      if (i === REQUESTS_BEFORE_DELAY) {
        console.log(`\nEsperando ${INACTIVITY_DELAY}ms para permitir que expire el keepAliveTimeout...\n`);
        await new Promise(resolve => setTimeout(resolve, INACTIVITY_DELAY));
      }

      const result = await makeRequest(i);
      results.push(result);
      console.log(`Solicitud ${i + 1}: Estado ${result.statusCode}, Tiempo ${result.time}ms, Conexión ${result.connection}, Socket reutilizado: ${result.socketReused}`);
    } catch (error) {
      console.error(`Error en solicitud ${error.index + 1}:`, error.error);
    }

    // Pequeña pausa entre solicitudes para simular un escenario más realista
    if (i < TOTAL_REQUESTS - 1 && i !== REQUESTS_BEFORE_DELAY - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\nResumen:');
  const socketReuses = results.filter(r => r.socketReused).length;
  console.log(`Total de solicitudes: ${results.length}`);
  console.log(`Conexiones reutilizadas: ${socketReuses}`);
  console.log(`Porcentaje de reutilización: ${(socketReuses / results.length * 100).toFixed(2)}%`);

  const reuseBeforeDelay = results.slice(0, REQUESTS_BEFORE_DELAY).filter(r => r.socketReused).length;
  const reuseAfterDelay = results.slice(REQUESTS_BEFORE_DELAY).filter(r => r.socketReused).length;
  console.log(`\nReutilizaciones antes del retraso: ${reuseBeforeDelay}/${REQUESTS_BEFORE_DELAY}`);
  console.log(`Reutilizaciones después del retraso: ${reuseAfterDelay}/${TOTAL_REQUESTS - REQUESTS_BEFORE_DELAY}`);
}

runLoadTest();