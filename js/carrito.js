//CARRITO - Carga productos, agregar, remover, vaciar, generar enlace, restaurar ultima compra

document.addEventListener("DOMContentLoaded", () => {
    mostrarCarrito();

    document.getElementById("vaciar-carrito").addEventListener("click", () => {
        localStorage.removeItem("carrito");
        mostrarCarrito();
    });

    document.getElementById("realizar-pedido").addEventListener("click", () => {
        generarEnlacePedido();
    });

    document.getElementById("ultima-compra").addEventListener("click", () => {
        restaurarUltimaCompra();
    });

    actualizarEstadoUltimaCompra();
});

function mostrarCarrito() {
    const carritoGuardado = localStorage.getItem("carrito");
    const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    const listaCarrito = document.getElementById("lista-carrito");
    const btnPedido = document.getElementById("realizar-pedido");
    const btnVaciar = document.getElementById("vaciar-carrito");

    listaCarrito.innerHTML = carrito.length === 0 
        ? "<p>El carrito está vacío.</p>" 
        : carrito.map(producto => `
            <div class="carrito-item" data-id="${producto.id}">
                <img src="${producto.imagen}" alt="Imagen de ${producto.descripcion_corta}" class="carrito-item__imagen">
                <div class="carrito-item__info">
                    <p class="carrito-item__descripcion">${producto.descripcion_corta}</p>
                    <p class="carrito-item__precio">${producto.precio}</p>
                    <div class="cantidad-control">
                        <button class="btn-restar" data-id="${producto.id}">-</button>
                        <span class="cantidad">${producto.cantidad}</span>
                        <button class="btn-sumar" data-id="${producto.id}">+</button>
                    </div>
                </div>
            </div>
        `).join("");

    listaCarrito.innerHTML += carrito.length > 0 
        ? `<p id="carrito__total"><strong>Total: $${calcularTotal(carrito)}</strong></p>` 
        : "";

    agregarEventosBotones();


    if (carrito.length === 0) {
        btnPedido.disabled = true;
        btnPedido.textContent = "Agrega productos al carrito para pedirlos";
        btnVaciar.disabled = true; 
    } else {
        btnPedido.disabled = false;
        btnPedido.textContent = "Realizar Pedido ✅";
        btnVaciar.disabled = false; 
    }

    actualizarEstadoUltimaCompra();
}



function agregarEventosBotones() {
    document.querySelectorAll(".btn-sumar").forEach(boton => {
        boton.addEventListener("click", () => modificarCantidad(boton.dataset.id, 1));
    });

    document.querySelectorAll(".btn-restar").forEach(boton => {
        boton.addEventListener("click", () => modificarCantidad(boton.dataset.id, -1));
    });
}

function modificarCantidad(id, cambio) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    id = id.toString();

    let producto = carrito.find(item => item.id.toString() === id);
    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter(item => item.id.toString() !== id);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

function calcularTotal(carrito) {
    return carrito
        .filter(p => p.precio) 
        .reduce((acc, producto) => {
            let precioLimpio = String(producto.precio)
                .replace(/\(.*?\)/g, "")
                .replace(/\./g, "") 
                .replace(/[^\d]/g, "");

            return acc + parseFloat(precioLimpio) * producto.cantidad;
        }, 0).toLocaleString("es-CO"); 
}



