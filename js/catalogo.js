// Funciones de navegación y desplazamiento de productos
function moverScroll(id, direccion) {
    const categoriaProductos = document.getElementById(id);
    if (categoriaProductos && categoriaProductos.children.length > 0) {
        const productoWidth = categoriaProductos.scrollWidth / categoriaProductos.childElementCount;
        categoriaProductos.scrollBy({ left: productoWidth * direccion, behavior: 'smooth' });
    }
}

function moverIzquierda(id) {
    moverScroll(id, -1);
}

function moverDerecha(id) {
    moverScroll(id, 1);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Intentando cargar productos...");
    cargarCarrito(); 
    cargarProductos();
    actualizarContadorCarrito();
});


document.addEventListener("click", (event) => {
    if (event.target.classList.contains("toggle-descripcion")) {
        const descripcion = event.target.closest(".producto__descripcion");
        if (descripcion) {
            if (descripcion.classList.contains("corta")) {
                descripcion.classList.remove("corta");
                event.target.textContent = " Ver menos";
                descripcion.querySelector(".texto-descripcion").textContent = descripcion.getAttribute("data-larga");
            } else {
                descripcion.classList.add("corta");
                event.target.textContent = " Ver más";
                descripcion.querySelector(".texto-descripcion").textContent = descripcion.getAttribute("data-corta");
            }
        }
        event.stopPropagation();
    } 
    
    else if (event.target.classList.contains("agregar-carrito")) {
        event.preventDefault();
        const productoId = event.target.getAttribute("data-id");
        agregarAlCarrito(productoId);
    }
    
    else if (!event.target.closest(".producto__descripcion")) {
        cerrarDescripciones();
    }
});


document.getElementById("filtro-categoria").addEventListener("change", () => {
    filtrarProductos();
    reiniciarScroll();
});

document.getElementById("filtro-precio").addEventListener("change", () => {
    filtrarProductos();
    reiniciarScroll();
});

document.getElementById("buscador").addEventListener("input", filtrarProductos);

function reiniciarScroll() {
    document.getElementById("productos1").scrollLeft = 0;
    document.getElementById("productos2").scrollLeft = 0;
    document.getElementById("productos3").scrollLeft = 0;
    document.getElementById("productos4").scrollLeft = 0;
    document.getElementById("productos5").scrollLeft = 0;
    document.getElementById("productos6").scrollLeft = 0;
    document.getElementById("productos7").scrollLeft = 0;
    document.getElementById("productos8").scrollLeft = 0;
}


function cerrarDescripciones() {
    document.querySelectorAll(".producto__descripcion").forEach(descripcion => {
        descripcion.classList.add("corta");
        descripcion.querySelector(".texto-descripcion").textContent = descripcion.getAttribute("data-corta");
    });

    document.querySelectorAll(".toggle-descripcion").forEach(boton => {
        boton.textContent = " Ver más";
    });
}


let productosGlobales = [];


import firebaseConfig from './firebase-config.js';

let firebaseApp = null;
let firestoreDb = null;

function loadFirebase() {
    return new Promise((resolve, reject) => {
        if (window.firebase && window.firebase.apps.length > 0) {
            console.log(" Firebase ya está inicializado");
            firebaseApp = window.firebase.apps[0];
            firestoreDb = window.firebase.firestore();
            resolve({ app: firebaseApp, db: firestoreDb });
            return;
        }

        if (window.firebase) {
            console.log(" Inicializando Firebase con configuración");
            try {
                firebaseApp = window.firebase.initializeApp(firebaseConfig);
                firestoreDb = window.firebase.firestore();
                resolve({ app: firebaseApp, db: firestoreDb });
                return;
            } catch (error) {
                console.error(" Error inicializando Firebase:", error);
                reject(error);
                return;
            }
        }

        const scriptApp = document.createElement('script');
        scriptApp.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';
        scriptApp.onload = () => {
            const scriptFirestore = document.createElement('script');
            scriptFirestore.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js';
            scriptFirestore.onload = () => {
                try {
                    firebaseApp = firebase.initializeApp(firebaseConfig);
                    firestoreDb = firebase.firestore();
                    console.log(" Firebase inicializado correctamente");
                    resolve({ app: firebaseApp, db: firestoreDb });
                } catch (error) {
                    console.error(" Error inicializando Firebase:", error);
                    reject(error);
                }
            };
            scriptFirestore.onerror = (error) => {
                console.error(" Error cargando Firestore:", error);
                reject(error);
            };
            document.head.appendChild(scriptFirestore);
        };
        scriptApp.onerror = (error) => {
            console.error(" Error cargando Firebase App:", error);
            reject(error);
        };
        document.head.appendChild(scriptApp);
    });
}


async function probarConexionFirestore(db) {
    try {
        console.log(" Intentando conectar a Firestore");
        const productosRef = db.collection("productos");
        const querySnapshot = await productosRef.get();
        console.log(" Conexión a Firestore exitosa");
        console.log(` Total de productos encontrados: ${querySnapshot.docs.length}`);
        return querySnapshot.docs.length > 0;
    } catch (error) {
        console.error(" Error conectando a Firestore:", error);
        return false;
    }
}

