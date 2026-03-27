import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
// Corregido: FiArrowRight con dos 'r'
import { FiShoppingBag, FiTrash2, FiUser, FiArrowRight, FiPlusCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { IoShirtOutline, IoFilterOutline, IoDiamondOutline, IoBagAddOutline } from 'react-icons/io5';
import './index.css';

// ==========================================================
// --- COMPONENTE: Tarjeta de Producto ---
// ==========================================================
function TarjetaProducto({ producto, onAgregar }) {
  const [talla, setTalla] = useState('M');
  const [cantidad, setCantidad] = useState(1);
  
  const esUltimasPiezas = producto.stock > 0 && producto.stock <= 5;
  const fechaCreacion = new Date(producto.createdAt);
  const haceUnMes = new Date();
  haceUnMes.setDate(haceUnMes.getDate() - 30);
  const esNuevo = fechaCreacion > haceUnMes;

  const manejarClick = () => {
    if (producto.stock === 0) {
      toast.error(`Lo sentimos, ${producto.nombre} está agotado.`, { icon: '🚫' });
      return;
    }
    onAgregar(producto, cantidad, talla);
    setCantidad(1);
  };

  return (
    <article className="tarjeta">
      <div className="etiquetas-contenedor">
        {esNuevo && <span className="etiqueta etiqueta-nuevo">Nuevo</span>}
        {esUltimasPiezas && <span className="etiqueta etiqueta-stock">¡Últimas {producto.stock} piezas!</span>}
        {producto.stock === 0 && <span className="etiqueta" style={{backgroundColor: '#999'}}>Agotado</span>}
      </div>

      <div className="img-contenedor">
        <img src={producto.imagen} alt={producto.nombre} loading="lazy" />
      </div>
      
      <div className="info-producto">
        <h3>{producto.nombre?.length > 35 ? producto.nombre.substring(0, 35) + '...' : producto.nombre}</h3>
        
        <div className="precio-contenedor">
          <span className="precio">${producto.precio?.toFixed(2)}</span>
          <span className="precio-divisa">MXN</span>
        </div>
        
        <div style={{marginTop: 'auto'}}>
          <div className="controles-compra">
            <select 
              className="selector-estilo" 
              value={talla} 
              onChange={(e) => setTalla(e.target.value)}
              title="Selecciona tu talla"
              disabled={producto.stock === 0}
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="Única">Talla Única</option>
            </select>
            
            <input 
              type="number" 
              className="selector-estilo" 
              min="1" 
              max={producto.stock > 0 ? producto.stock : 1}
              value={cantidad} 
              onChange={(e) => setCantidad(Number(e.target.value))}
              title="Cantidad"
              style={{maxWidth: '70px', textAlign: 'center'}}
              disabled={producto.stock === 0}
            />
          </div>
          
          <button 
            className="boton" 
            onClick={manejarClick}
            disabled={producto.stock === 0}
            style={producto.stock === 0 ? {backgroundColor: '#ccc', cursor: 'not-allowed'} : {}}
          >
            <IoBagAddOutline size={18} />
            {producto.stock === 0 ? 'Agotado' : 'Añadir a la bolsa'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ==========================================================
// --- APLICACIÓN PRINCIPAL ---
// ==========================================================
function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [vista, setVista] = useState('inicio');
  const [categoriaActual, setCategoriaActual] = useState('Todas'); 
  const anioActual = new Date().getFullYear();

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch('https://birriasshopbackend.onrender.com/api/productos');
        const datos = await respuesta.json();
        setProductos(datos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error("Error al cargar la API:", error);
        toast.error("No pudimos conectar con el servidor.", { position: 'bottom-right' });
      }
    };
    obtenerProductos();
  }, []);

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('birrias_cart_v3')) || [];
    setCarrito(carritoGuardado);
  }, []);

  const agregarAlCarrito = (producto, cantidad, talla) => {
    const nuevoCarrito = [...carrito];
    const index = nuevoCarrito.findIndex(item => item._id === producto._id && item.talla === talla);
    
    if (index !== -1) {
      nuevoCarrito[index].cantidad += cantidad;
    } else {
      nuevoCarrito.push({ ...producto, cantidad, talla });
    }
    
    setCarrito(nuevoCarrito);
    localStorage.setItem('birrias_cart_v3', JSON.stringify(nuevoCarrito));
    
    // Corregido: Comillas en las variables CSS
    toast.success(`${cantidad}x ${producto.nombre.substring(0,15)}... (Talla ${talla}) añadido.`, {
      style: { border: '1px solid var(--color-navy)', padding: '16px', color: 'var(--color-navy)' },
      iconTheme: { primary: 'var(--color-rojo)', secondary: '#FFFAEE' },
    });
  };

  const eliminarDelCarrito = (id, talla) => {
    const itemAEliminar = carrito.find(item => item._id === id && item.talla === talla);
    const nuevoCarrito = carrito.filter(item => !(item._id === id && item.talla === talla));
    setCarrito(nuevoCarrito);
    localStorage.setItem('birrias_cart_v3', JSON.stringify(nuevoCarrito));
    
    toast(`Eliminaste ${itemAEliminar?.nombre.substring(0,15)}...`, { icon: '🗑️' });
  };

  const vaciarCarrito = () => {
    toast((t) => (
      <span style={{textAlign: 'center'}}>
        <b>¿Estás seguro de vaciar tu bolsa?</b> <br /> No podrás recuperar los artículos. <br />
        <div style={{marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
          <button className="boton btn-eliminar" style={{width: 'auto'}} onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="boton" style={{width: 'auto', padding: '5px 15px'}} onClick={() => {
             setCarrito([]);
             localStorage.removeItem('birrias_cart_v3');
             toast.dismiss(t.id);
             toast.success('Bolsa vaciada.', {icon: '🧹'});
          }}>Sí, vaciar</button>
        </div>
      </span>
    ), { duration: 6000 });
  };

  const procesarPago = async () => {
    if (carrito.length === 0) {
      toast.error('Tu bolsa está vacía.', { icon: '🤷‍♀️' });
      return;
    }

    const loadToast = toast.loading('Procesando tu pago encriptado...');

    try {
      const respuesta = await fetch('https://birriasshopbackend.onrender.com/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carrito)
      });
      const datos = await respuesta.json();

      toast.dismiss(loadToast);

      if (datos.exito) {
        setCarrito([]); 
        localStorage.removeItem('birrias_cart_v3');
        setVista('inicio'); 
        
        toast.success((t) => (
          <span>
            <b>¡🎉 ${datos.mensaje} 🎉!</b> <br />
            Tu folio es: <code style={{background: '#eee', padding: '2px 5px', borderRadius: '4px'}}>#{datos.folio.substring(0,8)}...</code> <br />
            Recibirás un correo de confirmación pronto.
          </span>
        ), { duration: 8000, icon: <FiCheckCircle size={30} color="green"/> });

      } else {
        toast.error(`Error: ${datos.mensaje}`, { icon: <FiXCircle color="red"/> });
      }
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error('Hubo un problema de conexión para procesar tu pago.', {icon: '❌'});
    }
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const cantidadArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);

  const productosFiltrados = categoriaActual === 'Todas' 
    ? productos 
    : productos.filter(producto => producto.categoria === categoriaActual);

  const iconosCategorias = {
    'Todas': <IoFilterOutline />,
    'Hombre': <IoShirtOutline />,
    'Mujer': <IoDiamondOutline />, 
    'Accesorios': <FiShoppingBag />
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <header className="site-header">
        <div className="container header-inner">
          <a className="logo" href="#" onClick={(e) => { e.preventDefault(); setVista('inicio'); }}>
            {/* Corregido: Comillas en la variable CSS */}
            Birrias <span style={{color: 'var(--color-rojo)', fontWeight: '400'}}>Shop</span>
          </a>
          <nav aria-label="Principal">
            <a href="#" onClick={(e) => { e.preventDefault(); setVista('inicio'); }} className={vista === 'inicio' ? 'activo' : ''}>
              Inicio
            </a>
            <div className="cart-link-contenedor">
              <a href="#" onClick={(e) => { e.preventDefault(); setVista('carrito'); }} className={vista === 'carrito' ? 'activo' : ''}>
                <FiShoppingBag size={20} /> <span>Bolsa</span>
                {cantidadArticulos > 0 && <span className="cart-badge">{cantidadArticulos}</span>}
              </a>
            </div>
            <a href="#" title="Mi Cuenta"><FiUser size={20}/></a>
          </nav>
        </div>
      </header>

      <main>
        {vista === 'inicio' ? (
          <>
            <section className="hero">
              <div className="hero-content">
                <h1>Legado y Estilo Rojiblanco</h1>
                <p>Descubre nuestra colección premium para el verdadero aficionado. Calidad, diseño y pasión en cada prenda.</p>
                <a href="#catalogo" className="hero-boton" onClick={(e) => {e.preventDefault(); document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });}}>
                  {/* Corregido: Uso del icono correcto */}
                  Ver Colección <FiArrowRight />
                </a>
              </div>
            </section>

            <section className="container" id="catalogo" style={{scrollMarginTop: '100px'}}>
              <h2 className="seccion-titulo">Novedades</h2>
              <p className="seccion-subtitulo">Lo último en tendencia para la afición más exigente.</p>

              <div className="filtro-contenedor">
                {['Todas', 'Hombre', 'Mujer', 'Accesorios'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoriaActual(cat)}
                    className={`filtro-boton ${categoriaActual === cat ? 'activo' : ''}`}
                  >
                    {iconosCategorias[cat]} {cat}
                  </button>
                ))}
              </div>

              <div className="grid-tarjetas">
                {productosFiltrados.length === 0 ? (
                  <div style={{textAlign: 'center', gridColumn: '1 / -1', padding: '50px 0'}}>
                    <IoShirtOutline size={50} color="var(--color-borde)" style={{marginBottom: '20px'}}/>
                    <h3 style={{color: 'var(--color-texto-suave)', fontWeight: '500'}}>Preparando las mejores prendas para esta categoría...</h3>
                  </div>
                ) : (
                  productosFiltrados.map((producto, index) => (
                    <motion.div 
                      key={producto._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                    >
                      <TarjetaProducto 
                        producto={producto} 
                        onAgregar={agregarAlCarrito} 
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="container carrito-seccion">
            <h2 className="seccion-titulo">Tu Bolsa de Compras</h2>
            <p className="seccion-subtitulo" style={{marginBottom: '50px'}}>Repasa tus artículos antes de proceder al pago seguro.</p>
            
            {carrito.length === 0 ? (
              <div className="cart-vacio-contenedor">
                <FiShoppingBag className="cart-vacio-icon" />
                <h3>Tu bolsa está vacía</h3>
                <p style={{color: 'var(--color-texto-suave)', marginBottom: '30px'}}>¿Aún no te decides? Tenemos prendas esperándote.</p>
                <button className="boton" style={{width: 'auto', margin: '0 auto'}} onClick={() => setVista('inicio')}>
                  Descubrir novedades
                </button>
              </div>
            ) : (
              <div className="carrito-container">
                {carrito.map((item, index) => (
                  <div className="carrito-item" key={`${item._id}-${item.talla}-${index}`}>
                    <div className="carrito-item-info">
                      <img src={item.imagen} alt={item.nombre} />
                      <div className="carrito-item-detalles">
                        <h4>{item.nombre}</h4>
                        <p>
                          Precio Unitario: ${item.precio.toFixed(2)}
                          <span className="talla-badge">Talla {item.talla}</span>
                          Cantidad: {item.cantidad}
                        </p>
                      </div>
                    </div>
                    <div className="carrito-item-precio">
                      <span className="subtotal-item">${(item.precio * item.cantidad).toFixed(2)} MXN</span>
                      <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item._id, item.talla)}>
                        <FiTrash2 size={16}/> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="carrito-total-contenedor">
                  <span className="carrito-total-etiqueta">Total Estimado</span>
                  <h3 className="carrito-total">${totalCarrito.toFixed(2)} MXN</h3>
                </div>
                
                <div className="carrito-acciones">
                  <button className="boton boton-secundario" style={{width: 'auto'}} onClick={vaciarCarrito}>
                    Vaciar Bolsa
                  </button>
                  <button className="boton" style={{width: 'auto'}} onClick={procesarPago}>
                    <FiCheckCircle size={18}/> Proceder al Pago Seguro
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <a className="logo-footer" href="#" onClick={(e) => { e.preventDefault(); setVista('inicio'); }}>
             {/* Corregido: Comillas en la variable CSS */}
             Birrias <span style={{color: 'var(--color-rojo)', fontWeight: '400'}}>Shop</span>
          </a>
          <p>&copy; {anioActual} — Una pasión conmemorativa. No oficial.</p>
          <p className="footer-creditos">Exclusividad y Estilo para la Afición Rojiblanca.</p>
        </div>
      </footer>
    </>
  );
}

export default App;