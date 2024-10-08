// app.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/config');
const db = require('./models');
const morgan = require('morgan');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');


const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes =require('./routes/student');

app.use(session({
  secret: 'your-secret-key', // Use a secret key for session encryption
  resave: false,             // Don't save the session if it wasn't modified
  saveUninitialized: false,  // Don't create a session until something is stored
  cookie: { 
    secure: false,           // Set to true if you're using HTTPS
    maxAge: 60000 * 60 * 1  // Session expires after 1 hours
  }
}));
// After other middleware
app.use(cookieParser());

// Middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Logging middleware
app.use(morgan('dev'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



// Root Route Redirect to Admin Dashboard
app.get('/', (req, res) => {
  res.redirect('/admin/login');
});

// Use admin routes
app.use('/admin', adminRoutes);

// teacher routes
app.use('/teacher', teacherRoutes);

//student route
app.use('/student',studentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.stack);
  res.status(500).send('Something went wrong!');
});

// Sync Sequelize models with the database
db.sequelize.sync({ alter: true }) // 'alter: true' adjusts tables to match models without dropping them
  .then(() => {
    console.log('✅ Database synchronized');
  })
  .catch((err) => {
    console.error('❌ Error synchronizing the database:', err);
  });



sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });


  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
