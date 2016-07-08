var net         = require('net')
var fs          = require('fs')
var http        = require('http')
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


function parsePathString(string)
{
  var r1 = string;
  var request = {};
  var params  = r1[1].split("?")[1].split("&");
  for (param of params)
  {
    var key   = param.split("=")[0];
    var value = param.split("=")[1];
    request[key] = value;
  }
  request['method'] = method;
  return request;
}

function parseDataAndDoOperation(data,socket)
{
  data = data.toString().replace('\n','');
  if(data == "getAlbuns")
  {
    console.log("Enviando lista de Albuns");
    var response = {};
    response.albuns = albumList;
    socket.write(JSON.stringify(response));
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
    fs.mkdir(Settings.contentFolder,function(err){
        console.log("[ERRO] Erro ao criar pasta " + Settings.contentFolder + " : " + err);
    });

    sock.on('end', function() {
      console.log('Descomprimindo zip recebido');
      unzip.descompressZip(zipFile);
      initAlbumList();
    });

    writeStream.on('error',function (error) {
      console.log("[ERRO]: " + error);
    });
    sock.pipe(writeStream);



}).listen(53105);
