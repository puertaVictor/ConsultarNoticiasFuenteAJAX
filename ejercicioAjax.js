/**
 * Clase Noticia
 */

class Noticia {
  constructor(titulo, link, descripcion, categorias, imagen) {
    this.titulo = titulo;
    this.link = link;
    this.descripcion = descripcion;
    this.categorias = categorias;
    this.imagen = imagen;
  }
}

/**
 * Captura URLs
 */
let url1 = "./portadaPais.xml";
let url2 = "./espana.xml";

// let url1 = "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada";
// let url2 = "https://e00-elmundo.uecdn.es/elmundo/rss/espana.xml";

let datos = [];
let index = 0;

/**
 * Función autoejecutable para realizar la petición AJAX, si todo va bien, obtenemos ambos arrays de noticias y los enviamos a la función cargarError
 * Tenemos un evento para verificar si existe un error y tratarlo con php
 */
peticionAjax(url1, url2);

function peticionAjax(u1, u2) {
  const ajax1 = new XMLHttpRequest();
  const ajax2 = new XMLHttpRequest();

  ajax1.addEventListener("readystatechange", function () {
    if (ajax1.readyState === 4 && ajax1.status === 200) {
      const parse = new DOMParser();
      const doc1 = parse.parseFromString(ajax1.responseText, "text/xml");
      const e = doc1.getElementsByTagName("item");

      ajax2.addEventListener("readystatechange", function () {
        if (ajax2.readyState === 4 && ajax2.status === 200) {
          const doc2 = parse.parseFromString(ajax2.responseText, "text/xml");
          const a = doc2.getElementsByTagName("item");
          cargarArray(e, a);
        }
      });

      ajax2.open("GET", u2);
      ajax2.send();
    }
  });

  ajax1.open("GET", u1);
  ajax1.send();
}

/**
 *
 * @param {*} url
 * Función para tratar el error
 */
function tratarError(url) {
  let php = `./error.php?url=${url}`;
  peticionAjax(php);
}

/**
 *
 * @param {*} arrayFuenteNoticias1 --> Coleccion de los diferentes Items de una fuente de noticias
 * @param {*} arrayFuenteNoticias2 -- Coleccion de los diferentes Items de otra fuente de noticias
 * Creamos un array datos, que es donde guardaremos los datos que queramos coger de las diferentes noticias,
 * Creamos un array Conjunto para juntar las dos colecciones de noticias
 * Con Array.from convertimos la coleccion a un array y obtenemos los campos que deseamos en el array datos
 */
function cargarArray(arrayFuenteNoticias1, arrayFuenteNoticias2) {
  let arrayConjunto = [...arrayFuenteNoticias1, ...arrayFuenteNoticias2];
  arrayConjunto.forEach((buscar) => {
    let titulo = buscar.getElementsByTagName("title")[0].textContent;
    let link = buscar.getElementsByTagName("link")[0].textContent;
    let descripcion = buscar.getElementsByTagName("description")[0].textContent;
    const categories = buscar.getElementsByTagName("category");
    if (categories.length > 0) {
      categorias = categories[0].textContent;
    } else {
    }
    let imagen = null;
    const media = buscar.getElementsByTagName("media:content")[0];
    if (media) {
      imagen = media.getAttribute("url");
    }
    let noticia = new Noticia(titulo, link, descripcion, categorias, imagen);
    datos.push(noticia);
  });
  ObtenerCategorias(datos);
}

/**
 *
 * @param {*} datos --> Array
 * Creamos un array categoria, aqui guardaremos las categorias sin repetir
 * Recorremos el array recibido para coger solamente las categorias, a continuación hacemos un set para quitar las repetidas
 * Pasamos este nuevo array a la funcion crearRadios
 */
function ObtenerCategorias(datos) {
  let categoria = [];
  datos.forEach((element) => {
    categoria.push(element.categorias);
  });
  categoria = [...new Set(categoria)].sort();
  crearRadios(categoria);
}

/**
 *
 * @param {*} categoria array de categorias sin repetir
 * Pegamos en el divRadios los label con el titulo y los radios creados
 */
function crearRadios(categoria) {
  let divRadios = document.getElementById("radios");
  let fragmento = document.createDocumentFragment();
  categoria.forEach((element) => {
    let radioCreado = crearEtiquetaRadio(element);
    fragmento.append(radioCreado);
  });
  divRadios.append(fragmento);
  divRadios.addEventListener("click", obtenerClik);
}

