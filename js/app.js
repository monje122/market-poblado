// Lógica de interfaz y control de vistas para Supermercado El Poblado
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  currentMode: "store", // "store" | "admin"
  adminTab: "orders", // "orders" | "sales" | "inventory"
  currentDeliveryOption: "delivery", // "delivery" | "pickup"
  orderFilter: "all", // "all" | "pendiente" | "aprobado" | "rechazado"
  selectedCategory: "all",
  searchQuery: "",
  salesPeriod: "all",
  revenueChart: null,
  categoryChart: null,
  editingProductId: null,

  init() {
    this.bindEvents();
    this.renderHeaderRate();
    this.renderCategoriesNav();
    this.renderStoreCatalog();
    this.updateCartBadge();
    this.updatePendingBadges();

    // Escuchar cambios del store
    window.store.subscribe((event, data) => {
      this.handleStoreEvent(event, data);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  handleStoreEvent(event, data) {
    this.updateCartBadge();
    this.updatePendingBadges();

    if (this.currentMode === "admin") {
      if (this.adminTab === "inventory") {
        this.renderInventoryTable();
      } else if (this.adminTab === "sales") {
        this.renderSalesDashboard();
      } else if (this.adminTab === "orders") {
        this.renderOrdersList();
      }
    } else {
      this.renderStoreCatalog();
    }

    if (event === "rate_updated") {
      this.renderHeaderRate();
    }
  },

  bindEvents() {
    // Búsqueda en catálogo de la tienda
    const searchInput = document.getElementById("catalog-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderStoreCatalog();
      });
    }

    // Modal Tasa de Cambio
    const rateBtn = document.getElementById("btn-edit-rate");
    if (rateBtn) {
      rateBtn.addEventListener("click", () => this.openRateModal());
    }

    // Botones de Carrito
    const openCartBtn = document.getElementById("btn-open-cart");
    if (openCartBtn) {
      openCartBtn.addEventListener("click", () => this.openCartDrawer());
    }

    const closeCartBtn = document.getElementById("btn-close-cart");
    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", () => this.closeCartDrawer());
    }

    // Formulario de Agregar Producto
    const formAdd = document.getElementById("form-add-product");
    if (formAdd) {
      formAdd.addEventListener("submit", (e) => this.handleAddProductSubmit(e));
    }

    // Formulario de Editar Producto
    const formEdit = document.getElementById("form-edit-product");
    if (formEdit) {
      formEdit.addEventListener("submit", (e) => this.handleEditProductSubmit(e));
    }

    // Formulario de Checkout
    const formCheckout = document.getElementById("form-checkout");
    if (formCheckout) {
      formCheckout.addEventListener("submit", (e) => this.handleCheckoutSubmit(e));
    }

    // Botón de restablecer datos
    const btnResetData = document.getElementById("btn-reset-data");
    if (btnResetData) {
      btnResetData.addEventListener("click", () => {
        if (confirm("¿Deseas restablecer los productos a los originales de la tienda?")) {
          window.store.resetToDefaults();
          this.showToast("Catálogo restablecido con éxito", "info");
        }
      });
    }

    // Filtros de periodo en ventas
    document.querySelectorAll("[data-sales-period]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll("[data-sales-period]").forEach(b => b.classList.remove("active", "bg-emerald-600", "text-white"));
        e.currentTarget.classList.add("active", "bg-emerald-600", "text-white");
        this.salesPeriod = e.currentTarget.getAttribute("data-sales-period");
        this.renderSalesDashboard();
      });
    });
  },

  // ==========================================
  // NAVEGACIÓN: TIENDA vs. PANEL DE ADMINISTRACIÓN
  // ==========================================
  openAdmin(tab = "sales") {
    this.currentMode = "admin";
    this.closeAdminSidebar();
    const storeView = document.getElementById("view-storefront");
    const adminView = document.getElementById("view-admin");

    if (storeView) storeView.classList.add("hidden");
    if (adminView) adminView.classList.remove("hidden");

    this.switchAdminTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.showToast("Bienvenido al Panel de Administración", "info");
  },

  exitAdmin() {
    this.currentMode = "store";
    this.closeAdminSidebar();
    const storeView = document.getElementById("view-storefront");
    const adminView = document.getElementById("view-admin");

    if (adminView) adminView.classList.add("hidden");
    if (storeView) storeView.classList.remove("hidden");

    this.renderStoreCatalog();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  openAdminSidebar() {
    const sidebar = document.getElementById("admin-sidebar");
    const backdrop = document.getElementById("admin-sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("-translate-x-full");
    if (backdrop) backdrop.classList.remove("hidden");
  },

  closeAdminSidebar() {
    const sidebar = document.getElementById("admin-sidebar");
    const backdrop = document.getElementById("admin-sidebar-backdrop");
    if (sidebar) sidebar.classList.add("-translate-x-full");
    if (backdrop) backdrop.classList.add("hidden");
  },

  switchAdminTab(tab) {
    this.adminTab = tab;
    this.closeAdminSidebar();

    // Actualizar botones de navegación en el sidebar del admin
    document.querySelectorAll("[data-admin-tab]").forEach(btn => {
      const t = btn.getAttribute("data-admin-tab");
      if (t === tab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const viewOrders = document.getElementById("admin-subview-orders");
    const viewSales = document.getElementById("admin-subview-sales");
    const viewInv = document.getElementById("admin-subview-inventory");
    const titleEl = document.getElementById("admin-topbar-title");

    if (viewOrders) viewOrders.classList.add("hidden");
    if (viewSales) viewSales.classList.add("hidden");
    if (viewInv) viewInv.classList.add("hidden");

    if (tab === "orders") {
      if (viewOrders) viewOrders.classList.remove("hidden");
      if (titleEl) {
        titleEl.innerHTML = `
          <i data-lucide="truck" class="w-5 h-5 text-emerald-400"></i>
          <span>Gestión de Pedidos & Aprobación</span>
        `;
      }
      this.renderOrdersList();
    } else if (tab === "sales") {
      if (viewSales) viewSales.classList.remove("hidden");
      if (titleEl) {
        titleEl.innerHTML = `
          <i data-lucide="bar-chart-3" class="w-5 h-5 text-emerald-400"></i>
          <span>Resumen de Ventas & Analítica</span>
        `;
      }
      this.renderSalesDashboard();
    } else if (tab === "inventory") {
      if (viewInv) viewInv.classList.remove("hidden");
      if (titleEl) {
        titleEl.innerHTML = `
          <i data-lucide="boxes" class="w-5 h-5 text-emerald-400"></i>
          <span>Control de Inventario & Almacén</span>
        `;
      }
      this.renderInventoryTable();
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderHeaderRate() {
    const rateVal = document.getElementById("header-rate-val");
    const adminRate = document.getElementById("admin-rate-badge");
    const formatted = window.store.rate.toFixed(2);

    if (rateVal) rateVal.textContent = formatted;
    if (adminRate) adminRate.textContent = formatted;
  },

  renderCategoriesNav() {
    const container = document.getElementById("categories-pills");
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
      const isActive = this.selectedCategory === cat.id;
      return `
        <button 
          onclick="App.selectCategory('${cat.id}')"
          class="px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            isActive 
              ? 'bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary/20' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }">
          <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
          <span>${cat.name}</span>
        </button>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  },

  selectCategory(catId) {
    this.selectedCategory = catId;
    this.renderCategoriesNav();
    this.renderStoreCatalog();
  },

  // ==========================================
  // VISTA CLIENTE: TIENDA ONLINE / CATÁLOGO
  // ==========================================
  renderStoreCatalog() {
    const grid = document.getElementById("catalog-grid");
    const countEl = document.getElementById("catalog-count");
    if (!grid) return;

    const products = window.store.getProducts({
      category: this.selectedCategory,
      search: this.searchQuery
    });

    if (countEl) {
      countEl.textContent = `${products.length} producto${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <div class="w-16 h-16 bg-green-50 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="package-search" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-800">No se encontraron productos</h3>
          <p class="text-sm text-gray-500 mt-1">Intenta con otro término de búsqueda o selecciona otra categoría.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = products.map(p => {
      const isOutOfStock = p.stock <= 0;
      const isLowStock = p.stock > 0 && p.stock <= 8;

      let stockBadge = "";
      if (isOutOfStock) {
        stockBadge = `<span class="bg-red-500 text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow">Agotado</span>`;
      } else if (isLowStock) {
        stockBadge = `<span class="bg-amber-500 text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow">¡Quedan ${p.stock}!</span>`;
      } else {
        stockBadge = `<span class="bg-emerald-600/90 text-white text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 rounded-full shadow">Stock: ${p.stock}</span>`;
      }

      return `
        <div class="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col justify-between shadow-xs sm:shadow-sm relative group hover:shadow-md transition">
          
          <!-- Badges de cabecera -->
          <div class="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-10 pointer-events-none gap-1">
            <span class="bg-white/95 backdrop-blur-md text-brand-primary text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-gray-100 shadow-xs pointer-events-auto truncate max-w-[55%]">
              ${p.categoryName}
            </span>
            <div class="pointer-events-auto shrink-0">
              ${stockBadge}
            </div>
          </div>

          <!-- Imagen del Producto -->
          <div class="relative h-36 sm:h-48 w-full bg-white overflow-hidden p-2 sm:p-3 flex items-center justify-center border-b border-gray-100">
            <img 
              src="${p.image}" 
              alt="${p.name}" 
              loading="lazy"
              class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
              onerror="this.src='assets/products/harina-pan.jpg'"
            />
          </div>

          <!-- Información del Producto -->
          <div class="p-3 sm:p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-gray-800 text-sm sm:text-base leading-snug line-clamp-2 hover:text-brand-primary transition">
                ${p.name}
              </h3>
              <p class="hidden sm:block text-xs text-gray-500 mt-1 line-clamp-2">
                ${p.description || "Producto garantizado por Supermercado El Poblado."}
              </p>
              <div class="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                <span>Por: <strong class="text-gray-600">${p.unit}</strong></span>
                <span class="hidden sm:inline">•</span>
                <span class="hidden sm:inline">SKU: <code class="text-gray-500">${p.barcode}</code></span>
              </div>
            </div>

            <!-- Precios y Botón de Compra -->
            <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100">
              <div class="flex items-baseline justify-between mb-2 sm:mb-3">
                <div>
                  <div class="text-base sm:text-xl font-extrabold text-brand-primary leading-tight">
                    ${window.store.formatUSD(p.price)}
                  </div>
                  <div class="text-[11px] sm:text-xs font-semibold text-emerald-700">
                    ${window.store.formatVES(p.price)}
                  </div>
                </div>
              </div>

              <button 
                onclick="App.addToCart('${p.id}')"
                ${isOutOfStock ? "disabled" : ""}
                class="w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition active:scale-95 ${
                  isOutOfStock 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "btn-primary shadow-xs"
                }">
                <i data-lucide="${isOutOfStock ? 'slash' : 'shopping-cart'}" class="w-3.5 sm:w-4 h-3.5 sm:h-4"></i>
                <span class="hidden sm:inline">${isOutOfStock ? 'Agotado' : 'Agregar al carrito'}</span>
                <span class="sm:hidden">${isOutOfStock ? 'Agotado' : '+ Carrito'}</span>
              </button>
            </div>

          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  },

  // ==========================================
  // PANEL ADMIN: CONTROL DE INVENTARIO
  // ==========================================
  renderInventoryTable() {
    const tableBody = document.getElementById("inventory-table-body");
    const countTotal = document.getElementById("inv-stat-total");
    const countValue = document.getElementById("inv-stat-value");
    const countLow = document.getElementById("inv-stat-low");
    const countOut = document.getElementById("inv-stat-out");

    const allProducts = window.store.products;

    if (countTotal) countTotal.textContent = allProducts.length;
    if (countValue) {
      const totalInventoryValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
      countValue.textContent = window.store.formatUSD(totalInventoryValue);
    }
    if (countLow) {
      const lowStockCount = allProducts.filter(p => p.stock > 0 && p.stock <= 8).length;
      countLow.textContent = lowStockCount;
    }
    if (countOut) {
      const outOfStockCount = allProducts.filter(p => p.stock <= 0).length;
      countOut.textContent = outOfStockCount;
    }

    if (!tableBody) return;

    if (allProducts.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400">
            No hay productos registrados en el inventario. Haz clic en "+ Agregar Producto" para crear uno.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = allProducts.map(p => {
      let stockBadge = "";
      if (p.stock <= 0) {
        stockBadge = `<span class="bg-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-full font-bold border border-red-500/30">Agotado (0)</span>`;
      } else if (p.stock <= 8) {
        stockBadge = `<span class="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-500/30">Bajo (${p.stock})</span>`;
      } else {
        stockBadge = `<span class="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">Óptimo (${p.stock})</span>`;
      }

      const costVal = p.cost || (p.price * 0.75);
      const margin = costVal > 0 ? (((p.price - costVal) / costVal) * 100).toFixed(0) : 0;

      return `
        <tr class="hover:bg-slate-700/30 transition border-b border-slate-700/50 text-sm">
          
          <!-- Imagen y Nombre -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img 
                src="${p.image}" 
                alt="${p.name}" 
                class="w-12 h-12 rounded-xl object-contain bg-white border border-slate-600 shrink-0 p-1"
                onerror="this.src='assets/products/harina-pan.jpg'"
              />
              <div>
                <div class="font-bold text-white hover:text-emerald-400 cursor-pointer" onclick="App.openEditProductModal('${p.id}')">
                  ${p.name}
                </div>
                <div class="text-xs text-slate-400">SKU/Barras: ${p.barcode}</div>
              </div>
            </div>
          </td>

          <!-- Categoría -->
          <td class="py-3 px-4 text-slate-300 font-medium">
            <span class="inline-block bg-slate-800 text-emerald-400 text-xs px-2.5 py-1 rounded-md border border-slate-700">
              ${p.categoryName}
            </span>
          </td>

          <!-- Precio Unitario -->
          <td class="py-3 px-4">
            <div class="font-bold text-emerald-400">${window.store.formatUSD(p.price)}</div>
            <div class="text-xs text-emerald-500 font-semibold">${window.store.formatVES(p.price)}</div>
          </td>

          <!-- Costo / Margen -->
          <td class="py-3 px-4 text-slate-300">
            <div>${window.store.formatUSD(costVal)}</div>
            <div class="text-[11px] text-slate-400 font-medium">
              Margen: +${margin}%
            </div>
          </td>

          <!-- Control de Stock en Vivo con +/- -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <button 
                onclick="App.quickStockChange('${p.id}', -1)"
                title="Reducir stock"
                class="w-8 h-8 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg flex items-center justify-center font-bold text-base transition border border-slate-600 shrink-0">
                -
              </button>
              <span class="font-bold text-white min-w-[28px] text-center text-sm">${p.stock}</span>
              <button 
                onclick="App.quickStockChange('${p.id}', 1)"
                title="Aumentar stock"
                class="w-8 h-8 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg flex items-center justify-center font-bold text-base transition border border-slate-600 shrink-0">
                +
              </button>
              <span class="text-xs text-slate-400 ml-1">(${p.unit})</span>
            </div>
          </td>

          <!-- Estado -->
          <td class="py-3 px-4">
            ${stockBadge}
          </td>

          <!-- Acciones -->
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button 
                onclick="App.openEditProductModal('${p.id}')"
                class="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition" 
                title="Editar Producto">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button 
                onclick="App.deleteProduct('${p.id}')"
                class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition" 
                title="Eliminar Producto">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  },

  quickStockChange(productId, delta) {
    const prod = window.store.getProductById(productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    window.store.updateProduct(productId, { stock: newStock });
  },

  deleteProduct(productId) {
    const prod = window.store.getProductById(productId);
    if (!prod) return;
    if (confirm(`¿Estás seguro de que deseas eliminar "${prod.name}" del catálogo?`)) {
      window.store.deleteProduct(productId);
      this.showToast(`Producto "${prod.name}" eliminado`, "info");
    }
  },

  // ==========================================
  // PANEL ADMIN: RESUMEN DE VENTAS Y REPORTES
  // ==========================================
  renderSalesDashboard() {
    const stats = window.store.getSalesStats(this.salesPeriod);

    // KPI Cards
    const revenueEl = document.getElementById("stat-sales-revenue");
    const revenueVesEl = document.getElementById("stat-sales-revenue-ves");
    const countEl = document.getElementById("stat-sales-count");
    const ticketEl = document.getElementById("stat-sales-ticket");
    const itemsEl = document.getElementById("stat-sales-items");

    if (revenueEl) revenueEl.textContent = window.store.formatUSD(stats.totalRevenueUSD);
    if (revenueVesEl) revenueVesEl.textContent = window.store.formatVES(stats.totalRevenueUSD);
    if (countEl) countEl.textContent = stats.totalOrders;
    if (ticketEl) ticketEl.textContent = window.store.formatUSD(stats.averageTicketUSD);
    if (itemsEl) itemsEl.textContent = stats.totalItemsSold + " unidades";

    // Top 5 Productos
    const topContainer = document.getElementById("top-products-container");
    if (topContainer) {
      if (stats.topProducts.length === 0) {
        topContainer.innerHTML = `<div class="p-6 text-center text-slate-400">Sin datos de productos en este periodo</div>`;
      } else {
        const maxSold = Math.max(...stats.topProducts.map(p => p.unitsSold), 1);
        topContainer.innerHTML = stats.topProducts.map((p, idx) => {
          const percent = Math.round((p.unitsSold / maxSold) * 100);
          return `
            <div class="flex items-center gap-3 py-2 border-b border-slate-700/60 last:border-0">
              <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
                #${idx + 1}
              </span>
              <img src="${p.image}" class="w-9 h-9 rounded-lg object-contain bg-white border border-slate-600 shrink-0 p-0.5" onerror="this.src='assets/products/harina-pan.jpg'" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between text-xs font-bold text-white">
                  <span class="truncate">${p.name}</span>
                  <span class="text-emerald-400">${p.unitsSold} unids</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div class="bg-emerald-400 h-1.5 rounded-full" style="width: ${percent}%"></div>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">${window.store.formatUSD(p.revenueUSD)} en ventas</div>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // Tabla Historial de Órdenes
    const tableBody = document.getElementById("sales-orders-table-body");
    if (tableBody) {
      if (stats.salesList.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="py-12 text-center text-slate-400">
              No hay ventas registradas en el período seleccionado.
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = stats.salesList.map(order => {
          const dateObj = new Date(order.date);
          const dateFormatted = dateObj.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
          const timeFormatted = dateObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

          const itemsSummary = (order.items || [])
            .map(i => `${i.quantity}x ${i.name}`)
            .join(", ");

          return `
            <tr class="hover:bg-slate-700/30 transition border-b border-slate-700/50 text-sm">
              <td class="py-3 px-4 font-bold text-emerald-400">
                ${order.id}
              </td>
              <td class="py-3 px-4 text-slate-300">
                <div>${dateFormatted}</div>
                <div class="text-xs text-slate-400">${timeFormatted}</div>
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-white">${order.customer?.name || "Cliente"}</div>
                <div class="text-xs text-slate-400">${order.customer?.phone || ""}</div>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <i data-lucide="credit-card" class="w-3.5 h-3.5"></i>
                  ${order.paymentMethod}
                </span>
              </td>
              <td class="py-3 px-4 text-xs text-slate-400 max-w-xs truncate" title="${itemsSummary}">
                ${itemsSummary}
              </td>
              <td class="py-3 px-4">
                <div class="font-extrabold text-white">${window.store.formatUSD(order.totalUSD)}</div>
                <div class="text-xs text-emerald-400 font-semibold">${window.store.formatVES(order.totalUSD)}</div>
              </td>
              <td class="py-3 px-4 text-right">
                <button 
                  onclick="App.showOrderReceipt('${order.id}')"
                  class="px-2.5 py-1 bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1">
                  <i data-lucide="receipt" class="w-3.5 h-3.5"></i> Recibo
                </button>
              </td>
            </tr>
          `;
        }).join("");
      }
    }

    // Renderizar Gráficas con Chart.js
    this.renderCharts(stats);

    if (window.lucide) window.lucide.createIcons();
  },

  renderCharts(stats) {
    if (!window.Chart) return;

    // 1. Gráfica de ingresos en el tiempo
    const revCtx = document.getElementById("chart-revenue");
    if (revCtx) {
      if (this.revenueChart) {
        this.revenueChart.destroy();
      }

      this.revenueChart = new Chart(revCtx, {
        type: "bar",
        data: {
          labels: stats.timelineLabels,
          datasets: [{
            label: "Ventas ($ USD)",
            data: stats.timelineData,
            backgroundColor: "#27ae60",
            borderRadius: 8,
            hoverBackgroundColor: "#2ecc71",
            barThickness: 24
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Ingresos: $${ctx.raw.toFixed(2)} USD`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(255, 255, 255, 0.08)" },
              ticks: {
                color: "#94a3b8",
                callback: (val) => "$" + val
              }
            },
            x: {
              grid: { display: false },
              ticks: { color: "#94a3b8" }
            }
          }
        }
      });
    }

    // 2. Gráfica de ventas por categoría
    const catCtx = document.getElementById("chart-categories");
    if (catCtx) {
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      const catLabels = [];
      const catData = [];
      const catColors = [
        "#10b981", "#3b82f6", "#f59e0b", "#ec4899", 
        "#8b5cf6", "#06b6d4", "#14b8a6", "#64748b"
      ];

      CATEGORIES.filter(c => c.id !== "all").forEach(cat => {
        const val = stats.categorySalesMap[cat.id] || 0;
        if (val > 0) {
          catLabels.push(cat.name);
          catData.push(parseFloat(val.toFixed(2)));
        }
      });

      if (catData.length === 0) {
        catLabels.push("Sin ventas");
        catData.push(1);
      }

      this.categoryChart = new Chart(catCtx, {
        type: "doughnut",
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: catColors.slice(0, catData.length),
            borderWidth: 2,
            borderColor: "#1e293b"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#94a3b8",
                boxWidth: 12,
                font: { size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: $${ctx.raw.toFixed(2)} USD`
              }
            }
          },
          cutout: "68%"
        }
      });
    }
  },

  exportSalesCSV() {
    const sales = window.store.sales;
    if (sales.length === 0) {
      this.showToast("No hay ventas para exportar", "warning");
      return;
    }

    let csv = "ID Pedido,Fecha,Cliente,Telefono,Metodo de Pago,Total USD,Total Bs,Estado\n";
    sales.forEach(s => {
      csv += `"${s.id}","${s.date}","${s.customer?.name || ''}","${s.customer?.phone || ''}","${s.paymentMethod}","${s.totalUSD.toFixed(2)}","${s.totalVES.toFixed(2)}","${s.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Ventas_Supermercado_El_Poblado_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    this.showToast("Reporte CSV descargado con éxito", "success");
  },

  // ==========================================
  // CARRITO Y CHECKOUT (CLIENTES)
  // ==========================================
  addToCart(productId, qty = 1) {
    const res = window.store.addToCart(productId, qty);
    if (res.success) {
      this.showToast(res.message, "success");
      this.openCartDrawer();
    } else {
      this.showToast(res.message, "warning");
    }
  },

  updateCartBadge() {
    const badge = document.getElementById("cart-badge-count");
    const mobileBottomBadge = document.getElementById("mobile-bottom-cart-badge");
    const totals = window.store.getCartTotals();

    if (badge) {
      badge.textContent = totals.count;
      if (totals.count > 0) {
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }

    if (mobileBottomBadge) {
      mobileBottomBadge.textContent = totals.count;
      if (totals.count > 0) {
        mobileBottomBadge.classList.remove("hidden");
      } else {
        mobileBottomBadge.classList.add("hidden");
      }
    }
  },

  openCartDrawer() {
    this.renderCartDrawerItems();
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-backdrop");
    if (drawer && backdrop) {
      backdrop.classList.remove("hidden");
      setTimeout(() => {
        drawer.classList.remove("translate-x-full");
      }, 10);
    }
  },

  closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-backdrop");
    if (drawer && backdrop) {
      drawer.classList.add("translate-x-full");
      setTimeout(() => {
        backdrop.classList.add("hidden");
      }, 300);
    }
  },

  renderCartDrawerItems() {
    const container = document.getElementById("cart-items-container");
    const subtotalUsdEl = document.getElementById("cart-subtotal-usd");
    const subtotalVesEl = document.getElementById("cart-subtotal-ves");
    const checkoutBtn = document.getElementById("btn-go-checkout");
    const totals = window.store.getCartTotals();

    if (subtotalUsdEl) subtotalUsdEl.textContent = window.store.formatUSD(totals.totalUSD);
    if (subtotalVesEl) subtotalVesEl.textContent = window.store.formatVES(totals.totalUSD);

    if (checkoutBtn) {
      checkoutBtn.disabled = totals.count === 0;
      if (totals.count === 0) {
        checkoutBtn.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        checkoutBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }

    if (!container) return;

    if (window.store.cart.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-gray-400">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <i data-lucide="shopping-cart" class="w-8 h-8 text-gray-300"></i>
          </div>
          <p class="font-bold text-gray-600">Tu carrito está vacío</p>
          <p class="text-xs text-gray-400 mt-1">Explora nuestro catálogo y agrega lo que necesites.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = window.store.cart.map(item => `
      <div class="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="w-14 h-14 rounded-xl object-contain bg-white shrink-0 border border-gray-200 p-1"
          onerror="this.src='assets/products/harina-pan.jpg'"
        />
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs text-gray-800 truncate">${item.name}</h4>
          <div class="text-xs text-brand-primary font-bold mt-0.5">
            ${window.store.formatUSD(item.price)} 
            <span class="text-[11px] font-normal text-gray-400">/ ${item.unit}</span>
          </div>

          <!-- Selector de cantidad -->
          <div class="flex items-center gap-2 mt-2">
            <div class="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden">
              <button 
                onclick="window.store.updateCartQty('${item.id}', ${item.quantity - 1})"
                class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-xs">
                -
              </button>
              <span class="px-2 text-xs font-bold text-gray-800">${item.quantity}</span>
              <button 
                onclick="window.store.updateCartQty('${item.id}', ${item.quantity + 1})"
                class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-xs">
                +
              </button>
            </div>
            
            <button 
              onclick="window.store.removeFromCart('${item.id}')"
              class="text-red-500 hover:text-red-700 p-1 text-xs transition" 
              title="Quitar">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="text-right shrink-0">
          <div class="font-bold text-sm text-gray-900">${window.store.formatUSD(item.subtotal)}</div>
          <div class="text-[11px] font-medium text-emerald-700">${window.store.formatVES(item.subtotal)}</div>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  },

  toggleDeliveryOption(type) {
    this.currentDeliveryOption = type;
    const deliveryFields = document.getElementById("checkout-delivery-fields");
    const pickupInfo = document.getElementById("checkout-pickup-info");
    const addressInput = document.getElementById("checkout-customer-address");
    const deliveryRow = document.getElementById("checkout-delivery-row");
    
    const deliveryLabel = document.getElementById("option-delivery-label");
    const pickupLabel = document.getElementById("option-pickup-label");
    const deliveryCheck = document.getElementById("option-delivery-check");
    const pickupCheck = document.getElementById("option-pickup-check");

    if (type === "delivery") {
      if (deliveryFields) deliveryFields.classList.remove("hidden");
      if (pickupInfo) pickupInfo.classList.add("hidden");
      if (addressInput) addressInput.required = true;
      if (deliveryRow) deliveryRow.classList.remove("hidden");

      if (deliveryLabel) {
        deliveryLabel.classList.add("border-brand-primary", "bg-emerald-50/50");
        deliveryLabel.classList.remove("border-gray-200", "bg-white");
      }
      if (pickupLabel) {
        pickupLabel.classList.remove("border-brand-primary", "bg-emerald-50/50");
        pickupLabel.classList.add("border-gray-200", "bg-white");
      }
      if (deliveryCheck) deliveryCheck.classList.remove("hidden");
      if (pickupCheck) pickupCheck.classList.add("hidden");
    } else {
      if (deliveryFields) deliveryFields.classList.add("hidden");
      if (pickupInfo) pickupInfo.classList.remove("hidden");
      if (addressInput) addressInput.required = false;
      if (deliveryRow) deliveryRow.classList.add("hidden");

      if (pickupLabel) {
        pickupLabel.classList.add("border-brand-primary", "bg-emerald-50/50");
        pickupLabel.classList.remove("border-gray-200", "bg-white");
      }
      if (deliveryLabel) {
        deliveryLabel.classList.remove("border-brand-primary", "bg-emerald-50/50");
        deliveryLabel.classList.add("border-gray-200", "bg-white");
      }
      if (pickupCheck) pickupCheck.classList.remove("hidden");
      if (deliveryCheck) deliveryCheck.classList.add("hidden");
    }

    this.updateCheckoutTotals();
  },

  updateCheckoutTotals() {
    const totals = window.store.getCartTotals(this.currentDeliveryOption);
    const subtotalEl = document.getElementById("checkout-subtotal-usd");
    const feeEl = document.getElementById("checkout-delivery-fee-usd");
    const totalUsdEl = document.getElementById("checkout-total-usd");
    const totalVesEl = document.getElementById("checkout-total-ves");

    if (subtotalEl) subtotalEl.textContent = window.store.formatUSD(totals.subtotalUSD);
    if (feeEl) feeEl.textContent = this.currentDeliveryOption === "delivery" ? `+${window.store.formatUSD(totals.deliveryFeeUSD)}` : "$0.00";
    if (totalUsdEl) totalUsdEl.textContent = window.store.formatUSD(totals.totalUSD);
    if (totalVesEl) totalVesEl.textContent = window.store.formatVES(totals.totalUSD);
  },

  openCheckoutModal() {
    this.closeCartDrawer();
    const modal = document.getElementById("modal-checkout");
    const summaryItems = document.getElementById("checkout-summary-items");

    if (summaryItems) {
      summaryItems.innerHTML = window.store.cart.map(i => `
        <div class="flex justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
          <span class="text-gray-700">${i.quantity}x ${i.name}</span>
          <span class="font-bold text-gray-900">${window.store.formatUSD(i.subtotal)}</span>
        </div>
      `).join("");
    }

    this.toggleDeliveryOption(this.currentDeliveryOption || "delivery");

    if (modal) modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  closeCheckoutModal() {
    const modal = document.getElementById("modal-checkout");
    if (modal) modal.classList.add("hidden");
  },

  handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const isDelivery = this.currentDeliveryOption === "delivery";
    
    const orderData = {
      customerName: form.customerName.value.trim(),
      customerPhone: form.customerPhone.value.trim(),
      deliveryType: this.currentDeliveryOption,
      customerAddress: isDelivery ? form.customerAddress.value.trim() : "Retiro en Supermercado",
      customerReference: isDelivery && form.customerReference ? form.customerReference.value.trim() : "",
      customerNotes: form.customerNotes ? form.customerNotes.value.trim() : "",
      paymentMethod: form.paymentMethod.value
    };

    const res = window.store.createOrder(orderData);
    if (!res.success) {
      this.showToast(res.message, "danger");
      return;
    }

    const order = res.order;
    this.closeCheckoutModal();
    form.reset();

    // 1. Generar texto formateado para WhatsApp al número +58 412-3714136
    const whatsappText = this.buildWhatsAppMessage(order);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=584123714136&text=${encodeURIComponent(whatsappText)}`;

    // 2. Intentar abrir WhatsApp automáticamente
    try {
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.warn("Popup bloqueado para WhatsApp:", err);
    }

    // 3. Abrir modal de éxito y enlace directo a WhatsApp
    this.showOrderSuccessModal(order, whatsappUrl);
    this.showToast(`¡Pedido #${order.id} registrado! Enviando a WhatsApp (+58 412-3714136)...`, "success");
    this.updatePendingBadges();
  },

  buildWhatsAppMessage(order) {
    const isDelivery = order.deliveryType === "delivery";
    const fecha = new Date(order.date).toLocaleDateString("es-VE");
    const hora = new Date(order.date).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

    let lines = [
      `🛒 *NUEVO PEDIDO - SUPERMERCADO EL POBLADO*`,
      `━━━━━━━━━━━━━━━━━━`,
      `🆔 *Código de Pedido:* #${order.id}`,
      `📅 *Fecha:* ${fecha} - ${hora}`,
      ``,
      `👤 *DATOS DEL CLIENTE:*`,
      `• *Nombre:* ${order.customer.name}`,
      `• *Teléfono:* ${order.customer.phone}`,
      `• *Modalidad:* ${isDelivery ? "🛵 Envío a Domicilio (Delivery)" : "🏬 Retiro en Supermercado"}`,
      isDelivery ? `• *Dirección:* ${order.customer.address}` : null,
      isDelivery && order.customer.reference ? `• *Punto de Referencia:* ${order.customer.reference}` : null,
      `• *Método de Pago:* ${order.paymentMethod}`,
      order.customer.notes ? `• *Notas:* ${order.customer.notes}` : null,
      ``,
      `📦 *PRODUCTOS:*`
    ].filter(Boolean);

    order.items.forEach(item => {
      lines.push(`• ${item.quantity}x ${item.name} (${window.store.formatUSD(item.subtotal)} / ${window.store.formatVES(item.subtotal)})`);
    });

    lines.push(
      `━━━━━━━━━━━━━━━━━━`,
      `💰 *Subtotal Productos:* ${window.store.formatUSD(order.subtotalUSD)} (${window.store.formatVES(order.subtotalUSD)})`
    );

    if (order.deliveryFeeUSD > 0) {
      lines.push(`🛵 *Costo Delivery:* ${window.store.formatUSD(order.deliveryFeeUSD)} (${window.store.formatVES(order.deliveryFeeUSD)})`);
    }

    lines.push(
      `💵 *TOTAL A PAGAR:* ${window.store.formatUSD(order.totalUSD)} (${window.store.formatVES(order.totalUSD)})`,
      `*(Tasa del día: ${order.exchangeRate.toFixed(2)} Bs/$)*`,
      `━━━━━━━━━━━━━━━━━━`,
      `⏳ *Estado:* Pendiente por Aprobación en Tienda.`,
      `_¡Hola! He generado mi pedido desde la tienda online. Por favor confirmarme la disponibilidad para coordinar el despacho._`
    );

    return lines.join("\n");
  },

  showOrderSuccessModal(order, whatsappUrl) {
    const modal = document.getElementById("modal-order-success");
    const codeEl = document.getElementById("order-success-code");
    const detailsEl = document.getElementById("order-success-details");
    const btnWhatsApp = document.getElementById("btn-reopen-whatsapp");

    if (codeEl) codeEl.textContent = `Código: #${order.id}`;
    if (btnWhatsApp) btnWhatsApp.href = whatsappUrl;

    if (detailsEl) {
      const isDelivery = order.deliveryType === "delivery";
      detailsEl.innerHTML = `
        <div class="flex justify-between border-b border-gray-200 pb-1.5">
          <span class="text-gray-500">Cliente:</span>
          <strong class="text-gray-800">${order.customer.name}</strong>
        </div>
        <div class="flex justify-between border-b border-gray-200 pb-1.5">
          <span class="text-gray-500">Modalidad:</span>
          <span class="font-bold text-brand-primary">${isDelivery ? '🛵 Envío a Domicilio' : '🏬 Retiro en Tienda'}</span>
        </div>
        <div class="flex justify-between border-b border-gray-200 pb-1.5">
          <span class="text-gray-500">Total a Pagar:</span>
          <strong class="text-brand-primary text-sm">${window.store.formatUSD(order.totalUSD)} (${window.store.formatVES(order.totalUSD)})</strong>
        </div>
        <div class="pt-1 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
          Tu pedido quedó registrado en el sistema. El administrador del supermercado lo aprobará en el Panel Admin y se descontará el stock en almacén.
        </div>
      `;
    }

    if (modal) modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  closeOrderSuccessModal() {
    const modal = document.getElementById("modal-order-success");
    if (modal) modal.classList.add("hidden");
  },

  renderOrdersList() {
    const container = document.getElementById("admin-orders-list");
    const statPending = document.getElementById("stat-orders-pending");
    const statApproved = document.getElementById("stat-orders-approved");
    const statDelivery = document.getElementById("stat-orders-delivery");
    const statPendingAmount = document.getElementById("stat-orders-pending-amount");
    const statPendingAmountVes = document.getElementById("stat-orders-pending-amount-ves");

    const allOrders = window.store.sales;
    const pendingOrders = allOrders.filter(o => o.status === "pendiente");
    const approvedOrders = allOrders.filter(o => o.status === "aprobado" || o.status === "completada");
    const deliveryOrders = allOrders.filter(o => o.deliveryType === "delivery");
    const pendingTotalUSD = pendingOrders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);

    if (statPending) statPending.textContent = pendingOrders.length;
    if (statApproved) statApproved.textContent = approvedOrders.length;
    if (statDelivery) statDelivery.textContent = deliveryOrders.length;
    if (statPendingAmount) statPendingAmount.textContent = window.store.formatUSD(pendingTotalUSD);
    if (statPendingAmountVes) statPendingAmountVes.textContent = window.store.formatVES(pendingTotalUSD);

    this.updatePendingBadges();

    // Actualizar botones de filtro
    document.querySelectorAll("[data-order-filter]").forEach(btn => {
      const f = btn.getAttribute("data-order-filter");
      if (f === this.orderFilter) {
        btn.className = "px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 font-bold shadow-xs active";
      } else {
        btn.className = "px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition";
      }
    });

    let displayOrders = [...allOrders];
    if (this.orderFilter !== "all") {
      displayOrders = displayOrders.filter(o => {
        if (this.orderFilter === "aprobado") {
          return o.status === "aprobado" || o.status === "completada";
        }
        return o.status === this.orderFilter;
      });
    }

    if (!container) return;

    if (displayOrders.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 p-8">
          <div class="w-12 h-12 rounded-xl bg-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="inbox" class="w-6 h-6"></i>
          </div>
          <h4 class="text-white font-bold text-base">No hay pedidos en esta categoría</h4>
          <p class="text-xs text-slate-400 mt-1">Cuando los clientes completen compras con WhatsApp aparecerán aquí para su aprobación.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = displayOrders.map(order => {
      const isPending = order.status === "pendiente";
      const isApproved = order.status === "aprobado" || order.status === "completada";
      const isDelivery = order.deliveryType === "delivery";

      const dateFormatted = new Date(order.date).toLocaleString("es-VE", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      let statusBadge = "";
      if (isPending) {
        statusBadge = `
          <span class="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/40 animate-pulse">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Pendiente por Aprobar</span>
          </span>
        `;
      } else if (isApproved) {
        statusBadge = `
          <span class="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40">
            <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Aprobado • Stock Descontado</span>
          </span>
        `;
      } else {
        statusBadge = `
          <span class="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full border border-red-500/40">
            <i data-lucide="x-circle" class="w-3.5 h-3.5 text-red-400"></i>
            <span>Rechazado • Sin descuento</span>
          </span>
        `;
      }

      // Comprobar si hay stock suficiente en almacén para cada producto
      let stockWarningHtml = "";
      if (isPending) {
        const missingItems = [];
        order.items.forEach(it => {
          const prod = window.store.getProductById(it.id);
          if (!prod || prod.stock < it.quantity) {
            missingItems.push(`${it.name} (Disp: ${prod ? prod.stock : 0})`);
          }
        });

        if (missingItems.length > 0) {
          stockWarningHtml = `
            <div class="mt-3 p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i>
              <span>Alerta de stock insuficiente en almacén para: ${missingItems.join(", ")}</span>
            </div>
          `;
        }
      }

      return `
        <div class="bg-slate-800/80 rounded-2xl border ${isPending ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-slate-700'} p-4 sm:p-5 transition">
          
          <!-- Encabezado de la Tarjeta del Pedido -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-700/80 gap-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl ${isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} flex items-center justify-center font-black text-sm">
                ${isDelivery ? '<i data-lucide="truck" class="w-5 h-5"></i>' : '<i data-lucide="store" class="w-5 h-5"></i>'}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-black text-white text-base">#${order.id}</span>
                  <span class="text-xs ${isDelivery ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700 text-slate-300'} px-2.5 py-0.5 rounded-md font-bold">
                    ${isDelivery ? '🛵 Delivery (+ $2.00)' : '🏬 Retiro en Tienda'}
                  </span>
                </div>
                <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                  <span>${dateFormatted}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              ${statusBadge}
            </div>
          </div>

          <!-- Información del Cliente y Entrega -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-3.5 border-b border-slate-700/60 text-xs">
            <div>
              <div class="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Datos del Cliente</div>
              <div class="font-bold text-white text-sm">${order.customer.name}</div>
              <div class="text-slate-300 flex items-center gap-1.5 mt-0.5">
                <i data-lucide="phone" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>${order.customer.phone}</span>
                <button 
                  onclick="App.openWhatsAppChat('${order.customer.phone}', '${order.id}', '${order.customer.name}')" 
                  class="ml-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1">
                  <i data-lucide="message-circle" class="w-3 h-3"></i> Chatear
                </button>
              </div>
              <div class="text-slate-400 mt-1">
                Método de pago: <strong class="text-slate-200">${order.paymentMethod}</strong>
              </div>
            </div>

            <div>
              <div class="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Destino & Indicaciones</div>
              ${isDelivery ? `
                <div class="text-slate-200 font-medium flex items-start gap-1.5">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5"></i>
                  <span>${order.customer.address}</span>
                </div>
                ${order.customer.reference ? `
                  <div class="text-slate-400 mt-1 pl-5">
                    Ref: <em>${order.customer.reference}</em>
                  </div>
                ` : ''}
              ` : `
                <div class="text-slate-300 flex items-center gap-1.5">
                  <i data-lucide="store" class="w-3.5 h-3.5 text-emerald-400"></i>
                  <span>Retiro directo en sede del supermercado</span>
                </div>
              `}
              ${order.customer.notes ? `
                <div class="text-slate-400 mt-1 text-[11px] bg-slate-900/40 p-2 rounded-lg border border-slate-700/60">
                  Nota: <em>${order.customer.notes}</em>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Artículos del Pedido -->
          <div class="py-3 text-xs">
            <div class="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">Artículos Solicitados</div>
            <div class="space-y-1.5">
              ${order.items.map(it => {
                const p = window.store.getProductById(it.id);
                const currentStock = p ? p.stock : 0;
                return `
                  <div class="flex items-center justify-between bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                        ${it.quantity}x
                      </span>
                      <span class="text-slate-200 font-medium">${it.name}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      ${isPending ? `
                        <span class="text-[10px] ${currentStock >= it.quantity ? 'text-emerald-400' : 'text-red-400 font-bold'}">
                          Almacén: ${currentStock} disp.
                        </span>
                      ` : ''}
                      <span class="font-bold text-white">${window.store.formatUSD(it.subtotal)}</span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>

            ${stockWarningHtml}
          </div>

          <!-- Pie con Totales y Botones de Aprobación -->
          <div class="pt-3.5 mt-2 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">
                ${order.deliveryFeeUSD > 0 ? `Subtotal: ${window.store.formatUSD(order.subtotalUSD)} + Delivery: ${window.store.formatUSD(order.deliveryFeeUSD)} • ` : ''}
                Total a Cobrar:
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-black text-emerald-400">${window.store.formatUSD(order.totalUSD)}</span>
                <span class="text-xs font-bold text-emerald-500">${window.store.formatVES(order.totalUSD)}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap">
              ${isPending ? `
                <button 
                  onclick="App.approveOrder('${order.id}')"
                  class="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 active:scale-95 transition">
                  <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                  <span>✔ Aprobar Pedido y Descontar Stock</span>
                </button>

                <button 
                  onclick="App.rejectOrder('${order.id}')"
                  class="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                  <span>Rechazar</span>
                </button>
              ` : `
                <button 
                  onclick="App.showOrderReceipt('${order.id}')"
                  class="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                  <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                  <span>Ver Recibo / Factura</span>
                </button>
              `}
              
              <button 
                onclick="App.openWhatsAppChat('${order.customer.phone}', '${order.id}', '${order.customer.name}')"
                class="px-3.5 py-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  },

  approveOrder(orderId) {
    if (!confirm(`¿Confirmas la aprobación del pedido #${orderId}?\n\nAl aprobarlo, el sistema descontará automáticamente del stock en almacén los artículos solicitados.`)) {
      return;
    }

    const res = window.store.approveOrder(orderId);
    if (res.success) {
      this.showToast(res.message, "success");
      this.renderOrdersList();
      this.updatePendingBadges();
      if (this.adminTab === "inventory") {
        this.renderInventoryTable();
      }
    } else {
      this.showToast(res.message, "danger");
    }
  },

  rejectOrder(orderId) {
    if (!confirm(`¿Deseas marcar como rechazado el pedido #${orderId}?\n\nEl stock en almacén NO será modificado.`)) {
      return;
    }

    const res = window.store.rejectOrder(orderId);
    if (res.success) {
      this.showToast(res.message, "info");
      this.renderOrdersList();
      this.updatePendingBadges();
    }
  },

  filterOrders(filter) {
    this.orderFilter = filter;
    this.renderOrdersList();
  },

  updatePendingBadges() {
    const pendingCount = window.store.getPendingOrdersCount();
    
    // Sidebar admin
    const sidebarBadge = document.getElementById("admin-sidebar-pending-badge");
    if (sidebarBadge) {
      sidebarBadge.textContent = pendingCount;
      if (pendingCount > 0) sidebarBadge.classList.remove("hidden");
      else sidebarBadge.classList.add("hidden");
    }

    // Header tienda
    const headerBadge = document.getElementById("header-admin-pending-badge");
    if (headerBadge) {
      headerBadge.textContent = pendingCount;
      if (pendingCount > 0) headerBadge.classList.remove("hidden");
      else headerBadge.classList.add("hidden");
    }

    // Bottom mobile nav
    const mobileBadge = document.getElementById("mobile-admin-pending-badge");
    if (mobileBadge) {
      mobileBadge.textContent = pendingCount;
      if (pendingCount > 0) mobileBadge.classList.remove("hidden");
      else mobileBadge.classList.add("hidden");
    }

    // Badge en subview orders
    const ordersAlertBadge = document.getElementById("orders-pending-alert-badge");
    if (ordersAlertBadge) {
      ordersAlertBadge.textContent = `${pendingCount} por aprobar`;
      if (pendingCount > 0) ordersAlertBadge.classList.remove("hidden");
      else ordersAlertBadge.classList.add("hidden");
    }
  },

  openWhatsAppChat(phone, orderId, customerName) {
    const cleanPhone = (phone || "").replace(/\D/g, "");
    const targetPhone = cleanPhone.startsWith("0") ? "58" + cleanPhone.slice(1) : (cleanPhone || "584123714136");
    const msg = `¡Hola ${customerName}! Te escribimos de Supermercado El Poblado respecto a tu pedido #${orderId}.`;
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  },

  // ==========================================
  // RECIBO / FACTURA DIGITAL IMPRIMIBLE
  // ==========================================
  showOrderReceipt(orderId) {
    const order = window.store.sales.find(s => s.id === orderId);
    if (!order) return;

    const modal = document.getElementById("modal-receipt");
    const receiptContainer = document.getElementById("printable-receipt");
    if (!modal || !receiptContainer) return;

    const dateFormatted = new Date(order.date).toLocaleString("es-VE", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    receiptContainer.innerHTML = `
      <div class="max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-800 font-sans">
        
        <!-- Cabecera -->
        <div class="text-center pb-4 border-b border-dashed border-gray-300">
          <div class="text-2xl font-extrabold text-brand-primary logo-script leading-none">Supermercado</div>
          <div class="text-sm font-black text-brand-primary logo-sub tracking-widest mt-0.5">EL POBLADO</div>
          <div class="text-[11px] text-gray-500 mt-1">RIF: J-40892110-3 • Calidad y Frescura Garantizada</div>
          <div class="text-[11px] text-gray-500">Horario: Lun-Sáb 8am-10pm | Dom 10am-8pm</div>
        </div>

        <!-- Datos del Pedido -->
        <div class="py-3 text-xs border-b border-dashed border-gray-300 space-y-1">
          <div class="flex justify-between">
            <span class="text-gray-500">N° Factura:</span>
            <span class="font-bold text-gray-800">${order.id}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Fecha y Hora:</span>
            <span>${dateFormatted}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Cliente:</span>
            <span class="font-bold">${order.customer?.name || 'Cliente'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Teléfono:</span>
            <span>${order.customer?.phone || 'No especificado'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Modalidad:</span>
            <span class="font-bold text-gray-800">${order.deliveryType === 'delivery' ? '🛵 Envío a Domicilio' : '🏬 Retiro en Tienda'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Estado:</span>
            <span class="font-bold ${order.status === 'aprobado' ? 'text-emerald-700' : (order.status === 'pendiente' ? 'text-amber-700' : 'text-red-700')}">
              ${order.status === 'aprobado' ? '✔ Aprobado • Stock Descontado' : (order.status === 'pendiente' ? '⏳ Pendiente de Aprobación' : '✖ Rechazado')}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Método de Pago:</span>
            <span class="font-bold text-brand-primary">${order.paymentMethod}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Tasa de Cambio:</span>
            <span>Bs. ${order.exchangeRate.toFixed(2)} / $</span>
          </div>
        </div>

        <!-- Detalle de Productos -->
        <div class="py-3 text-xs border-b border-dashed border-gray-300">
          <table class="w-full">
            <thead>
              <tr class="text-gray-400 border-b border-gray-100">
                <th class="text-left pb-1 font-semibold">Cant. Producto</th>
                <th class="text-right pb-1 font-semibold">Precio</th>
                <th class="text-right pb-1 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(i => `
                <tr class="border-b border-gray-50">
                  <td class="py-1.5 text-gray-800">
                    <span class="font-bold">${i.quantity}x</span> ${i.name}
                  </td>
                  <td class="py-1.5 text-right text-gray-600">$${i.price.toFixed(2)}</td>
                  <td class="py-1.5 text-right font-bold text-gray-900">$${i.subtotal.toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div class="pt-3 pb-2 text-xs space-y-1">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal Productos:</span>
            <span>$${order.subtotalUSD.toFixed(2)}</span>
          </div>
          ${order.deliveryFeeUSD > 0 ? `
            <div class="flex justify-between text-emerald-700">
              <span>Costo de Delivery:</span>
              <span>+$${order.deliveryFeeUSD.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-base font-extrabold text-brand-primary pt-2 border-t border-gray-200">
            <span>TOTAL:</span>
            <span>$${order.totalUSD.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-emerald-700">
            <span>TOTAL PAGADO (Bs.):</span>
            <span>Bs. ${order.totalVES.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div class="text-center pt-4 text-[11px] text-gray-400 border-t border-dashed border-gray-300 mt-3">
          ¡Gracias por su compra en Supermercado El Poblado!<br />
          Conservar este recibo para cualquier reclamo.
        </div>

      </div>
    `;

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  closeReceiptModal() {
    const modal = document.getElementById("modal-receipt");
    if (modal) modal.classList.add("hidden");
  },

  printReceipt() {
    window.print();
  },

  // ==========================================
  // MODAL: AGREGAR NUEVO PRODUCTO
  // ==========================================
  openAddProductModal() {
    const modal = document.getElementById("modal-add-product");
    const selectPreset = document.getElementById("add-preset-selector");

    if (selectPreset) {
      selectPreset.innerHTML = IMAGE_PRESETS.map((p) => `
        <button 
          type="button" 
          onclick="App.setAddImagePreset('${p.url}')"
          class="px-2.5 py-1 text-xs rounded-lg bg-gray-100 hover:bg-brand-mint text-gray-700 hover:text-brand-primary font-medium border border-gray-200 transition">
          ${p.label}
        </button>
      `).join("");
    }

    if (modal) modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  setAddImagePreset(url) {
    const input = document.getElementById("add-product-image");
    if (input) input.value = url;
  },

  closeAddProductModal() {
    const modal = document.getElementById("modal-add-product");
    if (modal) modal.classList.add("hidden");
  },

  handleAddProductSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const productData = {
      name: form.name.value.trim(),
      category: form.category.value,
      price: parseFloat(form.price.value) || 0,
      cost: parseFloat(form.cost.value) || (parseFloat(form.price.value) * 0.75),
      stock: parseInt(form.stock.value, 10) || 0,
      unit: form.unit.value,
      barcode: form.barcode.value.trim() || String(Math.floor(1000000000 + Math.random() * 9000000000)),
      image: form.image.value.trim() || "assets/products/harina-pan.jpg",
      description: form.description.value.trim()
    };

    const newProd = window.store.addProduct(productData);
    this.closeAddProductModal();
    form.reset();
    this.showToast(`Producto "${newProd.name}" creado con éxito`, "success");

    // Si está en inventario del admin, refresca la tabla
    if (this.currentMode === "admin" && this.adminTab === "inventory") {
      this.renderInventoryTable();
    }
  },

  // ==========================================
  // MODAL: EDITAR PRODUCTO
  // ==========================================
  openEditProductModal(productId) {
    const product = window.store.getProductById(productId);
    if (!product) return;

    this.editingProductId = productId;
    const modal = document.getElementById("modal-edit-product");
    const form = document.getElementById("form-edit-product");

    if (form) {
      form.editName.value = product.name;
      form.editCategory.value = product.category;
      form.editPrice.value = product.price;
      form.editCost.value = product.cost || (product.price * 0.75).toFixed(2);
      form.editStock.value = product.stock;
      form.editUnit.value = product.unit;
      form.editBarcode.value = product.barcode;
      form.editImage.value = product.image;
      form.editDescription.value = product.description || "";
    }

    if (modal) modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  closeEditProductModal() {
    this.editingProductId = null;
    const modal = document.getElementById("modal-edit-product");
    if (modal) modal.classList.add("hidden");
  },

  handleEditProductSubmit(e) {
    e.preventDefault();
    if (!this.editingProductId) return;

    const form = e.target;
    const updatedData = {
      name: form.editName.value.trim(),
      category: form.editCategory.value,
      price: parseFloat(form.editPrice.value) || 0,
      cost: parseFloat(form.editCost.value) || 0,
      stock: parseInt(form.editStock.value, 10) || 0,
      unit: form.editUnit.value,
      barcode: form.editBarcode.value.trim(),
      image: form.editImage.value.trim(),
      description: form.editDescription.value.trim()
    };

    const updated = window.store.updateProduct(this.editingProductId, updatedData);
    this.closeEditProductModal();
    if (updated) {
      this.showToast(`Producto "${updated.name}" actualizado con éxito`, "success");
      if (this.currentMode === "admin" && this.adminTab === "inventory") {
        this.renderInventoryTable();
      }
    }
  },

  // ==========================================
  // MODAL: TASA DE CAMBIO
  // ==========================================
  openRateModal() {
    const modal = document.getElementById("modal-rate");
    const input = document.getElementById("input-exchange-rate");
    if (input) input.value = window.store.rate.toFixed(2);
    if (modal) modal.classList.remove("hidden");
  },

  closeRateModal() {
    const modal = document.getElementById("modal-rate");
    if (modal) modal.classList.add("hidden");
  },

  saveRate() {
    const input = document.getElementById("input-exchange-rate");
    if (input && input.value) {
      const newRate = parseFloat(input.value);
      if (newRate > 0) {
        window.store.setRate(newRate);
        this.closeRateModal();
        this.showToast(`Tasa de cambio actualizada a Bs. ${newRate.toFixed(2)}`, "success");
      }
    }
  },

  // ==========================================
  // NOTIFICACIONES TOAST
  // ==========================================
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const colors = {
      success: "bg-emerald-600 text-white",
      danger: "bg-red-600 text-white",
      warning: "bg-amber-500 text-white",
      info: "bg-brand-primary text-white"
    };

    const icons = {
      success: "check-circle",
      danger: "alert-circle",
      warning: "alert-triangle",
      info: "info"
    };

    const toast = document.createElement("div");
    toast.className = `toast px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="w-5 h-5 shrink-0"></i>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.App = App;
