const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const verifyToken = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router
  .route('/')
  .get(verifyToken, assignmentController.getAssignments)
  .post(verifyToken, adminOnly, upload.array('files'), assignmentController.createAssignment);

router
  .route('/:id')
  .get(verifyToken, assignmentController.getAssignmentById)
  .delete(verifyToken, adminOnly, assignmentController.deleteAssignment);

router.post(
  '/:id/submit',
  verifyToken,
  upload.single('files'),
  assignmentController.submitAssignment
);
router.put(
  '/:id',
  verifyToken,
  adminOnly,
  upload.array('files'),
  assignmentController.updateAssignment
);
router.put(
  '/submissions/:id',
  verifyToken,
  upload.single('files'),
  assignmentController.updateAssignmentSubmission
);

router.delete(
  '/submissions/:id',
  verifyToken,
  assignmentController.deleteSubmission
);

router.patch(
  '/:id/status',
  verifyToken,
  adminOnly,
  assignmentController.updateAssignmentStatus
);

module.exports = router;
