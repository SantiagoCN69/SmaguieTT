//letrero web app

let deferredPrompt;

const BANNER_ID = 'install-banner';
const DESKTOP_BREAKPOINT = 768;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;

    const isDesktop = window.innerWidth > DESKTOP_BREAKPOINT;
    const isPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    if (!isPWA && !isDesktop) {
        mostrarBanner();
    }
});

function mostrarBanner() {
    const banner = document.getElementById(BANNER_ID);
    if (banner) {
        banner.style.display = "grid";
    }
}

function instalarApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("✅");
            } else {
                console.log("❌");
            }
            deferredPrompt = null;
            cerrarBanner();
        });
    }
}

function cerrarBanner() {
    const banner = document.getElementById(BANNER_ID);
    if (banner) {
        banner.style.display = "none";
    }
}


//  Swiper 1 - imagenes principales
var swiper1 = new Swiper(".swiper1", {
    loop:true,
    effect: 'fade',
    navigation: {
        nextEl: ".next1",
        prevEl: ".prev1"
    },

});

  //  Swiper 2 - productos tendencia
let swiper2 = new Swiper(".productos__content", {
    loop: true,
    autoplay: true,
    spaceBetween: 15,
    grabCursor: true,

    pagination: {
    el: ".swiper-pagination",
    clickable: true,
    dynamicBullets: true,
    },
    
    navigation: {
    nextEl: ".next2",
    prevEl: ".prev2",
    },

    breakpoints: {
    600: {
        slidesPerView: 2,
    },
    968: {
        slidesPerView: 3,
    },
    1180: {
        slidesPerView: 4,
    }
    },


});



// Swiper 2 - Productos boton ver más
document.addEventListener("DOMContentLoaded", function() {
    const botonesVerMas = document.querySelectorAll(".ver-mas");
    const contenedorProductos = document.querySelector(".productos__container"); 
    botonesVerMas.forEach(boton => {
        boton.addEventListener("click", function(event) {
            let descripcion = this.previousElementSibling;
            let abierto = descripcion.style.display === "inline";
            descripcion.style.display = abierto ? "none" : "inline";
            this.textContent = abierto ? "Ver más" : "Ver menos";

            event.stopPropagation(); 
        });
    });
    document.addEventListener("click", function(event) {
        if (!contenedorProductos.contains(event.target)) {
            botonesVerMas.forEach(boton => {
                let descripcion = boton.previousElementSibling;
                descripcion.style.display = "none";
                boton.textContent = "Ver más";
            });
        }
    });
});