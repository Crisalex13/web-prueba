
// ================================================================
//  SESION — leer ANTES de cualquier otra cosa
// ================================================================
const _session = localStorage.getItem('sn_session');
if (!_session) { window.location.href = 'signin.html'; }

const _user    = JSON.parse(_session || '{}');
const _isAdmin = _user.role === 'admin';

// Mostrar info en header
document.getElementById('userName').textContent = _user.name || _user.email || '';
const badge = document.getElementById('roleBadge');
badge.textContent = _isAdmin ? 'Administrador' : 'Usuario';
badge.className   = 'badge ' + (_isAdmin ? 'badge-admin' : 'badge-user');

// Ocultar "Agregar" si no es admin
if (!_isAdmin) {
  document.getElementById('navAgregar').style.display = 'none';
}

// Logout
document.getElementById('btnLogout').addEventListener('click', function() {
  if (confirm('Seguro que deseas cerrar sesion?')) {
    localStorage.removeItem('sn_session');
    window.location.href = 'signin.html';
  }
});

// menu
const list = document.querySelectorAll('.list');
const indicator = document.querySelector('.indicator');

function activeLink() {
  list.forEach((item) => item.classList.remove('active'));
  this.classList.add('active');

  let position = this.offsetTop;
  indicator.style.top = position + "px";
}

list.forEach((item) =>
  item.addEventListener('click', activeLink)
);

// ================================================================
//  PRODUCTOS
// ================================================================
let products = JSON.parse(localStorage.getItem('sn_products') || '[]');
let delId    = null;

function saveProducts() { localStorage.setItem('sn_products', JSON.stringify(products)); }
function uid() { return 'p' + Date.now() + Math.random().toString(36).substr(2,5); }

