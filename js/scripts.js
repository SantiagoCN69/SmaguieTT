
//animacion de carga

document.addEventListener("DOMContentLoaded", () => {
  const elementos = document.querySelectorAll(".animado");

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("mostrar");
              observer.unobserve(entry.target); 
          }
      });
  }, { threshold: 0.2 });

  elementos.forEach(el => observer.observe(el));
});


//logo cambiar tema
let colores = ["color1", "color2", "color3"];
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





// FOOTER - Paginas randoms onclick

function redireccionar() {
  const sitios = [
"http://awkwardfamilyphotos.com/",
"https://www.daysoftheyear.com/",
"http://thecodinglove.com/",
"https://pointerpointer.com/",
"https://eelslap.com/",
"https://theuselessweb.com/",
"https://heeeeeeeey.com/",
"https://weirdorconfusing.com/",
"http://cat-bounce.com/",
"http://www.fallingfalling.com/",
"http://www.staggeringbeauty.com/",
"http://www.boredbutton.com/",
"http://zoomquilt.org/",
"http://www.koalastothemax.com/",
"http://sanger.dk/",
"http://www.patience-is-a-virtue.org/",
"http://endless.horse/",
"http://longdogechallenge.com/",
"http://corndog.io/",
"http://isitchristmas.com/",
"http://isitimeforabreak.com/",
"http://sometimesredsometimesblue.com/",
"https://trypap.com/",
"http://beesbeesbees.com/",
"https://thisissand.com/",
"https://radio.garden/",
"https://asoftmurmur.com/",
"http://hackertyper.com/",
"https://thezen.zone/",
"http://www.republiquedesmangues.fr/",
"https://lava.lamp.fm/",
"http://chrismckenzie.com/",
"https://geekprank.com/fake-virus/",
"https://mapcrunch.com/",
"http://r33b.net/",
"https://ncase.me/trust/",
"https://neal.fun/infinite-craft/",
"https://neal.fun/absurd-trolley-problems/",
"https://neal.fun/draw-perfect-circles/",
"https://papertoilet.com/",
"https://findtheinvisiblecow.com/",
"https://puginarug.com/",
"https://corgiorgy.com/",
"http://www.ismycomputeron.com/",
"http://www.howmanypeopleareinspacerightnow.com/",
"http://www.iamawesome.com/",
"http://tencents.info/",
"http://www.zombo.com/",
"http://www.donothingfor2minutes.com/",
"http://www.everydayim.com/",
"http://www.movenowthinklater.com/",
"http://www.muchbetterthanthis.com/",
"https://whereisroadster.com/",
"https://bouncyballs.org/",
"https://quickdraw.withgoogle.com/",
"https://papertoilet.com/",
"https://findtheinvisiblecow.com/",
"https://puginarug.com/",
"https://corgiorgy.com/",
"http://www.ismycomputeron.com/",
"http://www.howmanypeopleareinspacerightnow.com/",
"http://www.iamawesome.com/",
"http://tencents.info/",
"http://www.zombo.com/",
"http://www.donothingfor2minutes.com/",
"http://www.everydayim.com/",
"http://www.movenowthinklater.com/",
"http://www.muchbetterthanthis.com/",
"https://whereisroadster.com/",
"https://bouncyballs.org/",
"https://quickdraw.withgoogle.com/",
"https://neal.fun/size-of-space/",
"https://neal.fun/space-elevator/",
"https://neal.fun/deep-sea/",
"https://neal.fun/password-game/",
"https://neal.fun/spend/",
"https://neal.fun/2048/",
"https://neal.fun/let-there-be-light/",
"https://neal.fun/guess-my-word/",
"https://neal.fun/rocks/",
"https://neal.fun/diamonds/",
"https://neal.fun/open-probability/",
"https://neal.fun/never-ending-calendar/",
"https://neal.fun/ten-thousand-cents/",
"https://neal.fun/who-will-win/",
"https://neal.fun/what-if/",
"https://neal.fun/where-does-the-time-go/",
"https://neal.fun/whats-my-name/",
"https://neal.fun/weather-machine/",
"https://neal.fun/wind-map/",
"https://neal.fun/zoom-world/",
"https://neal.fun/you-vs-everyone/",
"https://neal.fun/your-life-on-earth/",
"https://neal.fun/your-name-in-time/",
"https://neal.fun/your-name-in-universe/",
"https://neal.fun/zodiac-map/",
"https://neal.fun/visualize-this/",
"https://neal.fun/vivid-mind/",


  ];
  const randomIndex = Math.floor(Math.random() * sitios.length);
  window.open(sitios[randomIndex], "_blank");
}

//cacheee
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch((err) => console.log("Error al registrar el Service Worker:", err));
  }