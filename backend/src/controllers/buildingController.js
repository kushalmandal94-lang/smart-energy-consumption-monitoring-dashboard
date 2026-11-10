const mongoose = require('mongoose');
const Building = require('../models/Building');
const Device = require('../models/Device');
const { logAction } = require('../utils/auditLogger');

// Resilient in-memory building database
const initialBuildings = [
  {
    _id: '663b00000000000000000001',
    name: 'Main Facility',
    code: 'BLD-HQ-01',
    location: '100 Innovation Blvd, Tech Park, Austin, TX',
    totalAreaSqFt: 45000,
    floorCount: 5,
    capacity: 750,
    assignedManagers: ['Marcus Vance', 'Alex Rivera'],
    metersCount: 6,
    smartLoadsCount: 8,
    baselineDemandKW: 42.5,
    dailyTargetKWh: 420.0,
    monthlyBudgetLimit: 2200.0,
    efficiencyScore: 91,
    status: 'active',
    solarCapacityKW: 28.0,
    dailyKWh: 388.4,
    monthlyKWh: 9420.0,
    monthlyCost: 1413.0,
    carbonKg: 3626.7,
    peakDemandKW: 48.2,
    todayCost: 58.26,
  },
  {
    _id: '663b00000000000000000002',
    name: 'Research & Development Center',
    code: 'BLD-RD-02',
    location: '105 Innovation Blvd, Tech Park, Austin, TX',
    totalAreaSqFt: 32000,
    assignedManagers: ['Marcus Vance', 'Dr. Elena Rostova'],
    metersCount: 4,
    smartLoadsCount: 6,
    baselineDemandKW: 36.0,
    dailyTargetKWh: 340.0,
    monthlyBudgetLimit: 1750.0,
    efficiencyScore: 86,
    status: 'active',
    solarCapacityKW: 18.5,
    dailyKWh: 312.6,
    monthlyKWh: 7890.0,
    monthlyCost: 1183.5,
    carbonKg: 3037.6,
    peakDemandKW: 39.5,
    todayCost: 46.89,
  },
  {
    _id: '663b00000000000000000003',
    name: 'Logistics & Warehousing Hub',
    code: 'BLD-LOG-03',
    location: '500 Freight Way, North Sector, Austin, TX',
    totalAreaSqFt: 68000,
    assignedManagers: ['Alex Rivera'],
    metersCount: 5,
    smartLoadsCount: 7,
    baselineDemandKW: 58.0,
    dailyTargetKWh: 580.0,
    monthlyBudgetLimit: 2900.0,
    efficiencyScore: 78,
    status: 'active',
    solarCapacityKW: 45.0,
    dailyKWh: 546.2,
    monthlyKWh: 13450.0,
    monthlyCost: 2017.5,
    carbonKg: 5178.2,
    peakDemandKW: 64.8,
    todayCost: 81.93,
  },
  {
    _id: '663b00000000000000000004',
    name: 'Executive Office Tower',
    code: 'BLD-TWR-04',
    location: '1200 Congress Ave, Downtown, Austin, TX',
    totalAreaSqFt: 55000,
    assignedManagers: ['Alex Rivera'],
    metersCount: 5,
    smartLoadsCount: 6,
    baselineDemandKW: 48.0,
    dailyTargetKWh: 490.0,
    monthlyBudgetLimit: 2400.0,
    efficiencyScore: 84,
    status: 'active',
    solarCapacityKW: 12.0,
    dailyKWh: 462.8,
    monthlyKWh: 11200.0,
    monthlyCost: 1680.0,
    carbonKg: 4312.0,
    peakDemandKW: 53.6,
    todayCost: 69.42,
  },
  {
    _id: '663b00000000000000000005',
    name: 'Manufacturing & Assembly Plant',
    code: 'BLD-MFG-05',
    location: '800 Industrial Parkway, Austin, TX',
    totalAreaSqFt: 85000,
    assignedManagers: ['Alex Rivera', 'Dr. Elena Rostova'],
    metersCount: 8,
    smartLoadsCount: 12,
    baselineDemandKW: 92.0,
    dailyTargetKWh: 950.0,
    monthlyBudgetLimit: 4800.0,
    efficiencyScore: 74,
    status: 'active',
    solarCapacityKW: 50.0,
    dailyKWh: 890.5,
    monthlyKWh: 21980.0,
    monthlyCost: 3297.0,
    carbonKg: 8462.3,
    peakDemandKW: 104.2,
    todayCost: 133.58,
  },
];

