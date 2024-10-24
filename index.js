//Env
require('dotenv').config();
const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//Conection DB
const { dbConection } = require('./database/config');

// Crear el servidor express
const app = express();

// CORS
app.use(cors());

//app.use(express.bodyParser({ limit: '50mb' }));
// READ BODY
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));


// DataBase
dbConection();

// DIRECTORIO PUBLICO
app.use(express.static('public'));

// RUTAS
app.use('/api/abonados', require('./routes/abonados.route'));
app.use('/api/clients', require('./routes/clients.route'));
app.use('/api/correctives', require('./routes/correctives.route'));

app.use('/api/login', require('./routes/auth.route'));

app.use('/api/prefixes', require('./routes/prefix.route'));
app.use('/api/preventives', require('./routes/preventives.route'));
app.use('/api/products', require('./routes/products.route'));
app.use('/api/search', require('./routes/search.route'));
app.use('/api/users', require('./routes/users.route'));
app.use('/api/tasks', require('./routes/tasks.route'));
app.use('/api/uploads', require('./routes/uploads.route'));

app.use('/api/inventory', require('./routes/inventory.route'));

app.use('/api/logproducts', require('./routes/logproducts.route'));
app.use('/api/invoices', require('./routes/invoice.route'));

// SPA
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.listen(process.env.PORT, () => {
    console.log('Servidor Corriendo en el Puerto', process.env.PORT);
});