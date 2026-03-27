const mongoose = require('mongoose');

// 1. Creamos el "molde" con las reglas de nuestra ropa
const productoSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true // required significa que es obligatorio
    },
    descripcion: { 
        type: String, 
        required: true 
    },
    precio: { 
        type: Number, 
        required: true 
    },
    categoria: { 
        type: String, 
        required: true, 
        default: 'General' 
    },
    talla: { 
        type: String // Ej: 'S', 'M', 'L', 'Unitalla'
    }, 
    imagen: { 
        type: String, 
        required: true // Aquí guardaremos el link de la foto
    },
    stock: { 
        type: Number, 
        default: 0 // Si no le ponemos cuántos hay, por defecto será 0
    }
}, {
    timestamps: true // ¡Truco pro! Esto le agrega automáticamente la fecha en que lo creaste.
});

// 2. Lo empaquetamos y lo exportamos para usarlo en el resto del proyecto
module.exports = mongoose.model('Producto', productoSchema);