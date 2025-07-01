const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const path = require('path');
const authRoutes = require('./src/routes/auth.route');
const productRoutes = require('./src/routes/product.route');
const attributeRoutes = require('./src/routes/attribute.route');
const batchRoutes = require('./src/routes/batch.route');
const orderRoutes = require('./src/routes/order.route');
const revenueRoutes = require('./src/routes/statistics.route');
const captchaRoute = require('./src/routes/captcha.route');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/', attributeRoutes);
app.use('/', batchRoutes);
app.use('/', orderRoutes);
app.use('/', revenueRoutes);
app.use('/', captchaRoute);

app.use('/images', express.static(path.join(__dirname, 'public/products')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