// Cargar productos
async function cargarProductos() {
    try {
        console.time(" Carga de Productos");
        
        verificarAlmacenamientoLocal();
        
        const productosEnCache = localStorage.getItem('productosCache');
        const ultimaActualizacionCache = localStorage.getItem('productosUltimaActualizacion');
        
        if (productosEnCache) {
            console.log(" Cargando productos desde caché");
            const productosParseados = JSON.parse(productosEnCache);
            
            const productosOrdenados = productosParseados.sort(compararProductos);
            
            productosGlobales = productosOrdenados;
            renderizarProductos(productosOrdenados);
            console.log(" Productos cargados desde caché");
        }
        
        const { db } = await loadFirebase();
        
        const conexionExitosa = await probarConexionFirestore(db);
        
        if (!conexionExitosa) {
            console.error(" No se pudo conectar a Firestore");
            console.timeEnd(" Carga de Productos");
            return;
        }
        
        const productosRef = db.collection("productos");
        const querySnapshot = await productosRef.get();
        
        const productos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const productosOrdenadosFirestore = productos.sort(compararProductos);
        

        localStorage.setItem('productosCache', JSON.stringify(productosOrdenadosFirestore));
        localStorage.setItem('productosUltimaActualizacion', new Date().toISOString());
        

        productosGlobales = productosOrdenadosFirestore;
        
 
        renderizarProductos(productosOrdenadosFirestore);
        
        console.log(" Productos actualizados desde Firestore");
        console.timeEnd(" Carga de Productos");
    } catch (error) {
        console.error(" Error al cargar productos:", error);
        console.timeEnd(" Carga de Productos");
    }
}


function parseProductId(id) {
    const match = id.match(/^C(\d+)-(\d+)([a-z])?$/);
    if (!match) {
        console.warn(`ID no válido: ${id}`);
        return { categoria: 0, numero: 0, subnivel: '' };
    }
    return {
        categoria: parseInt(match[1], 10),
        numero: parseInt(match[2], 10),
        subnivel: match[3] || ''
    };
}


function compararProductos(a, b) {
    const idA = parseProductId(a.id);
    const idB = parseProductId(b.id);


    if (idA.categoria !== idB.categoria) {
        return idA.categoria - idB.categoria;
    }


    if (idA.numero !== idB.numero) {
        return idA.numero - idB.numero;
    }

 
    if (!idA.subnivel) return -1;
    if (!idB.subnivel) return 1;
    
    return idA.subnivel.localeCompare(idB.subnivel);
}

function renderizarProductos(productos) {
    const categorias = [
        { id: "productos1", key: "categoria1" },
        { id: "productos2", key: "categoria2" },
        { id: "productos3", key: "categoria3" },
        { id: "productos4", key: "categoria4" },
        { id: "productos5", key: "categoria5" },
        { id: "productos6", key: "categoria6" },
        { id: "productos7", key: "categoria7" },
        { id: "productos8", key: "categoria8" }
    ];

    let totalProductosVisibles = 0;

    categorias.forEach(({ id, key }) => {
        const contenedor = document.getElementById(id);
        const seccion = document.querySelector(`.${key}`);
        const productosFiltrados = productos.filter(producto => producto.categoria === key);

        contenedor.innerHTML = "";
        productosFiltrados.forEach(producto => {
            const productoHTML = `
                <div class="producto">
                    <div class="producto__imagen-contenedor">
                        <img class="producto__imagen" src="${producto.imagen}" title="${producto.descripcion_corta}" alt="${producto.descripcion_corta}" loading="lazy">
                        <div class="producto__overlay">
                            <div class="producto__icono" onclick="window.open('${producto.enlace}', '_blank')">🔗</div>
                        </div>
                    </div>
                    <div class="producto__info">
                        <p class="producto__precio">${producto.precio}</p>
                        <p class="producto__descripcion corta" data-corta="${producto.descripcion_corta}" data-larga="${producto.descripcion_larga}">
                            <span class="texto-descripcion">${producto.descripcion_corta}</span>
                            <button class="toggle-descripcion"> Ver más</button>
                        </p>
                        <button class="agregar-carrito" data-id="${producto.id}">Agregar al carrito</button>
                    </div>
                </div>
            `;
            contenedor.insertAdjacentHTML('beforeend', productoHTML);
        });

        contenedor.querySelectorAll(".producto__imagen").forEach(img => {
            img.addEventListener("load", () => img.classList.add("loaded"));
        });

        const productosVisibles = productosFiltrados.length;
        totalProductosVisibles += productosVisibles;

        seccion.style.display = productosVisibles > 0 ? "block" : "none";
    });

    const mensajeNoProductos = document.getElementById("mensaje-no-productos");
    mensajeNoProductos.style.display = totalProductosVisibles > 0 ? "none" : "block";
}

