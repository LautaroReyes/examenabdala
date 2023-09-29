const http = require('http')
const fs = require('fs')

const mime = {
  'html': 'text/html',
  'css': 'text/css',
  'jpg': 'image/jpg',
  'ico': 'image/x-icon',
  'mp3': 'audio/mpeg3',
  'mp4': 'video/mp4'
}

const servidor = http.createServer((pedido, respuesta) => {
  const url = new URL('http://localhost:8888' + pedido.url)
  let camino = 'public' + url.pathname
  if (camino == 'public/')
    camino = 'public/index.html'
  encaminar(pedido, respuesta, camino)
})

servidor.listen(8888)

function encaminar(pedido, respuesta, camino) {
  console.log(camino)
  switch (camino) {
    case 'public/datos': {
      recuperar(pedido, respuesta)
      break
    }
    default: {
      fs.stat(camino, error => {
        if (!error) {
          fs.readFile(camino, (error, contenido) => {
            if (error) {
              respuesta.writeHead(500, { 'Content-Type': 'text/plain' })
              respuesta.write('Error interno')
              respuesta.end()
            } else {
              const vec = camino.split('.')
              const extension = vec[vec.length - 1]
              const mimearchivo = mime[extension]
              respuesta.writeHead(200, { 'Content-Type': mimearchivo })
              respuesta.write(contenido)
              respuesta.end()
            }
          })
        } else {
          respuesta.writeHead(404, { 'Content-Type': 'text/html' })
          respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>')
          respuesta.end()
        }
      })
    }
  }
}
function recuperar(pedido, respuesta) {
  let info = ''
  pedido.on('data', datosparciales => {
    info += datosparciales;
  })
  pedido.on('end', () => {
    const formulario = new URLSearchParams(info)
    console.log(formulario);
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })

    let frase = formulario.get('opc');
    console.log(frase);

    function traducir(frase) {
      const vocales = ['a', 'e', 'i', 'o', 'u'];
      let resultado = '';

      for (let i = 0; i < frase.length; i++) {
        resultado += frase[i];
        if (vocales.includes(frase[i])) {
          resultado += 'p' + frase[i];
        }
      }
      return resultado;
    }

    let fraseTraducida = traducir(frase);
    console.log(fraseTraducida);

    let pagina = `Frase traducida:${fraseTraducida}<br>`;
    pagina += `<a href="index.html">Intentar nuevamente</a>
  </body></html>`;
    respuesta.end(pagina);
  })
}

console.log('Servidor web iniciado');