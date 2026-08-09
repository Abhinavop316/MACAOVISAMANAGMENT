const express = require('express');
const cors = require('cors');

//router
const clientRouter = require('./routes/client.route');
const adminRouter = require('./routes/admin.route');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', clientRouter);
app.use('/api/admin', adminRouter);

module.exports = app;