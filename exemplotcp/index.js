var net = require('net')
var fs = require('fs')

net.createServer(function(sock){
  console.log('CONNECTED: ' + sock.remoteAddress + ":" + sock.remotePort);
  var cliente = sock.remoteAddress + ":" + sock.remotePort;


  var readStream = fs.createReadStream('./anthrax.mp3');
  readStream.pipe(sock);
    // fs.readFile('./anthrax.mp3',function(err,data){
    //   if(err)
    //     console.log("ERROR: " + err.message);
    //   sock.write(data);
    // })

  sock.on('data',function(data){
    console.log("[DATA] " + cliente + "> " + data);
  });

  sock.on('error',function(data){
    console.log("[ERROR] " + data);
  });

  sock.on('close',function(data){
    console.log("Adios: "  + sock.remoteAddress + ":" + sock.remotePort);
  });

}).listen(9999);