function generarEnlaceWhatsApp() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    if (carrito.length === 0) {
        console.error("El carrito está vacío. No se puede generar el enlace.");
        return;
    }

    let mensaje = "Hola, buen día. Quisiera pedir estos productos:\n\n";

    carrito.forEach(producto => {
        let descripcion = producto.descripcion_corta;


        if (producto.cantidad > 1) {
            descripcion = descripcion
                .replace(/\bunidad\b/gi, "Unidades")
                .replace(/\baguja\b/gi, "Agujas")
                .replace(/\bcaja\b/gi, "Cajas")
                .replace(/\bpaquete\b/gi, "Paquetes")
                .replace(/\bfrasco\b/gi, "Frascos")
                .replace(/\bmetro\b/gi, "Metros")
                .replace(/\bpar\b/gi, "Pares")
                .replace(/\bpack\b/gi, "Packs")
                .replace(/\bPalito\b/gi, "Palitos")
                .replace(/\bvitamina yodi\b/gi, "vitaminas yodi")
                .replace(/\bultra ink tattoo\b/gi, "ultra inks tattoo")
                .replace(/\bafter care\b/gi, "after cares")
                .replace(/\brollo\b/gi, "rollos")
                .replace(/\bcubre grip\b/gi, "Cubre grips")
                .replace(/\bnaranja\b/gi, "Naranjas")
                .replace(/\bPiel Sintética\b/gi, "Pieles sinteticas")
                .replace(/\bMáquina\b/gi, "Maquinas")
                .replace(/\bLoción\b/gi, "Lociónes")
                .replace(/\btarro\b/gi, "Tarros")
                .replace(/\bcable\b/gi, "Cables")
                .replace(/\bpañal\b/gi, "Pañales")
                .replace(/\bgel anestésico\b/gi, "geles anestésicos")
                .replace(/\bcrema Anestésica\b/gi, "Cremas Anestésicas")
                .replace(/\bmarcador\b/gi, "Marcadores")
                .replace(/\brecipiente\b/gi, "Recipientes")
                .replace(/\bpapel hectográfico\b/gi, "Papeles hectográficos")
                .replace(/\bcuchilla\b/gi, "Cuchillas")
                .replace(/\bSolucion\b/gi, "Soluciones"); }

        mensaje += `- ${producto.cantidad} ${descripcion}\n`;
    });

    mensaje += "\nAgradezco su confirmación.\nA la dirección: ";

    let enlace = `https://wa.me/573053662867?text=${encodeURIComponent(mensaje)}`;
    
    console.log("Enlace generado:", enlace);
    window.open(enlace, "_blank");

    localStorage.setItem("ultimaCompra", JSON.stringify(carrito));

    localStorage.removeItem("carrito");
    mostrarCarrito();
}







function actualizarEstadoUltimaCompra() {
    const btnUltimaCompra = document.getElementById("ultima-compra");
    const btnRealizarPedido = document.getElementById("realizar-pedido");
    const ultimaCompra = localStorage.getItem("ultimaCompra");


    btnUltimaCompra.textContent = ultimaCompra && JSON.parse(ultimaCompra).length > 0
        ? "Último Pedido 🔁"
        : "No hay último pedido";

    btnUltimaCompra.disabled = !ultimaCompra || JSON.parse(ultimaCompra).length === 0;
}




// Modal para volver al catálogo
document.addEventListener("DOMContentLoaded", () => {
    const botonVolverCatalogo = document.getElementById("volver-catalogo");

    if (botonVolverCatalogo) {
        // Crear el modal
        const modal = document.createElement("div");
        modal.id = "modal-catalogo";
   
        const modalContent = document.createElement("div");
        modalContent.id = "modal-content";
        const botonTattoo = document.createElement("button");
        botonTattoo.textContent = "Catálogo Tattoo";
        const botonPiercing = document.createElement("button");
        botonPiercing.textContent = "Catálogo Piercing";

        modalContent.appendChild(botonTattoo);
        modalContent.appendChild(botonPiercing);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Evento para mostrar el modal
        botonVolverCatalogo.addEventListener("click", (event) => {
            event.preventDefault(); // Prevenir la navegación si es un enlace
            modal.style.display = "block";
        });

        // Evento para cerrar el modal si se hace clic fuera del contenido
        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        // Evento para cerrar el modal al hacer scroll
        window.addEventListener("scroll", () => {
            if (modal.style.display !== "none") {
                modal.style.display = "none";
            }
        });

        // Eventos para los botones del modal
        botonTattoo.addEventListener("click", () => {
            window.location.href = "catalogo-tattoo.html";
        });

        botonPiercing.addEventListener("click", () => {
            window.location.href = "catalogo-piercing.html";
        });
    }
});
