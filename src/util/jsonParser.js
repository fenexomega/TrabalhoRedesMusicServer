
function parseAlbum(albumData)
{
  var list = [];
  for(album of albumData)
  {
    var json = {};
    json.id     = album.get('id');
    json.title  = album.get('title');
    json.artist = album.get('artist');
    json.year   = album.get('yeat');
    list.push(json);
  }
  return list;
}

function parseSongs(songData)
{
  var list = [];
  for(song of songData)
  {
    var json = {};
    json.id     = song.get('id');
    json.title  = song.get('title');
    json.artist = song.get('artist');
    json.number = song.get('number');
    list.push(json);
  }
  return list;
}


exports.parseAlbum = parseAlbum;
exports.parseSongs = parseSongs;
