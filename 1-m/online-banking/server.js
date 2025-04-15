/* server.js */
/*
  Main entry point for the enhanced online banking application.
  Sets up middlewares, routes, view engine, static files, and connects to MongoDB.
*/

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const fundTransferRoutes = require('./routes/fundTransfer');
const adminRoutes = require('./routes/admin');
const connectDB = require('./config/db');  // Import our DB connection function

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Express Session – (In production, use a more robust store)
app.use(session({
  secret: 'banking_secret_key_0123456789!@#$%^&*()_+',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Setup view engine (using EJS)
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Mount routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/transfer', fundTransferRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('404: Resource not found.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error encountered:', err);
  res.status(500).send('500: Internal Server Error.');
});

// Extra route for testing delays (simulate slow responses)
app.get('/delay', (req, res) => {
  setTimeout(() => res.send('Response after delay'), 5000);
});

// Logging for debugging
for (let i = 0; i < 20; i++) {
  console.log(`Extended logging line ${i + 1}`);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
