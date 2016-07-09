var net         = require('net')
var fs          = require('fs')
var http        = require('http')
var mpath       = require('path')
var unzip       = require('./util/unzip.js')
var dbConnect   = require('./db/connect.js')
var Settings    = require('./settings.js')
var jsonParser  = require('./util/jsonParser.js')

var contentFolder = Settings.contentFolder;

var albumList;

initAlbumList();

function initAlbumList()
{
  console.log("Gerando Lista de álbuns");
  var albumDAO = dbConnect.generateDAO()[1];
  dbConnect.sync(function(){
    albumDAO.findAll().then(function(albuns){
      albumList = jsonParser.parseAlbum(albuns);
      console.log("Lista Gerada!");
    });
  });

}

function getSongListFromAlbum(albumid,callback)
{
  console.log("Gerando Lista de músicas do álbum " + albumid);
  var songDAO = dbConnect.generateDAO()[0];
  dbConnect.sync(function(){
    songDAO.findAll({
      where:{
        albumId: albumid
      },
      order:[
        ['number','ASC']
      ]
    }).then(function(songs){
      callback(songs);
    });
  });

}


function parsePathString(string)
{
  var r1 = string;
  var request = {};
  var params  = r1.split("&");
  for (param of params)
  {
    var key   = param.split("=")[0];
    var value = param.split("=")[1];
    request[key] = value;
  }
  return request;
}

function parseDataAndDoOperation(data,socket)
{
  var response = {};
  data = data.toString().replace('\n','');
  if(data == "getAlbuns")
  {
    console.log("Enviando lista de Albuns");
    response.albuns = albumList;
    socket.write(JSON.stringify(response));
    return;
  }
  var request = parsePathString(data);
  console.log(request);
  if(request.album != undefined)
  {
    getSongListFromAlbum(parseInt(request.album),
  function(songs){
    response.songs =  jsonParser.parseSongs(songs);
    socket.write(JSON.stringify(response));
  });
  }

}

net.createServer(function(sock){
  console.log('CONNECTED: ' + sock.remoteAddress + ":" + sock.remotePort);
  var cliente = sock.remoteAddress + ":" + sock.remotePort;

  sock.on('data',function(data){
    console.log("[DATA] " + cliente + "> " + data);
    parseDataAndDoOperation(data,sock);
  });

  sock.on('error',function(data){
    console.log("[ERROR] " + data);
  });

  sock.on('close',function(data){
    console.log("Adios: "  + sock.remoteAddress + ":" + sock.remotePort);
  });

}).listen(7331);

// Porta que recebe o zip: 13007
net.createServer(function(sock){
  console.log("Recebendo arquivo de " + sock.remoteAddress);
    var zipFile = contentFolder + 'tmp.zip';
    var writeStream = fs.createWriteStream(zipFile);
    try{
      fs.mkdirSync(Settings.contentFolder);
    }
    catch(e)
    {
      console.log("[ERRO] " + e);
    }

    sock.on('end', function() {
      console.log('Descomprimindo zip recebido');
      unzip.descompressZip(zipFile,function(){
        initAlbumList();
      });
    });

    writeStream.on('error',function (error) {
      console.log("[ERRO]: " + error);
    });
    sock.pipe(writeStream);
}).listen(53105);

http.createServer(function(request,response){
    var desiredFile = request.url.replace('../','');
    var imagePath    = Settings.contentFolder + 'songs' + mpath.sep + desiredFile;
    var extension = desiredFile.split('.')[1];
    var fileType = '';
    var readStream;

    switch(extension)
    {
      case 'mp3':
        fileType = 'audio/mpeg';
        break;
      case 'jpg':
        fileType =  'image/jpeg';
        break;
      default:
        //Error
        return;
    }
    try{
      var stat = fs.statSync(imagePath);

      response.writeHead(200,{
        'Content-Type': fileType,
        'Content-Length': stat.size
      });

      readStream = fs.createReadStream(imagePath);
      readStream.pipe(response);
    }
    catch(e)
    {
      console.log(e);
      response.writeHead(404);
    }

}).listen(8080);
