# Supermercado El Poblado - Tienda Online & Panel de Administración

Sistema web profesional de tienda online, control de inventario y analítica de ventas para **Supermercado El Poblado**, desarrollado con la identidad visual corporativa, colores y logotipo basados en la fachada y señalización del supermercado, optimizado tanto para computadoras como para dispositivos móviles (**iPhone / iOS** y **Android**).

---

## 📸 Identidad y Elementos Extraídos
- **Nombre:** Supermercado El Poblado.
- **Fachada del Supermercado:** Imagen oficial de alta resolución destacada en el banner principal con el lema *"100% Calidad • Tus mejores aliados"*.
- **Logotipo:** Carrito de compras vectorial estilizado con hojas verdes orgánicas, degradado verde esmeralda (`#0e5e3a`) y verde hoja (`#27ae60`), ruedas concéntricas y tipografía caligráfica *"Supermercado"* con *"EL POBLADO"*.
- **Colores de Marca:**
  - Verde Esmeralda Institucional: `#0e5e3a` / `#094429`
  - Verde Hoja Fresco: `#27ae60` / `#2ecc71`
  - Fondo Menta Suave: `#f5f9f6`
- **Horario de Atención:**
  - **Lunes a Sábado:** 8:00 am a 10:00 pm
  - **Domingos:** 10:00 am a 8:00 pm

---

## ✨ Funcionalidades Principales

### 1. 🛒 Tienda Online Pública
- **Diseño Móvil Optimizado (iPhone y Android):** Cuadrícula de 2 columnas tipo app (Rappi / PedidosYa), tipografía escalada y botones de compra compactos.
- **Barra de Navegación Inferior Móvil (Bottom Navigation Bar):** Accesos fijos a *Tienda*, *Buscar*, *Carrito* (con contador dinámico en vivo) y *Admin*.
- **Catálogo de Productos Venezolanos:**
  - Harina de Maíz Blanco P.A.N. 1kg
  - Arroz Blanco Primor Tipo 1 1kg
  - Pasta Sindoni Spaghetti 1kg
  - Cartón de Huevos Blancos Frescos 12 unid.
  - Queso Blanco Llanero Venezolano 1kg
  - Aceite Comestible Vatel 1L
  - Azúcar Blanco Refinado Montalbán 1kg
  - Caraotas Negras Criollas 1kg
  - Café Fama de América Tostado y Molido 500g
- **Doble Moneda en Vivo:** Visualización simultánea en **$ USD** y **Bs. (Bolívares)** según la tasa oficial del día.
- **Modalidad de Despacho Flexible:**
  - 🛵 **Envío a Domicilio (Delivery):** Agrega tarifa plana de **+$2.00** al total con campos para dirección exacta y punto de referencia.
  - 🏬 **Retiro en Supermercado:** Gratuito ($0.00) con indicación de horarios comerciales.
- **Integración Directa con WhatsApp (+58 412-3714136):**
  - Al completar la compra, genera el mensaje oficial formateado con código de pedido, datos del cliente, dirección, método de pago y desglose de artículos.
  - Abre automáticamente la conversación en WhatsApp con el supermercado.

### 2. 🛡️ Panel de Administración Profesional (Admin Dashboard)
- **Área Interna Protegida:** Los clientes en la tienda pública no ven las herramientas administrativas; estas residen en el panel administrativo.
- **Módulo de Pedidos & Aprobación en Tiempo Real (Control de Stock):**
  - **Los pedidos recibidos por WhatsApp entran en estado *Pendiente*.**
  - El inventario **NO** se descuenta hasta que el administrador pulse **`[✔ Aprobar Pedido y Descontar Stock]`**.
  - Al aprobar, el sistema verifica existencia en almacén y reduce automáticamente las unidades disponibles.
  - Opciones de rechazo sin alterar stock y botón directo para chatear con el cliente por WhatsApp.
  - Notificaciones e insignias en vivo (*Badges* con conteo de pedidos pendientes por atender).
- **Menú Lateral Desplegable (Drawer):** En móviles cuenta con un menú hamburguesa que se despliega de forma suave y se repliega al seleccionar una opción.
- **Resumen de Ventas y Analítica:**
  - KPIs en tiempo real: *Total Ingresos*, *Órdenes Realizadas*, *Ticket Promedio* y *Unidades Despachadas*.
  - Gráficos interactivos de evolución diaria y distribución porcentual por categoría.
  - Tabla de transacciones con filtros por período (Hoy, 7 días, Este Mes, Todo) y botón de exportación a **CSV**.
- **Control de Inventario & Almacén:**
  - Monitoreo del valor total del inventario en almacén, alertas de stock bajo y productos agotados.
  - Tabla completa con botones táctiles rápidos (**+** y **-**) para modificar cantidades directamente en almacén.
  - Desplazamiento horizontal fluido en pantallas de teléfono.
- **+ Nuevo Producto:**
  - Formulario modal completo para registrar nuevos artículos con imagen, código de barras, precio de venta, costo y existencias iniciales.
- **Edición y Eliminación:** Control total para modificar precios, nombres y existencias de cualquier producto.
- **Ajuste de Tasa de Cambio:** Modal para actualizar la tasa oficial Bs./USD con recálculo automático de todo el sistema.

---

## 🚀 Cómo Iniciar el Proyecto

### Opción 1: Con el Servidor Node.js (Recomendado)
Abre una terminal en esta carpeta y ejecuta:
```bash
node server.js
```
O haz doble clic en `start.bat`. Luego abre en tu navegador:
👉 **http://localhost:3000**

### Opción 2: Apertura Directa
Haz doble clic sobre el archivo `index.html` para abrirlo directamente en tu navegador web.

---

## 📂 Estructura Limpia de Archivos
```
supermercado-el-poblado/
├── index.html            # Aplicación web completa y responsiva
├── server.js             # Servidor HTTP local en Node.js
├── start.bat             # Acceso directo para iniciar servidor y abrir navegador
├── README.md             # Documentación del proyecto
├── css/
│   └── custom.css        # Estilos corporativos, safe-area-inset y reglas móviles
├── js/
│   ├── data.js           # Catálogo inicial de productos y ventas históricas
│   ├── store.js          # Manejador de estado con persistencia (LocalStorage)
│   └── app.js            # Lógica de interfaz, carrito, panel admin y gráficos
└── assets/
    ├── logo.svg          # Logotipo vectorial oficial
    ├── supermercado-fachada.jpg # Foto oficial de la fachada del supermercado
    └── products/         # Fotografías de los 9 productos del supermercado
        ├── aceite-vatel.jpg
        ├── arroz-primor.jpg
        ├── azucar-montalban.jpg
        ├── cafe-fama-de-america.jpg
        ├── caraotas-negras.jpg
        ├── harina-pan.jpg
        ├── huevos-frescos.jpg
        ├── pasta-sindoni.jpg
        └── queso-llanero.jpg
```