const offlineBuildings = new Map();
initialBuildings.forEach((b) => offlineBuildings.set(b.name, b));

// Helper to filter buildings by user role and building assignments
const getScopedBuildings = (user) => {
  const all = Array.from(offlineBuildings.values());
  if (user.role === 'admin' || user.role === 'operator') {
    return all;
  }
  const assigned = user.assignedBuildings || [];
  if (assigned.includes('All Buildings')) return all;
  return all.filter((b) => assigned.some((a) => a.toLowerCase() === b.name.toLowerCase()));
};

// @desc    Get all accessible buildings for current user
// @route   GET /api/buildings
// @access  Private
const getBuildings = async (req, res, next) => {
  try {
    const scoped = getScopedBuildings(req.user);
    res.status(200).json({
      success: true,
      count: scoped.length,
      data: scoped,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single building by ID or name
// @route   GET /api/buildings/:id
// @access  Private
const getBuildingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scoped = getScopedBuildings(req.user);
    const building = scoped.find((b) => b._id === id || b.name.toLowerCase() === id.toLowerCase() || b.code === id.toUpperCase());

    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found or you do not have permission to access it.',
      });
    }

    res.status(200).json({ success: true, data: building });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new building (Admin only)
// @route   POST /api/buildings
// @access  Private (Admin only)
const createBuilding = async (req, res, next) => {
  try {
    const {
      name,
      code,
      location,
      totalAreaSqFt,
      floorCount,
      capacity,
      assignedManagers,
      baselineDemandKW,
      dailyTargetKWh,
      monthlyBudgetLimit,
      solarCapacityKW,
    } = req.body;

    if (offlineBuildings.has(name)) {
      return res.status(400).json({
        success: false,
        message: `Building with name '${name}' already exists.`,
      });
    }

    const newBuilding = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      code: (code || `BLD-${Math.floor(10 + Math.random() * 90)}`).trim().toUpperCase(),
      location: location || 'Tech Campus Zone B',
      totalAreaSqFt: Number(totalAreaSqFt) || 30000,
      floorCount: Number(floorCount) || 4,
      capacity: Number(capacity) || 500,
      assignedManagers: Array.isArray(assignedManagers) ? assignedManagers : ['Marcus Vance'],
      metersCount: 0,
      smartLoadsCount: 0,
      baselineDemandKW: Number(baselineDemandKW) || 25.0,
      dailyTargetKWh: Number(dailyTargetKWh) || 250.0,
      monthlyBudgetLimit: Number(monthlyBudgetLimit) || 1200.0,
      efficiencyScore: 85,
      status: 'active',
      solarCapacityKW: Number(solarCapacityKW) || 10.0,
      dailyKWh: 215.0,
      monthlyKWh: 5200.0,
      monthlyCost: 780.0,
      carbonKg: 2002.0,
      peakDemandKW: 29.5,
      todayCost: 32.25,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    offlineBuildings.set(newBuilding.name, newBuilding);

    if (mongoose.connection.readyState === 1) {
      try {
        await Building.create(newBuilding);
      } catch (err) {
        console.warn('MongoDB building creation deferred:', err.message);
      }
    }

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BUILDING_CREATED',
      entityType: 'building',
      entityId: newBuilding._id,
      building: newBuilding.name,
      details: { building: newBuilding.name, code: newBuilding.code },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Building '${newBuilding.name}' created successfully.`,
      data: newBuilding,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update building details
// @route   PUT /api/buildings/:id
// @access  Private (Admin only)
const updateBuilding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const building = Array.from(offlineBuildings.values()).find((b) => b._id === id || b.name === id);

    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    const {
      location,
      totalAreaSqFt,
      floorCount,
      capacity,
      assignedManagers,
      baselineDemandKW,
      dailyTargetKWh,
      monthlyBudgetLimit,
      solarCapacityKW,
      status,
    } = req.body;

    if (location) building.location = location;
    if (totalAreaSqFt) building.totalAreaSqFt = Number(totalAreaSqFt);
    if (floorCount !== undefined) building.floorCount = Number(floorCount);
    if (capacity !== undefined) building.capacity = Number(capacity);
    if (assignedManagers) building.assignedManagers = assignedManagers;
    if (baselineDemandKW) building.baselineDemandKW = Number(baselineDemandKW);
    if (dailyTargetKWh) building.dailyTargetKWh = Number(dailyTargetKWh);
    if (monthlyBudgetLimit) building.monthlyBudgetLimit = Number(monthlyBudgetLimit);
    if (solarCapacityKW !== undefined) building.solarCapacityKW = Number(solarCapacityKW);
    if (status) building.status = status;
    building.updatedAt = new Date();

    offlineBuildings.set(building.name, building);

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BUILDING_UPDATED',
      entityType: 'building',
      entityId: id,
      building: building.name,
      details: req.body,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Building '${building.name}' updated successfully.`,
      data: building,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete building (Admin only) with dependency checks
// @route   DELETE /api/buildings/:id
// @access  Private (Admin only)
const deleteBuilding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const building = Array.from(offlineBuildings.values()).find((b) => b._id === id || b.name === id);

    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    // Dependency check: inspect assigned devices / meters
    let assignedDevicesCount = 0;
    if (mongoose.connection.readyState === 1) {
      try {
        assignedDevicesCount = await Device.countDocuments({ building: building.name });
      } catch (err) {
        assignedDevicesCount = building.metersCount || 0;
      }
    } else {
      assignedDevicesCount = building.metersCount || 0;
    }

    if (assignedDevicesCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `Dependency Check Failed: Cannot delete '${building.name}' because ${assignedDevicesCount} active energy meters or IoT devices are currently assigned. Please reassign or remove all devices before deleting this facility.`,
        assignedDevicesCount,
      });
    }

    offlineBuildings.delete(building.name);

    if (mongoose.connection.readyState === 1) {
      try {
        await Building.deleteOne({ _id: building._id });
      } catch (err) {
        console.warn('MongoDB building delete deferred:', err.message);
      }
    }

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BUILDING_DELETED',
      entityType: 'building',
      entityId: id,
      building: building.name,
      details: { deletedBuilding: building.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Building '${building.name}' has been deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Building Performance Comparison Analytics
// @route   GET /api/buildings/performance/comparison
// @access  Private
const getBuildingComparison = async (req, res, next) => {
  try {
    const scoped = getScopedBuildings(req.user);

    // Sort by monthly consumption to identify highest consuming
    const ranked = [...scoped].sort((a, b) => b.monthlyKWh - a.monthlyKWh);
    const highestConsuming = ranked[0]?.name || 'None';

    const comparisonData = ranked.map((b, index) => ({
      rank: index + 1,
      name: b.name,
      code: b.code,
      areaSqFt: b.totalAreaSqFt,
      dailyKWh: b.dailyKWh,
      monthlyKWh: b.monthlyKWh,
      monthlyCost: b.monthlyCost,
      dailyCost: b.todayCost,
      carbonEmissionsKg: b.carbonKg,
      efficiencyScore: b.efficiencyScore,
      energyIntensityKWhPerSqFt: +(b.monthlyKWh / (b.totalAreaSqFt || 1)).toFixed(2),
      solarContributionKWh: +(b.solarCapacityKW * 4.5 * 30).toFixed(0),
      isHighestConsuming: b.name === highestConsuming,
    }));

    const totalPortfolioConsumptionKWh = comparisonData.reduce((acc, b) => acc + b.monthlyKWh, 0);
    const totalPortfolioCost = comparisonData.reduce((acc, b) => acc + b.monthlyCost, 0);
    const avgEfficiency = Math.round(comparisonData.reduce((acc, b) => acc + b.efficiencyScore, 0) / (comparisonData.length || 1));

    res.status(200).json({
      success: true,
      data: {
        buildings: comparisonData,
        summary: {
          totalBuildings: comparisonData.length,
          highestConsumingBuilding: highestConsuming,
          totalPortfolioMonthlyKWh: totalPortfolioConsumptionKWh,
          totalPortfolioMonthlyCost: +totalPortfolioCost.toFixed(2),
          portfolioAverageEfficiency: avgEfficiency,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingComparison,
};

