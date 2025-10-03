import firebaseConfig from './firebase-config.js';

let firestoreDb = null;

// Carga dinámica del SDK compat si no está disponible
function loadFirebaseCompat() {
  return new Promise((resolve, reject) => {
    if (window.firebase) {
      resolve();
      return;
    }
    const scriptApp = document.createElement('script');
    scriptApp.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';
    scriptApp.onload = () => {
      const scriptFirestore = document.createElement('script');
      scriptFirestore.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js';
      scriptFirestore.onload = () => resolve();
      scriptFirestore.onerror = reject;
      document.head.appendChild(scriptFirestore);
    };
    scriptApp.onerror = reject;
    document.head.appendChild(scriptApp);
  });
}

// Inicialización robusta de Firebase (como en producto.js + fallback compat)
async function initFirebase() {
  try {
    if (!window.firebase) {
      await loadFirebaseCompat();
    }

    if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
      firestoreDb = window.firebase.firestore();
      return { db: firestoreDb };
    }

    window.firebase.initializeApp(firebaseConfig);
    firestoreDb = window.firebase.firestore();
    return { db: firestoreDb };
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
    throw error;
  }
}

// Lee items de la URL con el formato /mi-pedido?items=C1-1:2,C2-2:4
function obtenerItemsPedido() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('items') || '';
  if (!raw.trim()) return [];

  return raw.split(',')
    .map(x => x.trim())
    .filter(Boolean)
    .map(pair => {
      // Formato esperado: ID:qty
      const [idParte, qtyParte] = pair.split(':');
      const id = (idParte || '').trim();
      const cantidad = Math.max(1, parseInt((qtyParte || '1').trim(), 10) || 1);
      return { id, cantidad };
    })
    .filter(item => !!item.id);
}

// Busca un producto por id en las colecciones indicadas
// Extrae ID base y slug de variante si existe
function extractBaseAndVariant(id) {
  const tokens = (id || '').split('-');
  if (tokens.length <= 2) {
    return { baseId: id, variantSlug: null };
  }
  const baseId = `${tokens[0]}-${tokens[1]}`; // soporta patrones C1-1 y C1-1a
  const variantSlug = tokens.slice(2).join('-');
  return { baseId, variantSlug };
}

function slugifyVar(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function buscarProductoPorId(id) {
  const { db } = await initFirebase();
  const colecciones = ['productos-piercing', 'productos'];
  const { baseId, variantSlug } = extractBaseAndVariant(id);

  for (const coleccion of colecciones) {
    const snap = await db
      .collection(coleccion)
      .where('id', '==', baseId)
      .limit(1)
      .get();

    if (!snap.empty) {
      const data = snap.docs[0].data();
      return { data, origen: coleccion, baseId, variantSlug };
    }
  }
  return null;
}

// Utilidad para normalizar precios tipo "$40.000 c/u" a número 40000
function parsePrecioToNumber(precio) {
  // Acepta número o string. Si ya es número, retornar entero seguro.
  if (typeof precio === 'number' && Number.isFinite(precio)) {
    return Math.round(precio);
  }
  if (typeof precio !== 'string') return 0;
  // Toma el primer bloque numérico de la cadena
  const soloDigitos = (precio.match(/[0-9\.\,]+/) || [''])[0]
    .replace(/[\.\,]/g, '')
    .trim();
  const val = parseInt(soloDigitos, 10);
  return Number.isFinite(val) ? val : 0;
}

function formatearCOP(valor) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  } catch {
    return `$${Number(valor || 0).toLocaleString('es-CO')}`;
  }
}

function crearCardProducto(producto, cantidad, opts = {}) {
  const div = document.createElement('div');
  div.className = 'pedido-card';

  const overrideImg = opts.imagenOverride || producto.imagen || '';
  const overrideDesc = opts.descripcionOverride || producto.descripcion_corta || producto.nombre || 'Producto';
  const precioUnitStr = producto.precio || '';
  const precioUnitNum = parsePrecioToNumber(precioUnitStr);

  div.innerHTML = `
    <img class="pedido-card__img" src="${overrideImg}" alt="${overrideDesc}">
    <div>
      <div class="pedido-card__title">${overrideDesc}</div>
      <div class="pedido-card__meta">Cantidad: <strong>${cantidad}</strong></div>
      <div class="pedido-card__meta">Precio unitario: <strong>${precioUnitStr || formatearCOP(precioUnitNum)}</strong></div>
    </div>
  `;
  return { node: div, precioUnitNum };
}

