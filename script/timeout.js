const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Probando ruta normal...');
  try {
    const result = await makeRequest('/fast');
    console.log('Respuesta:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\nProbando ruta lenta...');
  try {
    const result = await makeRequest('/');
    console.log('Respuesta:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runTests();
