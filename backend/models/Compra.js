const mongoose = require('mongoose');

// Este es el formato de nuestro "Ticket de compra"
const compraSchema = new mongoose.Schema({
    articulos: { type: Array, required: true }, // Aquí guardaremos todo el carrito
    total: { type: Number, required: true },    // Cuánto pagó en total
    fecha: { type: Date, default: Date.now }    // La fecha exacta de la compra
});

module.exports = mongoose.model('Compra', compraSchema);