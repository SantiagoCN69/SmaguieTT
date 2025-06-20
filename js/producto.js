import firebaseConfig from './firebase-config.js';

let firestoreDb = null;

// Inicializar Firebase
async function initFirebase() {
    console.log('Inicializando Firebase...');
    try {
        // Si Firebase ya está inicializado, usar la instancia existente
        if (window.firebase && window.firebase.apps.length > 0) {
            firestoreDb = window.firebase.firestore();
            console.log('Usando instancia existente de Firebase');
            return { db: firestoreDb };
        }

        // Inicializar Firebase si no está inicializado
        window.firebase.initializeApp(firebaseConfig);
        firestoreDb = window.firebase.firestore();
        console.log('Firebase inicializado correctamente');
        return { db: firestoreDb };
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        throw error;
    }
}

// Obtener descripción del producto de la URL
function obtenerIdProducto() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Función para volver al catálogo apropiado
function volverAlCatalogo() {
    const referrer = document.referrer;
    if (referrer.includes('catalogo-piercing.html')) {
        window.location.href = 'catalogo-piercing.html';
    } else if (referrer.includes('catalogo-tattoo.html')) {
        window.location.href = 'catalogo-tattoo.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Configurar el botón de volver
document.addEventListener('DOMContentLoaded', () => {
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', (e) => {
            e.preventDefault();
            volverAlCatalogo();
        });
    }
});