/**
 *
 * @param {*} contenido -> Texto de la etiqueta categoria
 * Importante poner .name para que se seleccione un radio y no se puedan seleccionar varios!!!
 * @returns Un label con la categoria junto a su radio
 */
function crearEtiquetaRadio(contenido) {
  let label = document.createElement("label");
  let input = document.createElement("input");
  input.type = "radio";
  input.id = contenido;
  input.name = radios;
  label.textContent = contenido;
  label.appendChild(input);
  return label;
}

/**
 *
 * @param {*} e
 * Obtenmos el id del radio seleccionado, que es el nombre de la categoria
 */
function obtenerClik(e) {
  let radioSeleccionado = e.target;
  cargarNoticias(radioSeleccionado.id);
}

/**
 *
 * @param {*} noticia --> Valor del radio seleccionado por el usuario
 * Primero limpiamos las noticias que tenga el div con la función borrarContenido
 * Capturamos todos los divs,
 * Recorremos el array de noticias, buscando la categoria con la noticia seleccionada,
 * LLamamos a la función crearElemento a la cual le pasamos el titulo, link e imagen.
 * Comprobamos si el indice es par o impar dependiendo de cual sea el indice (declarado al principio del programa) metemos la etiqueta en un div o en otro
 * Aumentamos el index.
 * Por último pegamos las columnas en el div noticia.
 */

function cargarNoticias(noticia) {
  borrarContenidoDIV();
  let divNoticias = document.getElementById("noticias");
  let columna1 = document.getElementById("columna1");
  let columna2 = document.getElementById("columna2");
  datos.forEach((e) => {
    if (e.categorias === noticia) {
      let etiqueta = crearElemento(e.titulo, e.link, e.imagen, e.descripcion);

      if (index % 2 === 0) {
        columna1.appendChild(etiqueta);
        index++;
      } else {
        columna2.appendChild(etiqueta);
        index++;
      }
    }
  });
  divNoticias.append(columna1, columna2);
}

/**
 * 
 * @param {*} descripcion Texto de la descripcion de cada noticia
 * Capturamos el div del modalm le pegamos el texto, por ultimo le agregamos la clase show que hace que este visible, con el display block del css
 */
function mostrarDescripcion(descripcion) {
  let modal = document.getElementById("modal");
  let descripcionModal = document.getElementById("descripcion");
  descripcionModal.textContent = descripcion;
  modal.classList.add("show");
}

/**
 * Le quitamos la case show, para volver a ocultar el modal
 */
function ocultarDescripcion() {
  let modal = document.getElementById("modal");
  modal.classList.remove("show");
}

/**
 *
 * @param {*} titulo
 * @param {*} link
 * @param {*} imagen
 * @returns Etiqueta creada
 * Le damos a la img los eventos del raton, para saber si el raton esta sobre la img o no.
 */
function crearElemento(titulo, link, imagen,descripcion) {
  let etiqueta = document.createElement("article");
  let title = document.createElement("h2");
  let enlace = document.createElement("a");
  let img = document.createElement("img");
  title.textContent = titulo;
  enlace.href = link;
  enlace.textContent = link;
  img.src = imagen;

  img.addEventListener("mouseover", function () {
    mostrarDescripcion(descripcion);
  });
  img.addEventListener("mouseout", function () {
    ocultarDescripcion(descripcion);
  });

  etiqueta.appendChild(title);
  etiqueta.appendChild(crearBR());
  etiqueta.appendChild(enlace);
  etiqueta.appendChild(crearBR());
  etiqueta.appendChild(img);
  etiqueta.appendChild(crearBR());
  return etiqueta;
}

/**
 *
 * @returns Un salto de linea
 */
function crearBR() {
  let br = document.createElement("br");
  return br;
}

/**
 * Función para remover el primer hijo de cada div, hasta vaciarlo.
 */

function borrarContenidoDIV() {
  let columna1 = document.getElementById("columna1");
  let columna2 = document.getElementById("columna2");
  index = 0;
  while (columna1.firstChild) {
    columna1.firstChild.remove();
  }
  while (columna2.firstChild) {
    columna2.firstChild.remove();
  }
}
