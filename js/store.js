// Gestor de Estado y Persistencia para Supermercado El Poblado
const STORAGE_KEYS = {
  PRODUCTS: "poblado_products_v4",
  SALES: "poblado_sales_v4",
  CART: "poblado_cart_v4",
  RATE: "poblado_exchange_rate_v1"
};

class Store {
  constructor() {
    this.rate = this.loadRate();
    this.products = this.loadProducts();
    this.sales = this.loadSales();
    this.cart = this.loadCart();
    this.listeners = [];
  }

  // Subscripción a cambios
  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify(event, data) {
    this.listeners.forEach(fn => fn(event, data));
  }

  // Tasa de cambio
  loadRate() {
    const saved = localStorage.getItem(STORAGE_KEYS.RATE);
    return saved ? parseFloat(saved) : 53.50;
  }

  setRate(newRate) {
    this.rate = parseFloat(newRate) || 53.50;
    localStorage.setItem(STORAGE_KEYS.RATE, this.rate.toString());
    this.notify("rate_updated", this.rate);
  }

  formatUSD(val) {
    return "$" + Number(val || 0).toFixed(2);
  }

  formatVES(valUSD) {
    const ves = Number(valUSD || 0) * this.rate;
    return "Bs. " + ves.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // --- PRODUCTOS ---
  loadProducts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error al cargar productos de localStorage:", e);
    }
    // Si no hay datos, inicializamos con los datos por defecto
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return [...INITIAL_PRODUCTS];
  }

  saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    this.notify("products_changed", this.products);
  }

  getProducts(filter = {}) {
    let result = [...this.products];
    if (filter.category && filter.category !== "all") {
      result = result.filter(p => p.category === filter.category);
    }
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    if (filter.stockOnly) {
      result = result.filter(p => p.stock > 0);
    }
    return result;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  addProduct(productData) {
    const newProduct = {
      id: "prod-" + Date.now().toString().slice(-6),
      name: productData.name.trim(),
      category: productData.category || "viveres",
      categoryName: this.getCategoryName(productData.category),
      price: parseFloat(productData.price) || 0,
      cost: parseFloat(productData.cost) || (parseFloat(productData.price) * 0.75),
      stock: parseInt(productData.stock, 10) || 0,
      unit: productData.unit || "unidad",
      barcode: productData.barcode || String(Math.floor(1000000000 + Math.random() * 9000000000)),
      image: productData.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      description: productData.description || "",
      featured: !!productData.featured
    };

    this.products.unshift(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id, updatedData) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products[index] = {
      ...this.products[index],
      name: updatedData.name ? updatedData.name.trim() : this.products[index].name,
      category: updatedData.category || this.products[index].category,
      categoryName: updatedData.category ? this.getCategoryName(updatedData.category) : this.products[index].categoryName,
      price: updatedData.price !== undefined ? parseFloat(updatedData.price) : this.products[index].price,
      cost: updatedData.cost !== undefined ? parseFloat(updatedData.cost) : this.products[index].cost,
      stock: updatedData.stock !== undefined ? parseInt(updatedData.stock, 10) : this.products[index].stock,
      unit: updatedData.unit || this.products[index].unit,
      barcode: updatedData.barcode || this.products[index].barcode,
      image: updatedData.image || this.products[index].image,
      description: updatedData.description !== undefined ? updatedData.description : this.products[index].description,
      featured: updatedData.featured !== undefined ? updatedData.featured : this.products[index].featured
    };

    this.saveProducts();
    return this.products[index];
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.removeFromCart(id);
    this.saveProducts();
    return true;
  }

  getCategoryName(catId) {
    const found = CATEGORIES.find(c => c.id === catId);
    return found ? found.name : "Víveres";
  }

  // --- CARRITO ---
  loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
    this.notify("cart_changed", this.cart);
  }

  addToCart(productId, qty = 1) {
    const product = this.getProductById(productId);
    if (!product || product.stock <= 0) return { success: false, message: "Producto sin stock disponible" };

    const existing = this.cart.find(item => item.id === productId);
    const currentQtyInCart = existing ? existing.quantity : 0;
    const requestedQty = currentQtyInCart + qty;

    if (requestedQty > product.stock) {
      return { success: false, message: `Solo hay ${product.stock} unidades disponibles en inventario.` };
    }

    if (existing) {
      existing.quantity = requestedQty;
      existing.subtotal = existing.quantity * existing.price;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        unit: product.unit,
        quantity: qty,
        subtotal: qty * product.price
      });
    }

    this.saveCart();
    return { success: true, message: `"${product.name}" agregado al carrito` };
  }

  updateCartQty(productId, qty) {
    const product = this.getProductById(productId);
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;

    if (qty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (product && qty > product.stock) {
      qty = product.stock;
    }

    item.quantity = qty;
    item.subtotal = qty * item.price;
    this.saveCart();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartTotals(deliveryType = "pickup") {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalUSD = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFeeUSD = deliveryType === "delivery" ? (typeof DEFAULT_DELIVERY_FEE !== "undefined" ? DEFAULT_DELIVERY_FEE : 2.00) : 0.00;
    const taxUSD = 0.00; // Alimentos esenciales exentos de IVA
    const totalUSD = subtotalUSD + deliveryFeeUSD + taxUSD;
    const totalVES = totalUSD * this.rate;

    return {
      count,
      subtotalUSD,
      deliveryFeeUSD,
      taxUSD,
      totalUSD,
      totalVES
    };
  }

  // --- VENTAS Y ÓRDENES ---
  loadSales() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error al cargar ventas:", e);
    }
    const initials = generateInitialSales();
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initials));
    return initials;
  }

  saveSales() {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.sales));
    this.notify("sales_changed", this.sales);
  }

  // CREACIÓN DE PEDIDO: Inicialmente PENDIENTE.
  // ¡NO DESCUENTA STOCK HASTA QUE SEA APROBADO EN EL PANEL ADMIN!
  createOrder(orderData) {
    if (!this.cart || this.cart.length === 0) {
      return { success: false, message: "El carrito está vacío" };
    }

    const deliveryType = orderData.deliveryType || "pickup";
    const totals = this.getCartTotals(deliveryType);
    const orderId = "PED-" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      customer: {
        name: orderData.customerName ? orderData.customerName.trim() : "Cliente Tienda",
        phone: orderData.customerPhone ? orderData.customerPhone.trim() : "0412-0000000",
        address: orderData.customerAddress ? orderData.customerAddress.trim() : (deliveryType === "delivery" ? "Dirección no especificada" : "Retiro en Supermercado"),
        reference: orderData.customerReference ? orderData.customerReference.trim() : "",
        notes: orderData.customerNotes ? orderData.customerNotes.trim() : ""
      },
      deliveryType: deliveryType,
      deliveryFeeUSD: totals.deliveryFeeUSD,
      deliveryFeeVES: totals.deliveryFeeUSD * this.rate,
      paymentMethod: orderData.paymentMethod || "Pago Móvil",
      exchangeRate: this.rate,
      items: [...this.cart],
      subtotalUSD: totals.subtotalUSD,
      taxUSD: totals.taxUSD,
      totalUSD: totals.totalUSD,
      totalVES: totals.totalVES,
      status: "pendiente", // PENDIENTE: El administrador debe aprobarlo para descontar el stock
      approvedAt: null
    };

    // Registrar en el historial de pedidos
    this.sales.unshift(newOrder);
    this.saveSales();

    // Vaciar el carrito de la sesión
    this.clearCart();

    this.notify("order_created", newOrder);
    return { success: true, order: newOrder };
  }

  // APROBACIÓN DE PEDIDO (EXCLUSIVO DEL PANEL ADMIN):
  // Descuenta el stock de cada producto en inventario y confirma la venta
  approveOrder(orderId) {
    const order = this.sales.find(o => o.id === orderId);
    if (!order) {
      return { success: false, message: "Pedido no encontrado" };
    }

    if (order.status === "aprobado") {
      return { success: false, message: "Este pedido ya fue aprobado anteriormente" };
    }

    // 1. Validar que exista stock suficiente en almacén para todos los artículos
    for (const item of order.items) {
      const prod = this.getProductById(item.id);
      if (!prod || prod.stock < item.quantity) {
        return {
          success: false,
          message: `Inventario insuficiente para "${item.name}". Stock actual en almacén: ${prod ? prod.stock : 0}, requerido en pedido: ${item.quantity}.`
        };
      }
    }

    // 2. Descontar el stock real del almacén
    order.items.forEach(item => {
      const prod = this.getProductById(item.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    this.saveProducts();

    // 3. Marcar pedido como Aprobado
    order.status = "aprobado";
    order.approvedAt = new Date().toISOString();
    this.saveSales();

    this.notify("order_approved", order);
    return { 
      success: true, 
      message: `¡Pedido #${order.id} aprobado exitosamente! El stock ha sido descontado del almacén.`, 
      order 
    };
  }

  // RECHAZO DE PEDIDO:
  // No modifica el stock en almacén
  rejectOrder(orderId, reason = "Rechazado por el administrador") {
    const order = this.sales.find(o => o.id === orderId);
    if (!order) return { success: false, message: "Pedido no encontrado" };

    order.status = "rechazado";
    order.rejectedReason = reason;
    order.rejectedAt = new Date().toISOString();
    this.saveSales();

    this.notify("order_rejected", order);
    return { 
      success: true, 
      message: `Pedido #${order.id} marcado como rechazado. El stock se mantiene intacto.`, 
      order 
    };
  }

  getPendingOrders() {
    return this.sales.filter(o => o.status === "pendiente");
  }

  getPendingOrdersCount() {
    return this.sales.filter(o => o.status === "pendiente").length;
  }

  // --- ESTADÍSTICAS Y RESUMEN DE VENTAS ---
  getSalesStats(period = "all") {
    let allOrdersInPeriod = [...this.sales];
    const now = new Date();

    if (period === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      allOrdersInPeriod = allOrdersInPeriod.filter(s => new Date(s.date).getTime() >= startOfDay);
    } else if (period === "week") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
      allOrdersInPeriod = allOrdersInPeriod.filter(s => new Date(s.date).getTime() >= sevenDaysAgo);
    } else if (period === "month") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
      allOrdersInPeriod = allOrdersInPeriod.filter(s => new Date(s.date).getTime() >= thirtyDaysAgo);
    }

    // Filtramos solo los pedidos APROBADOS o COMPLETADOS para las métricas de ingresos e inventario
    const approvedOrders = allOrdersInPeriod.filter(s => s.status === "aprobado" || s.status === "completada");
    const pendingOrders = allOrdersInPeriod.filter(s => s.status === "pendiente");

    const totalOrders = approvedOrders.length;
    const totalRevenueUSD = approvedOrders.reduce((sum, s) => sum + (s.totalUSD || 0), 0);
    const totalRevenueVES = totalRevenueUSD * this.rate;
    const averageTicketUSD = totalOrders > 0 ? (totalRevenueUSD / totalOrders) : 0;
    
    const pendingCount = pendingOrders.length;
    const pendingRevenueUSD = pendingOrders.reduce((sum, s) => sum + (s.totalUSD || 0), 0);

    let totalItemsSold = 0;
    const productSalesMap = {};
    const categorySalesMap = {};

    approvedOrders.forEach(order => {
      (order.items || []).forEach(item => {
        totalItemsSold += item.quantity;

        // Por producto
        if (!productSalesMap[item.id]) {
          productSalesMap[item.id] = {
            id: item.id,
            name: item.name,
            image: item.image,
            category: item.category,
            unitsSold: 0,
            revenueUSD: 0
          };
        }
        productSalesMap[item.id].unitsSold += item.quantity;
        productSalesMap[item.id].revenueUSD += item.subtotal;

        // Por categoría
        const cat = item.category || "otros";
        if (!categorySalesMap[cat]) {
          categorySalesMap[cat] = 0;
        }
        categorySalesMap[cat] += item.subtotal;
      });
    });

    // Top productos ordenados por unidades vendidas
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Preparar datos para gráfica de ingresos por día
    const timelineDays = 7;
    const timelineLabels = [];
    const timelineData = [];

    for (let i = timelineDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayRevenue = approvedOrders
        .filter(s => {
          const t = new Date(s.date).getTime();
          return t >= dayStart && t < dayEnd;
        })
        .reduce((sum, s) => sum + (s.totalUSD || 0), 0);

      timelineLabels.push(dateStr);
      timelineData.push(parseFloat(dayRevenue.toFixed(2)));
    }

    return {
      totalOrders,
      totalRevenueUSD,
      totalRevenueVES,
      averageTicketUSD,
      totalItemsSold,
      pendingCount,
      pendingRevenueUSD,
      topProducts,
      categorySalesMap,
      timelineLabels,
      timelineData,
      salesList: allOrdersInPeriod
    };
  }

  // Reiniciar a configuración original de demostración
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.RATE);
    this.rate = 53.50;
    this.products = [...INITIAL_PRODUCTS];
    this.sales = generateInitialSales();
    this.cart = [];
    this.saveProducts();
    this.saveSales();
    this.saveCart();
    this.notify("store_reset", null);
  }
}

// Instancia global
window.store = new Store();
