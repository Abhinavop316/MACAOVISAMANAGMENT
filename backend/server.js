require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { verifyTransporter } = require('./src/services/email.service');

// Connect to MongoDB
connectDB();

// Verify Nodemailer SMTP connection on startup
verifyTransporter();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});