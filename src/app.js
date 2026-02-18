require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const autoPublish = require('./utils/autoPublisher');
const initAdmin = require('./utils/initAdmin');

const parseEnvList = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const resolveTrustProxy = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = String(value).toLowerCase().trim();

  if (normalized === 'true') return true;
  if (normalized === 'false') return false;

  const asNumber = Number(normalized);
  if (!Number.isNaN(asNumber)) return asNumber;

  return value;
};

const corsOrigins = [
  ...parseEnvList(process.env.FRONTEND_URL),
  ...parseEnvList(process.env.CORS_ORIGINS)
];
const allowedOrigins = [
  ...new Set([
    'http://localhost:5173',
    ...corsOrigins
  ])
];

const trustProxy = resolveTrustProxy(process.env.TRUST_PROXY);
if (trustProxy !== undefined) {
  app.set('trust proxy', trustProxy);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Mobile app, curl, Postman kabi origin yubormaydigan clientlar uchun.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
app.use('/api', require('./routes/healthRoutes'));
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
