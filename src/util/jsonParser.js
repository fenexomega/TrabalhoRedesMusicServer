
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


exports.parseAlbum = parseAlbum;
