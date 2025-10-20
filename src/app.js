require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const autoPublish = require('./utils/autoPublisher');
const initAdmin = require('./utils/initAdmin');

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173', // frontend URL
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/tests', require('./routes/testResultRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));

// Har 1 daqiqa autoPublish
setInterval(autoPublish, 60 * 1000);

// Server start + initAdmin
const Port = process.env.PORT || 5000;

(async () => {
  await initAdmin(); // ✅ Admin tekshiruvi avval
  app.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
  });
})();
