const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const Compra = require('./models/Compra');
const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARES (Configuraciones base) ---
app.use(cors());
app.use(express.json()); // Le dice al servidor que entienda el formato JSON

// --- 2. CONEXIÓN A LA BASE DE DATOS MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Base de datos MongoDB conectada con éxito!'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// --- 3. RUTAS DEL SERVIDOR ---

// Ruta principal (Para revisar que el server está vivo)
app.get('/', (req, res) => {
  res.send('¡El Backend de Tienda Fashion está 100% vivo y conectado a MongoDB!');
});

// Importamos a nuestros "meseros" reales de productos
const rutasProductos = require('./routes/productos');
app.use('/api/productos', rutasProductos);

// Ruta para procesar las compras (Por ahora simulada, luego la pasaremos a BD)
app.post('/api/compras', async (req, res) => {
  try {
    const carrito = req.body; 
    
    console.log('🛍️ Procesando nueva compra...');

    // Calculamos el total a cobrar sumando los precios del carrito
    const totalCompra = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    // Creamos el ticket usando el "molde"
    const nuevaCompra = new Compra({
      articulos: carrito,
      total: totalCompra
    });

    // ¡Lo guardamos en la base de datos!
    const compraGuardada = await nuevaCompra.save();

    // Le respondemos a React con éxito y le mandamos el ID real de MongoDB como folio
    res.json({ 
      exito: true, 
      mensaje: '¡Pago procesado y guardado con éxito!', 
      folio: compraGuardada._id 
    });

  } catch (error) {
    console.error('❌ Error al guardar la compra:', error);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
  }
});

// --- 4. ARRANCAR EL SERVIDOR ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor de Birrias Shop corriendo triunfante en el puerto ${PORT} 🐐`);
});