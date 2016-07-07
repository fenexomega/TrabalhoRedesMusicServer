# TrabalhoRedesServerMusic
------
Esse servidor funciona ouvindo nas seguintes portas: *7331* e *53105*.

## 7331
------
Porta responsável por receber as mensagens do cliente e enviar o streaming das músicas ao cliente.

Essa porta espera por dois comandos:
* **getAlbuns**: retorna um json no formato:
```javascript
{ "albuns": [\* álbuns aqui */]}.
```
O álbum vem no formato de json tal qual:
```javascript
 { "title" : "Titulo do álbum", "artist" : "artista", "year": "1993"}
```

* **Para Requisitar as músicas de um álbum**, envie uma mensagem tal qual:
```
album=? //Onde ? é o id do álbum
```


## 53105
------
Nessa porta, você pode **enviar um arquivo .zip** contendo um novo álbum,
desde que o zip esteja com os arquivos .mp3 na raiz, com um arquivo de capa
chamado **cover.jpg** e um arquivo json chamado **album.json** no formato:

```javascript
{ "title" : "Titulo do álbum", "artist" : "artista", "year": "1993"}
```
