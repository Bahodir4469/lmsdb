// src/routes/healthRoutes.js
// Health check endpoint - Docker health check uchun

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    // Database connection test
    await prisma.$queryRaw`SELECT 1`;

    // Response
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

/**
 * @route GET /api/health/db
 * @desc Database health check
 * @access Public
 */
router.get('/health/db', async (req, res) => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: 'connected',
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    res.status(503).json({
      status: 'disconnected',
      error: error.message
    });
  }
});

/**
 * @route GET /api/health/ready
 * @desc Readiness probe (Kubernetes uchun)
 * @access Public
 */
router.get('/health/ready', async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    // Check critical dependencies
    const checks = {
      database: true,
      diskSpace: true, // Bu yerda disk space check qo'shish mumkin
      memory: process.memoryUsage().heapUsed < 450 * 1024 * 1024 // 450MB
    };

    const allHealthy = Object.values(checks).every(check => check === true);

    if (allHealthy) {
      res.status(200).json({
        status: 'ready',
        checks
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        checks
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

/**
 * @route GET /api/health/live
 * @desc Liveness probe (Kubernetes uchun)
 * @access Public
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
