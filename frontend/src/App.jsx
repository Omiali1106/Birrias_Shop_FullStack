import { useState, useEffect } from 'react';
import './index.css';

// --- NUEVO: Componente individual para cada producto ---
// Esto nos permite manejar la talla y cantidad de cada tarjeta por separado
function TarjetaProducto({ producto, onAgregar }) {
  const [talla, setTalla] = useState('M'); // Talla por defecto
  const [cantidad, setCantidad] = useState(1); // Cantidad por defecto
  
  // Revisamos si el producto es ropa para mostrar las tallas
  const esRopa = producto.category.includes('clothing');

  const manejarClick = () => {
    // Si no es ropa, mandamos 'Única' como talla
    onAgregar(producto, cantidad, esRopa ? talla : 'Única');
    // Reiniciamos la cantidad a 1 después de agregar
    setCantidad(1);
  };

  return (
    <article className="tarjeta">
      <div className="img-contenedor">
        <img src={producto.image} alt={producto.title} />
      </div>
      <div className="info-producto">
        <h3>{producto.title.length > 40 ? producto.title.substring(0, 40) + '...' : producto.title}</h3>
        <p className="precio">${producto.price.toFixed(2)}</p>
        
        {/* --- NUEVOS CONTROLES --- */}
        <div style={{marginTop: 'auto'}}>
          <div className="controles-compra">
            {esRopa && (
              <select 
                className="selector-estilo" 
                value={talla} 
                onChange={(e) => setTalla(e.target.value)}
                title="Selecciona tu talla"
              >
                <option value="S">Chica (S)</option>
                <option value="M">Mediana (M)</option>
                <option value="L">Grande (L)</option>
                <option value="XL">Extra Grande (XL)</option>
              </select>
            )}
            <input 
              type="number" 
              className="selector-estilo" 
              min="1" 
              max="10" 
              value={cantidad} 
              onChange={(e) => setCantidad(Number(e.target.value))}
              title="Cantidad"
            />
          </div>
          
          <button className="boton" onClick={manejarClick}>
            Añadir al carrito
          </button>
        </div>
      </div>
    </article>
  );
}

// --- APLICACIÓN PRINCIPAL ---
function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [vista, setVista] = useState('inicio');
  const anioActual = new Date().getFullYear();

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch('https://fakestoreapi.com/products?limit=8');
        const datos = await respuesta.json();
        setProductos(datos);
      } catch (error) {
        console.error("Error al cargar la API:", error);
      }
    };
    obtenerProductos();
  }, []);

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('tiendafashion_cart_v2')) || [];
    setCarrito(carritoGuardado);
  }, []);

  // Función de agregar actualizada para recibir talla y cantidad
  const agregarAlCarrito = (producto, cantidad, talla) => {
    const nuevoCarrito = [...carrito];
    
    // Ahora buscamos si el producto ya existe con la MISMA TALLA
    // (Porque una camisa S es diferente a una camisa L)
    const index = nuevoCarrito.findIndex(item => item.id === producto.id && item.talla === talla);
    
    if (index !== -1) {
      nuevoCarrito[index].cantidad += cantidad; // Si ya existe, sumamos la cantidad
    } else {
      nuevoCarrito.push({ ...producto, cantidad, talla }); // Si no, lo agregamos como nuevo
    }
    
    setCarrito(nuevoCarrito);
    localStorage.setItem('tiendafashion_cart_v2', JSON.stringify(nuevoCarrito));
    alert(`Agregaste ${cantidad}x ${producto.title.substring(0,20)}... (Talla: ${talla}) a tu bolsa.`);
  };

  const eliminarDelCarrito = (id, talla) => {
    // Filtramos comparando el ID y la Talla para no borrar otra talla por accidente
    const nuevoCarrito = carrito.filter(item => !(item.id === id && item.talla === talla));
    setCarrito(nuevoCarrito);
    localStorage.setItem('tiendafashion_cart_v2', JSON.stringify(nuevoCarrito));
  };

  const vaciarCarrito = () => {
    if (window.confirm('¿Estás seguro de vaciar tu bolsa de compras?')) {
      setCarrito([]);
      localStorage.removeItem('tiendafashion_cart_v2');
    }
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.price * item.cantidad), 0);
  const cantidadArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="logo" href="#" onClick={(e) => { e.preventDefault(); setVista('inicio'); }}>
            Birrias Shop
          </a>
          <nav aria-label="Principal">
            <a href="#" onClick={(e) => { e.preventDefault(); setVista('inicio'); }} className={vista === 'inicio' ? 'activo' : ''}>
              Inicio
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setVista('carrito'); }} className={vista === 'carrito' ? 'activo' : ''}>
              Carrito <span className="cart-badge">{cantidadArticulos}</span>
            </a>
          </nav>
        </div>
      </header>

      <main>
        {vista === 'inicio' ? (
          <>
            <section className="hero">
              <div className="container">
                <h1>Colección Exclusiva</h1>
                <p>Descubre la elegancia y el confort en cada una de nuestras prendas. Renueva tu estilo con las últimas tendencias.</p>
              </div>
            </section>

            <section className="container">
              <h2 className="seccion-titulo">Novedades</h2>
              <div className="grid-tarjetas">
                {productos.length === 0 ? (
                  <h3 style={{textAlign: 'center', gridColumn: '1 / -1', color: '#666'}}>Preparando el catálogo...</h3>
                ) : (
                  productos.map((producto) => (
                    // Usamos nuestro nuevo componente aquí
                    <TarjetaProducto 
                      key={producto.id} 
                      producto={producto} 
                      onAgregar={agregarAlCarrito} 
                    />
                  ))
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="container">
            <h2 className="seccion-titulo">Tu Carrito de Compras</h2>
            
            {carrito.length === 0 ? (
              <div style={{textAlign: 'center', padding: '100px 0', minHeight: '50vh'}}>
                <h3 style={{color: '#999', marginBottom: '20px'}}>Tu Carrito está vacío</h3>
                <button className="boton" style={{width: 'auto'}} onClick={() => setVista('inicio')}>
                  Descubrir prendas
                </button>
              </div>
            ) : (
              <div className="carrito-container">
                {carrito.map((item, index) => (
                  // Usamos index en la key porque un mismo producto (id) puede estar dos veces con diferente talla
                  <div className="carrito-item" key={`${item.id}-${item.talla}-${index}`}>
                    <div className="carrito-item-info">
                      <img src={item.image} alt={item.title} />
                      <div className="carrito-item-detalles">
                        <h4>{item.title}</h4>
                        <p>
                          Cantidad: {item.cantidad} x ${item.price.toFixed(2)}
                          {item.talla !== 'Única' && <span className="talla-badge">Talla: {item.talla}</span>}
                        </p>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <h4 style={{marginBottom: '10px'}}>${(item.price * item.cantidad).toFixed(2)}</h4>
                      <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.id, item.talla)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                
                <h3 className="carrito-total">
                  Total Estimado: ${totalCarrito.toFixed(2)}
                </h3>
                
                <div className="carrito-acciones">
                  <button className="boton boton-secundario" style={{width: 'auto'}} onClick={vaciarCarrito}>
                    Vaciar Carrito
                  </button>
                  <button className="boton" style={{width: 'auto'}} onClick={() => alert('¡Gracias por tu preferencia! Procediendo a pasarela de pago segura.')}>
                    Proceder al Pago
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <p style={{fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--color-dorado)', marginBottom: '10px'}}>Birrias Shop</p>
          <p>&copy; {anioActual} — Exclusividad y Estilo.</p>
        </div>
      </footer>
    </>
  );
}

export default App;