// Cargar datos del producto
async function cargarProducto() {
    try {
        const descripcionCorta = decodeURIComponent(obtenerIdProducto());
        console.log('Buscando producto con descripción:', descripcionCorta);
        
        if (!descripcionCorta) {
            throw new Error('No se proporcionó ID del producto');
        }

        const { db } = await initFirebase();
        
        // Intentar buscar en ambas colecciones
        const colecciones = ['productos-piercing', 'productos'];
        let producto = null;
        let origen = '';

        for (const coleccion of colecciones) {
            const snapshot = await db.collection(coleccion)
                .where('descripcion_corta', '==', descripcionCorta)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                producto = doc.data();
                origen = coleccion;
                console.log('Producto encontrado:', producto);
                console.log('ID del producto:', producto.id);
                break;
            }
        }

        if (!producto) {
            throw new Error('Producto no encontrado');
        }
        
        mostrarProducto(producto, origen);

    } catch (error) {
        console.error('Error al cargar el producto:', error);
        alert('No se pudo cargar el producto. Volviendo al catálogo...');
        // Redirigir al catálogo apropiado basado en el referrer
        const referrer = document.referrer;
        if (referrer.includes('catalogo-piercing.html')) {
            window.location.href = 'catalogo-piercing.html';
        } else if (referrer.includes('catalogo-tattoo.html')) {
            window.location.href = 'catalogo-tattoo.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Mostrar datos del producto en la página
function mostrarProducto(producto, origen) {
    console.log('Mostrando producto:', producto);
    
    // Guardar el producto actual globalmente
    window.productoActual = producto;

    // Actualizar título de la página
    document.title = `${producto.descripcion_corta} - SmaguieTT`;
    
    // Actualizar imagen
    const imagenProducto = document.getElementById('producto-imagen');
    imagenProducto.src = producto.imagen;
    imagenProducto.alt = producto.descripcion_corta;
    
    // Actualizar información del producto
    document.getElementById('producto-titulo').textContent = producto.descripcion_corta;
    document.getElementById('producto-precio').textContent = producto.precio;
    document.getElementById('producto-descripcion').textContent = producto.descripcion_larga;

    // Actualizar características
    const caracteristicas = document.getElementById('producto-caracteristicas');
    const seccionCaracteristicas = document.querySelector('.producto-detalle__caracteristicas');
    caracteristicas.innerHTML = '';

    if (producto.caracteristicas && producto.caracteristicas.length > 0) {
        producto.caracteristicas.forEach(caracteristica => {
            const li = document.createElement('li');
            li.textContent = caracteristica;
            caracteristicas.appendChild(li);
        });
        seccionCaracteristicas.style.display = 'block';
    } else {
        seccionCaracteristicas.style.display = 'none';
    }

    // Actualizar variantes
    const variantes = document.getElementById('producto-variantes');
    const seccionVariantes = document.querySelector('.producto-detalle__variantes');
    variantes.innerHTML = '';

    let enlaceBase = producto.enlace || '';
    const imagenPrincipal = document.getElementById('producto-imagen');
    let imagenOriginal = imagenPrincipal.src;

    // Configurar botón de comprar ya
    const btnComprarYa = document.getElementById('comprar-ya');
    let enlaceActual = producto.enlace || '';

    if (producto.enlace) {
        btnComprarYa.style.display = 'block';
    } else {
        btnComprarYa.style.display = 'none';
    }

    // Un solo event listener para el botón
    btnComprarYa.addEventListener('click', () => {
        window.open(enlaceActual, '_blank');
    });

    if (producto.variantes && Object.keys(producto.variantes).length > 0) {
        Object.entries(producto.variantes).forEach(([nombre, imagenUrl]) => {
            const li = document.createElement('li');
            li.textContent = nombre;

            // Eventos para cambiar la imagen
            li.addEventListener('mouseenter', () => {
                if (imagenUrl && !li.classList.contains('active')) {
                    imagenPrincipal.src = imagenUrl;
                }
            });

            li.addEventListener('mouseleave', () => {
                if (!li.classList.contains('active')) {
                    imagenPrincipal.src = imagenOriginal;
                }
            });

            li.addEventListener('click', () => {
                const wasActive = li.classList.contains('active');
                // Remover active de todos los li
                variantes.querySelectorAll('li').forEach(item => {
                    item.classList.remove('active');
                });

                if (!wasActive) {
                    // Activar la variante
                    li.classList.add('active');
                    if (imagenUrl) {
                        imagenOriginal = imagenUrl;
                        imagenPrincipal.src = imagenUrl;
                    }
                    // Actualizar el enlace
                    enlaceActual = enlaceBase + ' ' + nombre;
                } else {
                    // Desactivar la variante
                    imagenPrincipal.src = producto.imagen;
                    imagenOriginal = producto.imagen;
                    // Restaurar el enlace original
                    enlaceActual = enlaceBase;
                }
            });
            variantes.appendChild(li);
        });
        seccionVariantes.style.display = 'block';
    } else {
        seccionVariantes.style.display = 'none';
    }

    // Configurar botón de agregar al carrito
    const btnAgregarCarrito = document.getElementById('agregar-carrito');
    btnAgregarCarrito.setAttribute('data-id', producto.id);
    // Remover eventos anteriores para evitar duplicados
    const nuevoBtn = btnAgregarCarrito.cloneNode(true);
    btnAgregarCarrito.parentNode.replaceChild(nuevoBtn, btnAgregarCarrito);
    nuevoBtn.addEventListener('click', () => agregarAlCarrito(producto.id));

    // Ocultar loading y mostrar el contenedor del producto
    document.querySelector('.producto-detalle__loading').classList.add('oculto');
    document.querySelector('.producto-detalle__contenedor').classList.add('activo');
}

// Función para agregar al carrito
// FUNCIONES DEL CARRITO

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


function agregarAlCarrito(productoOId) {
    console.log('Producto/ID a agregar:', productoOId);
    console.log('Carrito actual:', carrito);

    // Si es un ID, buscar el producto en el carrito
    const productoId = typeof productoOId === 'string' ? productoOId : productoOId.id;
    console.log('ID del producto:', productoId);

    let productoEnCarrito = carrito.find(item => item.id == productoId);
    console.log('Producto encontrado en carrito:', productoEnCarrito);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
    } else {
        // Si recibimos el objeto producto completo, lo usamos, si no, usamos el que está en la página
        const producto = typeof productoOId === 'string' ? window.productoActual : productoOId;
        carrito.push({ ...producto, cantidad: 1 });
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
    mostrarContadorEnBoton(producto.id, carrito.find(p => p.id === producto.id).cantidad);
}


function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    let totalProductos = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    contador.textContent = totalProductos;
}




//contador carrito en el boton 
function mostrarContadorEnBoton(idProducto, cantidad) {
    const boton = document.querySelector(`#agregar-carrito[data-id="${idProducto}"]`);
    if (!boton) return;

    let contador = boton.querySelector(".contador-circulo");

    if (!contador) {
        contador = document.createElement("div");
        contador.className = "contador-circulo";
        boton.appendChild(contador);
    }

    contador.innerHTML = `<span>${cantidad}</span>`;
    contador.classList.add("mostrar");

    // Reinicia la animación para que se note el cambio
    void contador.offsetWidth;
    contador.querySelector("span").style.animation = "rueda 0.4s ease";
}


// Iniciar la carga del producto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando carga de producto...');
    cargarProducto();
    actualizarContadorCarrito();
});