async function renderPedido() {
  const contenedor = document.getElementById('products');
  const lblCantidad = document.getElementById('pedido-cantidad');
  const lblTotal = document.getElementById('pedido-total');
  if (!contenedor) return;
  const items = obtenerItemsPedido();
  if (items.length === 0) {
    contenedor.innerHTML = '<p>No se encontraron productos en este pedido.</p>';
    lblCantidad && (lblCantidad.textContent = 'Productos totales: 0');
    lblTotal && (lblTotal.textContent = 'Costo del pedido: $0');
    return;
  }

  // Render inicial vacío mientras cargamos
  contenedor.innerHTML = '';

  let totalItems = 0;
  let totalCosto = 0;

  // Cargar productos en serie para evitar demasiadas lecturas simultáneas
  for (const item of items) {
    try {
      const resultado = await buscarProductoPorId(item.id);
      if (!resultado) {
        // Card de producto no encontrado
        const emptyCard = document.createElement('div');
        emptyCard.className = 'pedido-card';
        emptyCard.innerHTML = `
          <div class="pedido-card__title">${item.id}</div>
          <div class="pedido-card__meta">Cantidad: <strong>${item.cantidad}</strong></div>
          <div class="pedido-card__meta" style="color:#a00">No encontrado</div>
        `;
        contenedor.appendChild(emptyCard);
        continue;
      }

      const { data: producto, variantSlug } = resultado;
      let imagenOverride;
      let descripcionOverride;
      if (variantSlug && producto.variantes && typeof producto.variantes === 'object') {
        const entrada = Object.entries(producto.variantes).find(([nombre]) => slugifyVar(nombre) === variantSlug);
        if (entrada) {
          const [variantName, variantImg] = entrada;
          if (variantImg) imagenOverride = variantImg;
          const baseDesc = producto.descripcion_corta || producto.nombre || 'Producto';
          descripcionOverride = `${baseDesc} - Variante: ${variantName}`;
        }
      }

      const { node, precioUnitNum } = crearCardProducto(producto, item.cantidad, { imagenOverride, descripcionOverride });
      contenedor.appendChild(node);

      totalItems += item.cantidad;
      totalCosto += precioUnitNum * item.cantidad;
    } catch (e) {
      console.error('Error cargando producto', item.id, e);
    }
  }

  // Resumen
  if (lblCantidad) lblCantidad.textContent = `Productos totales: ${totalItems}`;
  if (lblTotal) lblTotal.textContent = `Costo del pedido: ${formatearCOP(totalCosto)}`;

  // Mostrar detalles adicionales (si vienen en la URL)
  try {
    const params = new URLSearchParams(window.location.search);
    const detalles = (params.get('detalles') || '').trim();
    const contenedorResumen = document.getElementById('pedido-resumen');
    if (detalles && contenedorResumen) {
      let bloqueDetalles = document.getElementById('pedido-detalles');
      if (!bloqueDetalles) {
        bloqueDetalles = document.createElement('div');
        bloqueDetalles.id = 'pedido-detalles';
        bloqueDetalles.style.marginTop = '8px';
        bloqueDetalles.style.whiteSpace = 'pre-wrap';
        contenedorResumen.insertAdjacentElement('afterend', bloqueDetalles);
      }
      bloqueDetalles.innerHTML = `<p><strong>Detalles adicionales:</strong></p><p>${detalles}</p>`;
    }
  } catch (e) {
    console.warn('No fue posible leer los detalles del pedido:', e);
  }
}

// Inicio
document.addEventListener('DOMContentLoaded', () => {
  renderPedido();
});
