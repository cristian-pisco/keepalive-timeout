const http = require("http");
const net = require("net");

const server = http.createServer((req, res) => {
  req.resume();
  res.end("hello");
});

server.keepAliveTimeout = 6 * 1000;
server.headersTimeout = 4 * 1000;

server.listen(0, () => {
  const { address, port } = server.address();
  console.log("Listening on %s:%d", address, port);

  startClient(port);
});

function startClient(port) {
  const socket = net.createConnection({ port });
  let responseCount = 0;
  socket.on("data", (chunk) => {
    console.log("client data:", chunk.toString("utf8").split("\r\n")[0]);
    responseCount += 1;
    if (responseCount === 2) {
      console.log("client done");
      process.exit(0);
    }
  });
  socket.on("error", (err) => {
    console.log("client error:", err);
    process.exit(1);
  });

  socket.write("GET / HTTP/1.1\r\n");
  socket.write("Host: localhost\r\n");
  socket.write("Connection: keep-alive\r\n");
  socket.write("Agent: node\r\n");
  socket.write("\r\n");

  setTimeout(() => {
    socket.write("GET / HTTP/1.1\r\n");
    socket.write("Host: localhost\r\n");
    socket.write("Connection: keep-alive\r\n");
    socket.write("Agent: node\r\n");
    // `headersTimeout` doesn't seem to fire if request headers
    // are sent in one packet.
    setTimeout(() => {
      socket.write("\r\n");
    }, 10);
  }, 5000);
}