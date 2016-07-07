var net = require('net')
var fs  = require('fs')


const client =  net.createConnection({port:13007},function(){
  var readStream = fs.createReadStream('vusb-for-arduino-005.zip');
  readStream.pipe(client);
  readStream.on('end',function(){
    console.log('is Over');
  })
});
