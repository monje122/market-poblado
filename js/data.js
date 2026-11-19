// Catálogo de Productos Oficiales para Supermercado El Poblado
// Actualizado con los productos tradicionales venezolanos de primera necesidad
const INITIAL_PRODUCTS = [
  {
    id: "prod-pan",
    name: "Harina de Maíz Blanco P.A.N. 1kg",
    category: "viveres",
    categoryName: "Víveres y Despensa",
    price: 1.30,
    cost: 0.90,
    stock: 60,
    unit: "paquete",
    barcode: "75910010001",
    image: "assets/products/harina-pan.jpg",
    description: "Harina de maíz blanco precocida tradicional venezolana P.A.N. Ideal para arepas, empanadas y hallacas.",
    featured: true
  },
  {
    id: "prod-primor",
    name: "Arroz Blanco Primor Tipo 1 1kg",
    category: "viveres",
    categoryName: "Víveres y Despensa",
    price: 1.45,
    cost: 1.00,
    stock: 55,
    unit: "paquete",
    barcode: "75910010002",
    image: "assets/products/arroz-primor.jpg",
    description: "Arroz blanco seleccionado de grano entero de primera calidad Primor. Grano suelto y rendidor.",
    featured: true
  },
  {
    id: "prod-sindoni",
    name: "Pasta Spaghetti Sindoni 1kg",
    category: "viveres",
    categoryName: "Víveres y Despensa",
    price: 1.60,
    cost: 1.10,
    stock: 45,
    unit: "paquete",
    barcode: "75910010003",
    image: "assets/products/pasta-sindoni.jpg",
    description: "Pasta larga tipo spaghetti 100% sémola de trigo durum seleccionado Sindoni.",
    featured: true
  },
  {
    id: "prod-huevos",
    name: "Cartón de Huevos Blancos Frescos (12 unid)",
    category: "lacteos",
    categoryName: "Lácteos y Huevos",
    price: 2.40,
    cost: 1.60,
    stock: 35,
    unit: "cartón",
    barcode: "75910010004",
    image: "assets/products/huevos-frescos.jpg",
    description: "Docena de huevos blancos de granja seleccionados y frescos de primera calidad.",
    featured: true
  },
  {
    id: "prod-queso",
    name: "Queso Blanco Llanero Venezolano 1kg",
    category: "lacteos",
    categoryName: "Lácteos y Huevos",
    price: 5.80,
    cost: 4.20,
    stock: 25,
    unit: "kg",
    barcode: "75910010005",
    image: "assets/products/queso-llanero.jpg",
    description: "Auténtico queso blanco llanero duro tradicional venezolano, con el punto justo de sal para rallar.",
    featured: true
  },
  {
    id: "prod-vatel",
    name: "Aceite Comestible Puro Vatel 1L",
    category: "viveres",
    categoryName: "Víveres y Despensa",
    price: 2.90,
    cost: 2.10,
    stock: 40,
    unit: "botella",
    barcode: "75910010006",
    image: "assets/products/aceite-vatel.jpg",
    description: "Aceite vegetal puro comestible Vatel, libre de colesterol y grasas trans.",
    featured: true
  },
  {
    id: "prod-azucar",
    name: "Azúcar Blanca Refinada Montalbán 1kg",
    category: "viveres",
    categoryName: "Víveres y Despensa",
    price: 1.50,
    cost: 1.05,
    stock: 50,
    unit: "paquete",
    barcode: "75910010007",
    image: "assets/products/azucar-montalban.jpg",
    description: "Azúcar refinada pura de caña Montalbán. Dulzura y pureza para tus recetas y bebidas.",
    featured: false
  },
  {
    id: "prod-caraotas",
    name: "Caraotas Negras Venezolanas 1kg",
    category: "viveres",
    categoryName: "Víveres y Despensa",
    price: 2.20,
    cost: 1.50,
    stock: 38,
    unit: "kg",
    barcode: "75910010008",
    image: "assets/products/caraotas-negras.jpg",
    description: "Granos de caraotas negras seleccionadas de primera cosecha, sabor criollo tradicional.",
    featured: true
  },
  {
    id: "prod-cafe",
    name: "Café Molido Fama de América 500g",
    category: "viveres",
    categoryName: "Víveres y Despensa",
    price: 4.60,
    cost: 3.20,
    stock: 30,
    unit: "paquete",
    barcode: "75910010009",
    image: "assets/products/cafe-fama-de-america.jpg",
    description: "Café molido tostado tradicional venezolano Fama de América. Aroma intenso y sabor inconfundible.",
    featured: true
  }
];

// Categorías del supermercado
const CATEGORIES = [
  { id: "all", name: "Todos los Productos", icon: "shopping-bag" },
  { id: "viveres", name: "Víveres y Despensa", icon: "box" },
  { id: "lacteos", name: "Lácteos y Huevos", icon: "egg" },
  { id: "frutas", name: "Frutas y Verduras", icon: "apple" },
  { id: "carnes", name: "Carnes y Charcutería", icon: "beef" },
  { id: "bebidas", name: "Bebidas y Jugos", icon: "cup-soda" },
  { id: "limpieza", name: "Cuidado y Limpieza", icon: "sparkles" },
  { id: "snacks", name: "Snacks y Panadería", icon: "cookie" }
];

