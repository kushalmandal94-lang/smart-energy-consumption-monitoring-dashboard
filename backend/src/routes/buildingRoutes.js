const express = require('express');
const router = express.Router();
const {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingComparison,
} = require('../controllers/buildingController');
const { protect, authorize, requireWriteAccess, enforceBuildingAccess } = require('../middleware/auth');

router.use(protect);

// Performance Comparison (accessible to admin, manager, operator, viewer)
router.get('/performance/comparison', getBuildingComparison);

router.route('/')
  .get(getBuildings)
  .post(authorize('admin'), createBuilding);

router.route('/:id')
  .get(enforceBuildingAccess('id'), getBuildingById)
  .put(authorize('admin'), updateBuilding)
  .delete(authorize('admin'), deleteBuilding);

module.exports = router;

