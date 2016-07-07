var http = require('http'),
    fileSystem = require('fs'),
    path = require('path')
    util = require('util')
    id3 = require('id3js');


    http.createServer(function(request, response) {
        var filePath = './anthrax.mp3';
        var stat = fileSystem.statSync(filePath);

        response.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });

        var readStream = fileSystem.createReadStream(filePath);

        // We replaced all the event handlers with a simple call to util.pump()
        readStream.pipe(response);
        console.log("ouvindo servidor na porta 2000");
        id3({ file:filePath, type: id3.OPEN_LOCAL},function(err,tags){
          console.log(tags.title + " - " + tags.artist + " - " + tags.album);
      });
    })
    .listen(2000);