// Presets de imágenes de los productos para facilitar al usuario agregar nuevos rápidamente
const IMAGE_PRESETS = [
  { label: "Harina P.A.N.", url: "assets/products/harina-pan.jpg" },
  { label: "Arroz Primor", url: "assets/products/arroz-primor.jpg" },
  { label: "Pasta Sindoni", url: "assets/products/pasta-sindoni.jpg" },
  { label: "Huevos Frescos", url: "assets/products/huevos-frescos.jpg" },
  { label: "Queso Llanero", url: "assets/products/queso-llanero.jpg" },
  { label: "Aceite Vatel", url: "assets/products/aceite-vatel.jpg" },
  { label: "Azúcar Montalbán", url: "assets/products/azucar-montalban.jpg" },
  { label: "Caraotas Negras", url: "assets/products/caraotas-negras.jpg" },
  { label: "Café Fama de América", url: "assets/products/cafe-fama-de-america.jpg" }
];

// Constantes de WhatsApp y Delivery del Supermercado
const SUPERMERCADO_WHATSAPP = "584123714136";
const SUPERMERCADO_WHATSAPP_DISPLAY = "+58 412-3714136";
const DEFAULT_DELIVERY_FEE = 2.00;

// Ventas históricas basadas en los productos exactos
function generateInitialSales() {
  const now = new Date();
  
  const getPastDate = (daysAgo, hours = 10, minutes = 30) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "ORD-2001",
      date: getPastDate(5, 9, 15),
      customer: {
        name: "María Elena González",
        phone: "0414-5551234",
        address: "Av. Principal El Poblado, Res. Los Samanes Apt 4-B",
        notes: "Timbre dañado, llamar al llegar"
      },
      paymentMethod: "Punto de Venta",
      exchangeRate: 53.5,
      items: [
        { id: "prod-pan", name: "Harina de Maíz Blanco P.A.N. 1kg", price: 1.30, quantity: 4, subtotal: 5.20, category: "viveres" },
        { id: "prod-queso", name: "Queso Blanco Llanero Venezolano 1kg", price: 5.80, quantity: 1, subtotal: 5.80, category: "lacteos" },
        { id: "prod-cafe", name: "Café Molido Fama de América 500g", price: 4.60, quantity: 1, subtotal: 4.60, category: "viveres" }
      ],
      subtotalUSD: 15.60,
      taxUSD: 0.00,
      totalUSD: 15.60,
      totalVES: 15.60 * 53.5,
      status: "completada"
    },
    {
      id: "ORD-2002",
      date: getPastDate(4, 11, 40),
      customer: {
        name: "Carlos Rodríguez",
        phone: "0412-8889900",
        address: "Calle Bolívar, Casa N° 45",
        notes: ""
      },
      paymentMethod: "Pago Móvil",
      exchangeRate: 53.5,
      items: [
        { id: "prod-caraotas", name: "Caraotas Negras Venezolanas 1kg", price: 2.20, quantity: 2, subtotal: 4.40, category: "viveres" },
        { id: "prod-primor", name: "Arroz Blanco Primor Tipo 1 1kg", price: 1.45, quantity: 3, subtotal: 4.35, category: "viveres" },
        { id: "prod-vatel", name: "Aceite Comestible Puro Vatel 1L", price: 2.90, quantity: 1, subtotal: 2.90, category: "viveres" }
      ],
      subtotalUSD: 11.65,
      taxUSD: 0.00,
      totalUSD: 11.65,
      totalVES: 11.65 * 53.5,
      status: "completada"
    },
    {
      id: "ORD-2003",
      date: getPastDate(3, 15, 20),
      customer: {
        name: "Valeria Mendoza",
        phone: "0424-3334411",
        address: "Urb. Valle Arriba, Calle 2",
        notes: "Entregar en portería"
      },
      paymentMethod: "Punto de Venta",
      exchangeRate: 53.5,
      items: [
        { id: "prod-huevos", name: "Cartón de Huevos Blancos Frescos (12 unid)", price: 2.40, quantity: 2, subtotal: 4.80, category: "lacteos" },
        { id: "prod-pan", name: "Harina de Maíz Blanco P.A.N. 1kg", price: 1.30, quantity: 5, subtotal: 6.50, category: "viveres" },
        { id: "prod-sindoni", name: "Pasta Spaghetti Sindoni 1kg", price: 1.60, quantity: 3, subtotal: 4.80, category: "viveres" },
        { id: "prod-azucar", name: "Azúcar Blanca Refinada Montalbán 1kg", price: 1.50, quantity: 2, subtotal: 3.00, category: "viveres" }
      ],
      subtotalUSD: 19.10,
      taxUSD: 0.00,
      totalUSD: 19.10,
      totalVES: 19.10 * 53.5,
      status: "completada"
    },
    {
      id: "ORD-2004",
      date: getPastDate(2, 10, 05),
      customer: {
        name: "José Antonio Pérez",
        phone: "0416-2223344",
        address: "Av. Miranda, Conjunto Las Trinitarias",
        notes: ""
      },
      paymentMethod: "Efectivo Divisas ($)",
      exchangeRate: 53.5,
      items: [
        { id: "prod-queso", name: "Queso Blanco Llanero Venezolano 1kg", price: 5.80, quantity: 2, subtotal: 11.60, category: "lacteos" },
        { id: "prod-cafe", name: "Café Molido Fama de América 500g", price: 4.60, quantity: 2, subtotal: 9.20, category: "viveres" },
        { id: "prod-vatel", name: "Aceite Comestible Puro Vatel 1L", price: 2.90, quantity: 2, subtotal: 5.80, category: "viveres" }
      ],
      subtotalUSD: 26.60,
      taxUSD: 0.00,
      totalUSD: 26.60,
      totalVES: 26.60 * 53.5,
      status: "completada"
    },
    {
      id: "ORD-2005",
      date: getPastDate(1, 16, 45),
      customer: {
        name: "Ana Gabriela Soto",
        phone: "0412-1110022",
        address: "Sector Centro, Carrera 8",
        notes: "Casa con portón verde"
      },
      paymentMethod: "Pago Móvil",
      exchangeRate: 53.5,
      items: [
        { id: "prod-pan", name: "Harina de Maíz Blanco P.A.N. 1kg", price: 1.30, quantity: 6, subtotal: 7.80, category: "viveres" },
        { id: "prod-primor", name: "Arroz Blanco Primor Tipo 1 1kg", price: 1.45, quantity: 4, subtotal: 5.80, category: "viveres" },
        { id: "prod-caraotas", name: "Caraotas Negras Venezolanas 1kg", price: 2.20, quantity: 2, subtotal: 4.40, category: "viveres" },
        { id: "prod-huevos", name: "Cartón de Huevos Blancos Frescos (12 unid)", price: 2.40, quantity: 1, subtotal: 2.40, category: "lacteos" }
      ],
      subtotalUSD: 20.40,
      taxUSD: 0.00,
      totalUSD: 20.40,
      totalVES: 20.40 * 53.5,
      status: "completada"
    },
    {
      id: "ORD-2006",
      date: getPastDate(0, 11, 20), // Hoy
      customer: {
        name: "Patricia Alvarado",
        phone: "0424-7776655",
        address: "Edificio Vista Hermosa, PH-2",
        notes: "Retiro en tienda"
      },
      paymentMethod: "Punto de Venta",
      exchangeRate: 53.5,
      items: [
        { id: "prod-pan", name: "Harina de Maíz Blanco P.A.N. 1kg", price: 1.30, quantity: 3, subtotal: 3.90, category: "viveres" },
        { id: "prod-queso", name: "Queso Blanco Llanero Venezolano 1kg", price: 5.80, quantity: 1, subtotal: 5.80, category: "lacteos" },
        { id: "prod-cafe", name: "Café Molido Fama de América 500g", price: 4.60, quantity: 1, subtotal: 4.60, category: "viveres" },
        { id: "prod-azucar", name: "Azúcar Blanca Refinada Montalbán 1kg", price: 1.50, quantity: 2, subtotal: 3.00, category: "viveres" }
      ],
      subtotalUSD: 17.30,
      deliveryType: "pickup",
      deliveryFeeUSD: 0.00,
      taxUSD: 0.00,
      totalUSD: 17.30,
      totalVES: 17.30 * 53.5,
      status: "aprobado",
      approvedAt: getPastDate(0, 11, 25)
    },
    {
      id: "PED-2007",
      date: new Date().toISOString(),
      customer: {
        name: "Luisana Villasmil",
        phone: "0412-3714136",
        address: "Sector El Poblado, Calle Los Pinos, Casa N° 12",
        reference: "Frente a la plaza, portón verde",
        notes: "Pagaré por Pago Móvil al recibir"
      },
      deliveryType: "delivery",
      deliveryFeeUSD: 2.00,
      deliveryFeeVES: 2.00 * 53.5,
      paymentMethod: "Pago Móvil",
      exchangeRate: 53.5,
      items: [
        { id: "prod-pan", name: "Harina de Maíz Blanco P.A.N. 1kg", price: 1.30, quantity: 4, subtotal: 5.20, category: "viveres" },
        { id: "prod-queso", name: "Queso Blanco Llanero Venezolano 1kg", price: 5.80, quantity: 1, subtotal: 5.80, category: "lacteos" },
        { id: "prod-cafe", name: "Café Molido Fama de América 500g", price: 4.60, quantity: 1, subtotal: 4.60, category: "viveres" }
      ],
      subtotalUSD: 15.60,
      taxUSD: 0.00,
      totalUSD: 17.60,
      totalVES: 17.60 * 53.5,
      status: "pendiente",
      approvedAt: null
    }
  ];
}
