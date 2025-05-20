require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();

// Database connection
mongoose.connect(process.env.MONGO_URI);
const subSchema = new mongoose.Schema({
  name: String,
  email: String,
  whatsapp: String,
  subscriptionPlan: String,
  paymentMethod: String,
  paymentMade: String,
  date: { type: Date, default: Date.now }
});
const Subscription = mongoose.model('Subscription', subSchema);

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Add absolute path
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Absolute path for static files

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/form', (req, res) => res.render('form'));
app.get('/success', (req, res) => res.render('success'));

app.post('/submit', async (req, res) => {
  try {
    const newSub = new Subscription(req.body);
    await newSub.save();
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'Success Premium Subscription',
      text: `New subscription details:\n${JSON.stringify(req.body, null, 2)}`
    };

    await transporter.sendMail(mailOptions);
    res.redirect('/success');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));