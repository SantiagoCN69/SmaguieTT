
//logo cambiar tema
let colores = ["color1", "color2"];
let index = localStorage.getItem("colorIndex") ? parseInt(localStorage.getItem("colorIndex")) : 0;

document.body.classList.add(colores[index]);

function cambiarColor() {
    document.body.classList.remove(...colores);
    index = (index + 1) % colores.length; 
    document.body.classList.add(colores[index]);
    localStorage.setItem("colorIndex", index); 
}


// HEADER - Selección de elementos
const menuToggle = document.querySelector('.header__menu-toggle');
const nav = document.querySelector('.header__nav');
const header = document.querySelector('.header');

let headerClosedHeight;
let isAnimating = false;

// HEADER - Guardar la altura del header cuando está cerrado
function updateHeaderClosedHeight() {
  headerClosedHeight = header.offsetHeight + 'px';
}

// HEADER - Abrir menú
menuToggle.addEventListener('click', () => {
  const isOpen = header.classList.contains('active');

  if (isOpen) {
    closeMenu();
  } else {
    updateHeaderClosedHeight(); 
    header.style.height = headerClosedHeight;
    header.classList.add('active');
    nav.classList.add('active');
    menuToggle.classList.add('open');

    requestAnimationFrame(() => {
      header.style.transition = 'height 0.3s ease';
      header.style.height = '100vh';
    });
  }
});

// HEADER - Cerrar menú
function closeMenu() {
  if (nav.classList.contains('active') && !isAnimating) {
    isAnimating = true;

    const currentHeight = header.scrollHeight + 'px';
    header.style.height = currentHeight;

    requestAnimationFrame(() => {
      header.style.transition = 'height 0.3s ease';
      header.style.height = headerClosedHeight;
    });

    menuToggle.classList.remove('open');
    nav.classList.remove('active');

    setTimeout(() => {
      header.classList.remove('active');
      header.style.height = '';
      header.style.transition = '';
      nav.style.display = '';
      isAnimating = false;
    }, 300);
  }
}

// Detectar scroll para actualizar altura
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(updateHeaderClosedHeight, 500);


  if (nav.classList.contains('active')) {
    closeMenu();
  }
});



window.addEventListener('resize', () => {
  setTimeout(updateHeaderClosedHeight, 300);
});


document.addEventListener('click', (event) => {
  const isClickInsideMenu =
    event.target.closest('.header__menu-link') ||
    event.target.closest('.header__menu-toggle');

  if (nav.classList.contains('active') && !isClickInsideMenu) {
    closeMenu();
  }
});

window.addEventListener('DOMContentLoaded', updateHeaderClosedHeight);




//HEADER - Ajustar margen
function ajustarMargen() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const body = document.body;
    body.style.marginTop = `${header.offsetHeight - 12}px`;
}


document.addEventListener('DOMContentLoaded', ajustarMargen);

//HEADER - Small

window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");
    if (!header) return;
    
    if (window.scrollY > 50) {
        header.classList.add("header-small");
    } else {
        header.classList.remove("header-small");
    }
    
});


// FOOTER - Animación de iconos y texto en el footer
const footerItems = document.querySelectorAll(".footer__item");
const footerText = document.querySelector(".footer__text");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      footerItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add("footer__item--visible");
        }, index * 100);
      });

      if (footerText) {
        footerText.classList.add("footer__text--visible");
      }
    } else {
      footerItems.forEach((item) => {
        item.classList.remove("footer__item--visible");
      });

      if (footerText) {
        footerText.classList.remove("footer__text--visible");
      }
    }
  });
}, {
  threshold: 0.2
});

const footer = document.querySelector(".footer");
if (footer) observer.observe(footer);




//cacheee
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch((err) => console.log("Error al registrar el Service Worker:", err));
  }