function price(n) {
  return '$' + Number(n).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function icon(cat) {
  return {'Electronica':'💻','Ropa':'👕','Hogar':'🏠','Deportes':'⚽','Alimentos':'🍎'}[cat] || '📦';
}

function toast(msg, type='tok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

// Datos demo
if (products.length === 0) {
  products = [
    { id:'p1', name:'iPhone 15 Pro',     category:'Electronica', price:24999, stock:12, sku:'ELEC-001', desc:'Smartphone con chip A17 Pro, camara de 48MP y titanio aeroespacial.', image:'https://images.unsplash.com/photo-1677945025779-97b5e4f9c028?w=600&q=80', createdAt:Date.now() },
    { id:'p2', name:'Zapatillas Air Max', category:'Ropa',        price:2850,  stock:30, sku:'ROPA-001', desc:'Diseno iconico con tecnologia de amortiguacion Air para maximo confort.', image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', createdAt:Date.now()-1000 },
    { id:'p3', name:'Lampara Nordica',    category:'Hogar',        price:899,   stock:5,  sku:'HOG-001',  desc:'Iluminacion calida con diseno escandinavo minimalista.', image:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80', createdAt:Date.now()-2000 },
    { id:'p4', name:'Bicicleta Montana',  category:'Deportes',     price:8500,  stock:3,  sku:'DEP-001',  desc:'Bicicleta 21 velocidades con cuadro aluminio y frenos de disco.', image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', createdAt:Date.now()-3000 },
  ];
  saveProducts();
}

// ================================================================
//  VISTAS
// ================================================================
function showView(v) {
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(x => x.classList.remove('active'));
  document.getElementById(v + 'View').classList.add('active');
  const lnk = document.querySelector(`[data-view="${v}"]`);
  if (lnk) lnk.classList.add('active');
  if (v === 'catalog') renderGrid();
}

// ================================================================
//  CATALOGO
// ================================================================
function renderGrid(txt='', cat='') {
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('emptyState');

  let list = products
    .filter(p => {
      const matchTxt = p.name.toLowerCase().includes(txt.toLowerCase()) ||
                       p.desc.toLowerCase().includes(txt.toLowerCase());
      const matchCat = !cat || p.category === cat;
      return matchTxt && matchCat;
    })
    .sort((a,b) => b.createdAt - a.createdAt);

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = list.map(p => `
    <div class="card" onclick="showDetail('${p.id}')">
      <div class="card-img">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='${icon(p.category)}'">`
          : icon(p.category)}
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-footer">
          <div class="card-price">${price(p.price)}</div>
          <div class="card-stock ${p.stock<=5?'low':''}">
            ${p.stock<=5?'⚠ ':''}${p.stock} en stock
          </div>
        </div>
      </div>
      ${_isAdmin ? `
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="icon-btn edit" onclick="editProduct('${p.id}')" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="icon-btn del"  onclick="openDel('${p.id}')"    title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>` : ''}
    </div>
  `).join('');
}

// ================================================================
//  DETALLE
// ================================================================
function showDetail(id) {
  const p = products.find(x => x.id===id);
  if (!p) return;
  document.getElementById('detailContent').innerHTML = `
    <div class="detail-card">
      <div class="detail-img">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='${icon(p.category)}'">`
          : icon(p.category)}
      </div>
      <div class="detail-info">
        <div class="detail-cat">${p.category}</div>
        <div class="detail-name">${p.name}</div>
        ${p.sku ? `<div class="detail-sku">SKU: ${p.sku}</div>` : ''}
        <div class="detail-price">${price(p.price)}</div>
        <div class="detail-desc">${p.desc}</div>
        <div class="detail-meta">
          <div class="meta-row"><i class="fas fa-boxes-stacked"></i><span class="meta-label">Stock</span><span class="meta-val">${p.stock} unidades</span></div>
          <div class="meta-row"><i class="fas fa-tag"></i><span class="meta-label">Categoria</span><span class="meta-val">${p.category}</span></div>
          <div class="meta-row"><i class="fas fa-calendar"></i><span class="meta-label">Agregado</span><span class="meta-val">${new Date(p.createdAt).toLocaleDateString('es-MX')}</span></div>
        </div>
        <div class="detail-btns">
          ${_isAdmin
            ? `<button class="btn btn-outline-accent" onclick="editProduct('${p.id}')"><i class="fas fa-pen"></i> Editar</button>
               <button class="btn btn-danger" onclick="openDel('${p.id}')"><i class="fas fa-trash"></i> Eliminar</button>`
            : `<div class="readonly-msg"><i class="fas fa-eye"></i> Solo lectura — contacta al administrador para modificar.</div>`
          }
        </div>
      </div>
    </div>
  `;
  showView('detail');
}

// ================================================================
//  FORMULARIO
// ================================================================
function goAdd() {
  if (!_isAdmin) { toast('Solo el administrador puede agregar productos.','terr'); return; }
  clearForm();
  document.getElementById('formTitle').textContent = 'Agregar Producto';
  document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
  showView('add');
}

function editProduct(id) {
  if (!_isAdmin) { toast('Solo el administrador puede editar productos.','terr'); return; }
  const p = products.find(x=>x.id===id);
  if (!p) return;
  document.getElementById('editId').value  = p.id;
  document.getElementById('fName').value   = p.name;
  document.getElementById('fCat').value    = p.category;
  document.getElementById('fPrice').value  = p.price;
  document.getElementById('fStock').value  = p.stock;
  document.getElementById('fDesc').value   = p.desc;
  document.getElementById('fImg').value    = p.image || '';
  document.getElementById('fSku').value    = p.sku   || '';
  document.getElementById('formTitle').textContent = 'Editar Producto';
  document.getElementById('submitBtn').innerHTML   = '<i class="fas fa-save"></i> Guardar Cambios';
  showView('add');
}

function clearForm() {
  document.getElementById('editId').value = '';
  document.getElementById('productForm').reset();
  document.querySelectorAll('#productForm input,#productForm select,#productForm textarea')
    .forEach(el => el.classList.remove('ferr'));
}

function cancelForm() { clearForm(); showView('catalog'); }

document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!_isAdmin) { toast('Solo el administrador puede realizar esta accion.','terr'); return; }

  let valid = true;
  const checks = [
    { id:'fName',  ok: v => v.trim()!=='' },
    { id:'fCat',   ok: v => v!=='' },
    { id:'fPrice', ok: v => v!=='' && Number(v)>=0 },
    { id:'fStock', ok: v => v!=='' && Number(v)>=0 },
    { id:'fDesc',  ok: v => v.trim()!=='' },
  ];
  checks.forEach(c => {
    const el = document.getElementById(c.id);
    if (!c.ok(el.value)) { el.classList.add('ferr'); valid=false; }
    else                  { el.classList.remove('ferr'); }
  });
  if (!valid) { toast('Completa todos los campos requeridos.','terr'); return; }

  const editId = document.getElementById('editId').value;
  const data = {
    name:     document.getElementById('fName').value.trim(),
    category: document.getElementById('fCat').value,
    price:    parseFloat(document.getElementById('fPrice').value),
    stock:    parseInt(document.getElementById('fStock').value),
    desc:     document.getElementById('fDesc').value.trim(),
    image:    document.getElementById('fImg').value.trim(),
    sku:      document.getElementById('fSku').value.trim(),
  };

  if (editId) {
    const i = products.findIndex(p=>p.id===editId);
    if (i>=0) products[i] = { ...products[i], ...data };
    toast(`"${data.name}" actualizado.`);
  } else {
    products.unshift({ id:uid(), createdAt:Date.now(), ...data });
    toast(`"${data.name}" agregado.`);
  }
  saveProducts();
  clearForm();
  showView('catalog');
});

// ================================================================
//  ELIMINAR
// ================================================================
function openDel(id) {
  if (!_isAdmin) { toast('Solo el administrador puede eliminar productos.','terr'); return; }
  delId = id;
  document.getElementById('modalDel').classList.remove('hidden');
}
function closeModal() {
  delId = null;
  document.getElementById('modalDel').classList.add('hidden');
}
document.getElementById('btnConfirmDel').addEventListener('click', function() {
  if (!delId) return;
  const nombre = products.find(p=>p.id===delId)?.name || 'Producto';
  products = products.filter(p=>p.id!==delId);
  saveProducts();
  toast(`"${nombre}" eliminado.`,'terr');
  closeModal();
  showView('catalog');
});
document.getElementById('modalDel').addEventListener('click', function(e) {
  if (e.target===this) closeModal();
});

// ================================================================
//  NAV Y FILTROS
// ================================================================
document.querySelectorAll('.nav-link').forEach(lnk => {
  lnk.addEventListener('click', function(e) {
    e.preventDefault();
    const v = this.dataset.view;
    if (v==='add') goAdd();
    else showView(v);
  });
});

document.getElementById('searchInput').addEventListener('input', function() {
  renderGrid(this.value, document.getElementById('catFilter').value);
});
document.getElementById('catFilter').addEventListener('change', function() {
  renderGrid(document.getElementById('searchInput').value, this.value);
});

// ================================================================
//  INIT
// ================================================================
renderGrid();
