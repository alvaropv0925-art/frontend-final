const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir los archivos estáticos de la tienda
app.use(express.static(path.join(__dirname)));

// Endpoint POST para registrar la compra de los compañeros
app.post('/api/comprar', (req, res) => {
    const { nombreCompleto, correo, telefono, direccion, carrito, total } = req.body;

    const fecha = new Date().toLocaleString('es-CO');
    const productosDetalle = carrito.map(p => `${p.nombre} [Talla: ${p.talla || 'N/A'}] (x${p.cantidad})`).join(' | ');

    // Formato CSV para BasedeDatos.csv
    const lineaCSV = `"${nombreCompleto}","${correo}","${telefono}","${direccion}","${productosDetalle}","${total}","${fecha}"
`;

    const csvFile = path.join(__dirname, 'BasedeDatos.csv');

    // Si el archivo no existe, crearlo con encabezados
    if (!fs.existsSync(csvFile)) {
fs.writeFileSync(csvfile, 'Nombre Completo,Correo Electronico,Telefono,Direccion,Productos,Total,Fecha\n');    }

    fs.appendFile(csvFile, lineaCSV, 'utf8', (err) => {
        if (err) {
            console.error('Error al guardar la compra en el archivo:', err);
            return res.status(500).json({ exito: false, mensaje: 'Error al registrar la compra' });
        }
        console.log(`[NUEVA COMPRA REGISTRADA] Cliente: ${nombreCompleto} (${correo}) - Total: $${total}`);
        return res.json({ exito: true, mensaje: 'Compra registrada con éxito' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Frontend Store corriendo en http://localhost:${PORT}`);
});
