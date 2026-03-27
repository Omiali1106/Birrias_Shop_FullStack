const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto'); // Importamos el molde que acabas de crear

// 1. RUTA PARA CREAR UN PRODUCTO NUEVO (Método POST)
router.post('/', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body); // req.body es la info que manda la página web
        const productoGuardado = await nuevoProducto.save(); // Lo guardamos en MongoDB
        res.status(201).json(productoGuardado); // Respondemos con el producto ya guardado
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el producto', error });
    }
});

// 2. RUTA PARA VER TODOS LOS PRODUCTOS (Método GET)
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find(); // Busca todos los productos en MongoDB
        res.json(productos); // Se los manda a tu página web
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos', error });
    }
});

module.exports = router;