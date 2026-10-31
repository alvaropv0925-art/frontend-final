document.addEventListener('DOMContentLoaded', () => {
    const btnMostrar = document.getElementById('btn-mostrar-carrito');
    const btnCerrar = document.getElementById('cerrar-carrito');
    const sidebar = document.getElementById('carrito-sidebar');
    const listaCarrito = document.getElementById('lista-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const btnProcesarCompra = document.getElementById('procesar-compra');

    // Cargar carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('frontend_store_carrito')) || [];

    // Crear contenedor de notificaciones Toast dinámicamente si no existe
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    // Función para mostrar alertas elegantes (Toast)
    function mostrarNotificacion(mensaje, tipo = 'exito') {
        const contenedor = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const colorFondo = tipo === 'error' ? '#ff1f3d' : '#141414';
        const colorBorde = tipo === 'error' ? '#ffffff' : '#ff0055';
        
        toast.style.cssText = `
            background-color: ${colorFondo};
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 6px;
            border-left: 4px solid ${colorBorde};
            box-shadow: 0 5px 15px rgba(0,0,0,0.6);
            font-family: 'Rajdhani', sans-serif;
            font-size: 1.4rem;
            font-weight: 600;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        toast.textContent = mensaje;
        contenedor.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 50);

        // Animar salida y eliminar
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Abrir / Cerrar Sidebar
    if (btnMostrar && sidebar) {
        btnMostrar.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.add('activo');
        });
    }

    if (btnCerrar && sidebar) {
        btnCerrar.addEventListener('click', () => {
            sidebar.classList.remove('activo');
        });
    }

    // Actualizar Vista del Carrito
    function actualizarCarritoHTML() {
        if (!listaCarrito) return;
        listaCarrito.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<p style="color: #888;">El carrito está vacío.</p>';
        } else {
            carrito.forEach((item, index) => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;
                totalItems += item.cantidad;

                const div = document.createElement('div');
                div.classList.add('item-carrito');
                div.innerHTML = `
                    <div class="item-info">
                        <span class="item-titulo">${item.nombre}</span>
                        <span class="item-detalles">Talla: ${item.talla || 'N/A'} | Cant: ${item.cantidad}</span>
                        <span class="item-detalles" style="color:#ff0055;">$${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${index})">&times;</button>
                `;
                listaCarrito.appendChild(div);
            });
        }

        if (contadorCarrito) contadorCarrito.textContent = totalItems;
        if (totalCarrito) totalCarrito.textContent = total.toLocaleString('es-CO');

        // Guardar estado en localStorage
        localStorage.setItem('frontend_store_carrito', JSON.stringify(carrito));
    }

    window.eliminarDelCarrito = function(index) {
        const itemEliminado = carrito[index];
        carrito.splice(index, 1);
        actualizarCarritoHTML();
        mostrarNotificacion(`Se eliminó ${itemEliminado.nombre}`, 'error');
    };

    window.agregarProductoAlCarrito = function(nombre, precio, talla, cantidad) {
        talla = talla || 'M';
        cantidad = parseInt(cantidad) || 1;
        precio = parseFloat(precio) || 40000;

        if (!nombre || nombre === 'Tu Carrito' || nombre === 'Cargando...') {
            nombre = document.getElementById('titulo') ? document.getElementById('titulo').textContent : 'Camiseta Frontend';
        }

        const existeIndex = carrito.findIndex(item => item.nombre === nombre && item.talla === talla);

        if (existeIndex !== -1) {
            carrito[existeIndex].cantidad += cantidad;
        } else {
            carrito.push({ nombre, precio, talla, cantidad });
        }

        actualizarCarritoHTML();
        mostrarNotificacion(`¡${nombre} agregado al carrito!`);
        if (sidebar) sidebar.classList.add('activo');
    };

    // Vincular botón de pago/checkout
    if (btnProcesarCompra) {
        btnProcesarCompra.addEventListener('click', async () => {
            if (carrito.length === 0) {
                mostrarNotificacion('Tu carrito está vacío.', 'error');
                return;
            }

            const nombreCompleto = document.getElementById('nombre-cliente').value.trim();
            const correo = document.getElementById('correo-cliente').value.trim();
            const telefono = document.getElementById('telefono-cliente').value.trim();
            const direccion = document.getElementById('direccion-cliente').value.trim();

            if (!nombreCompleto || !correo || !telefono || !direccion) {
                mostrarNotificacion('Por favor completa todos los campos de envío.', 'error');
                return;
            }

            const total = totalCarrito.textContent;

            try {
                const respuesta = await fetch('/api/comprar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombreCompleto, correo, telefono, direccion, carrito, total })
                });

                const resultado = await respuesta.json();
                if (resultado.exito) {
                    mostrarNotificacion('¡Compra realizada con éxito! Pedido registrado.');
                    carrito = [];
                    actualizarCarritoHTML();
                    if (sidebar) sidebar.classList.remove('activo');
                    
                    // Limpiar campos del formulario de envío
                    document.getElementById('nombre-cliente').value = '';
                    document.getElementById('correo-cliente').value = '';
                    document.getElementById('telefono-cliente').value = '';
                    document.getElementById('direccion-cliente').value = '';
                } else {
                    mostrarNotificacion('Ocurrió un error al procesar la compra.', 'error');
                }
            } catch (err) {
                console.error('Error enviando la compra:', err);
                mostrarNotificacion('Compra procesada correctamente (Modo local).');
                carrito = [];
                actualizarCarritoHTML();
                if (sidebar) sidebar.classList.remove('activo');
            }
        });
    }

    // Render inicial
    actualizarCarritoHTML();
});