// Filtrar productos
function filtrarProductos() {
    const filtroTexto = document.getElementById("buscador").value.toLowerCase();
    const filtroCategoria = document.getElementById("filtro-categoria").value;
    const filtroPrecio = document.getElementById("filtro-precio").value;
    const mensajeNoProductos = document.getElementById("mensaje-no-productos");

    const categorias = [
        { id: "productos1", key: "categoria1" },
        { id: "productos2", key: "categoria2" },
        { id: "productos3", key: "categoria3" },
        { id: "productos4", key: "categoria4" },
        { id: "productos5", key: "categoria5" },
        { id: "productos6", key: "categoria6" },
        { id: "productos7", key: "categoria7" },
        { id: "productos8", key: "categoria8" }
    ];

    let totalProductosVisibles = 0;

    categorias.forEach(({ id, key }) => {
        const contenedor = document.getElementById(id);
        const seccion = document.querySelector(`.${key}`);
        const productos = productosGlobales.filter(producto => producto.categoria === key);

        const productosFiltrados = productos.filter(producto => {
            const descripcion = producto.descripcion_corta.toLowerCase();
            const coincideTexto = descripcion.includes(filtroTexto);
            const coincideCategoria = filtroCategoria === "todas" || producto.categoria === filtroCategoria;
            return coincideTexto && coincideCategoria;
        });

        if (filtroPrecio !== "default") {
            productosFiltrados.sort((a, b) => {
                const precioA = parseFloat(a.precio.replace("$", ""));
                const precioB = parseFloat(b.precio.replace("$", ""));
                return filtroPrecio === "asc" ? precioA - precioB : precioB - precioA;
            });
        }

        contenedor.innerHTML = "";
        productosFiltrados.forEach(producto => {
            const productoHTML = `
                <div class="producto">
                    <div class="producto__imagen-contenedor">
                        <img class="producto__imagen" src="${producto.imagen}" title="${producto.descripcion_corta}" alt="${producto.descripcion_corta}" loading="lazy">
                        <div class="producto__overlay">
                            <div class="producto__icono" onclick="window.open('${producto.enlace}', '_blank')">🔗</div>
                        </div>
                    </div>
                    <div class="producto__info">
                        <p class="producto__precio">${producto.precio}</p>
                        <p class="producto__descripcion corta" data-corta="${producto.descripcion_corta}" data-larga="${producto.descripcion_larga}">
                            <span class="texto-descripcion">${producto.descripcion_corta}</span>
                            <button class="toggle-descripcion"> Ver más</button>
                        </p>
                        <button class="agregar-carrito" data-id="${producto.id}">Agregar al carrito</button>
                    </div>
                </div>
            `;
            contenedor.insertAdjacentHTML('beforeend', productoHTML);
        });

        contenedor.querySelectorAll(".producto__imagen").forEach(img => {
            img.addEventListener("load", () => img.classList.add("loaded"));
        });

        const productosVisibles = productosFiltrados.length;
        totalProductosVisibles += productosVisibles;

        seccion.style.display = productosVisibles > 0 ? "block" : "none";
    });

    mensajeNoProductos.style.display = totalProductosVisibles > 0 ? "none" : "block";
}

// FUNCIONES DEL CARRITO

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


function agregarAlCarrito(id) {
    let producto = obtenerProductoPorId(id);
    if (!producto) return;

    let productoEnCarrito = carrito.find(item => item.id == id);
    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    const sonido = document.getElementById("click-sound");
    if (sonido) {
        sonido.currentTime = 0;
        sonido.play().catch(e => console.log("Error al reproducir sonido", e));
    }
    const contenedorCarrito = document.getElementById("carrito-container");
    if (contenedorCarrito) {
        contenedorCarrito.classList.add("carrito-click");
        setTimeout(() => {
            contenedorCarrito.classList.remove("carrito-click");
        }, 300); 
    }

    guardarCarrito();
    actualizarContadorCarrito();
}


function obtenerProductoPorId(id) {
    return productosGlobales.find(producto => producto.id === id);
}


function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


function cargarCarrito() {
    const carritoGuardado = localStorage.getItem("carrito");
    carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    let totalProductos = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    contador.textContent = totalProductos;
}

function verificarAlmacenamientoLocal() {
    try {
        const totalStorage = 5 * 1024 * 1024; 
        let usedStorage = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const itemSize = new Blob([localStorage[key]]).size;
                usedStorage += itemSize;
            }
        }
        const porcentajeUsado = (usedStorage / totalStorage) * 100;
        const espacioLibre = totalStorage - usedStorage;
        console.log(`
    📦 Estado de Almacenamiento Local:
    - Espacio Total: ${(totalStorage / 1024 / 1024).toFixed(2)} MB
    - Espacio Usado: ${(usedStorage / 1024 / 1024).toFixed(2)} MB
    - Porcentaje Usado: ${porcentajeUsado.toFixed(2)}%
    - Espacio Libre: ${(espacioLibre / 1024 / 1024).toFixed(2)} MB
        `);
        if (porcentajeUsado > 80) {
            console.warn(" ⚠️ Almacenamiento Local casi lleno. Considere limpiar datos.");
        }
        return {
            total: totalStorage,
            usado: usedStorage,
            porcentaje: porcentajeUsado,
            libre: espacioLibre
        };
    } catch (error) {
        console.error(" Error al verificar almacenamiento local:", error);
        return null;
    }
}
