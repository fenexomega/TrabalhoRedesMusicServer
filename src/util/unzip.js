var AdmZip = require('adm-zip');
var dbConnect = require('../db/connect.js');
var fs =  require('fs')
var Settings = require('../settings.js')
var mkdirp = require('mkdirp')
var mpath =  require('path')
var id3 = require('id3js');


var contentFolder = Settings.contentFolder;
var songsFolder = contentFolder + 'songs/';

function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function copyFile(orig,dest)
{
  fs.createReadStream(orig).pipe(fs.createWriteStream(dest));
}

function inserirMusicaNoBanco(order,albumId,pathMusica)
{
  var songDAO = dbConnect.generateDAO()[0];
  id3({ file:pathMusica, type: id3.OPEN_LOCAL},function(err,tags)
  {
    dbConnect.sync(function(){
      songDAO.create({
        number: order,
        title: tags.title,
        artist: tags.artist,
        albumId: albumId
      });
    });
    console.log("Música " + tags.title + " adicionada ao álbum");
  });
}

function criarPastaDoAlbumEMoverArquivos(idAlbum,nomePasta,originFolder)
{
  nomePasta += idAlbum;
  mkdirp.sync(nomePasta);
  console.log("Copiando Arquivos");

  fs.readdir(originFolder,function (err, files){
    for (var i = 1; i <= files.length; ++i)
    {
      var originalFile = originFolder + mpath.sep + files[i-1];
      var newFile       = nomePasta + mpath.sep + i + '.mp3';
      var splitArray = originalFile.split('.');
      var fileFormat = splitArray[splitArray.length - 1];
      if(fileFormat === "mp3")
      {
        copyFile(originalFile,newFile);
        inserirMusicaNoBanco(i,idAlbum,originalFile);
      }
      else
        copyFile(originalFile,nomePasta + mpath.sep + files[i-1]);
    }
    console.log("Arquivos copiados!");
  });
}

exports.descompressZip = function (zipFile,path,callback)
{
  var zip = new AdmZip(zipFile);
  if(path == undefined || typeof path === "function")
  {
    callback = path;
    path = fs.mkdtempSync('/tmp' + mpath.sep);

  }

  console.log("Extraindo conteúdo para " + path);
  zip.extractAllTo(path, false);
  var data = fs.readFileSync(path + "/album.json", "utf8");
  var json = JSON.parse(data);

  var AlbumDAO = dbConnect.generateDAO()[1];

  dbConnect.sync(function() {
      AlbumDAO.create({
      title: json.title,
      artist: json.artist,
      year: json.year
    }).then(function(){
      AlbumDAO.findOne({
        order: 'id DESC'
      }).then(function(album){
          criarPastaDoAlbumEMoverArquivos(album.get('id'),songsFolder,path);
      }).then(function(){
        callback();
      });
    });
  });



};
