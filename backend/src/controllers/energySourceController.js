const mongoose = require('mongoose');
const EnergySource = require('../models/EnergySource');
const { logAction } = require('../utils/auditLogger');

// Resilient in-memory store pre-seeded with all 4 required energy source types: Solar, Grid, Wind, Generator
const initialSources = [
  {
    _id: '664a00010001000100010001',
    name: 'Rooftop Solar PV Array A',
    sourceType: 'Solar',
    category: 'renewable',
    building: 'Main Facility',
    capacityKW: 50.0,
    currentGenerationKW: 34.2,
    todayGenerationKWh: 185.6,
    monthlyGenerationKWh: 4620.0,
    efficiencyPercent: 94,
    status: 'active',
    carbonIntensityKgPerKWh: 0.0,
    fuelOrTechnology: 'Monocrystalline Silicon PV 450W Panels',
    installationDate: new Date('2024-03-15'),
    lastUpdated: new Date(),
  },
  {
    _id: '664a00010001000100010002',
    name: 'Austin Municipal Utility Grid Connection',
    sourceType: 'Grid',
    category: 'non-renewable',
    building: 'All Buildings',
    capacityKW: 250.0,
    currentGenerationKW: 112.5,
    todayGenerationKWh: 615.4,
    monthlyGenerationKWh: 15420.0,
    efficiencyPercent: 98,
    status: 'active',
    carbonIntensityKgPerKWh: 0.42,
    fuelOrTechnology: '3-Phase 480V Interconnection Substation',
    installationDate: new Date('2023-01-10'),
    lastUpdated: new Date(),
  },
  {
    _id: '664a00010001000100010003',
    name: 'East Campus Wind Turbine #1',
    sourceType: 'Wind',
    category: 'renewable',
    building: 'Logistics & Warehousing Hub',
    capacityKW: 30.0,
    currentGenerationKW: 18.6,
    todayGenerationKWh: 94.2,
    monthlyGenerationKWh: 2310.0,
    efficiencyPercent: 88,
    status: 'active',
    carbonIntensityKgPerKWh: 0.0,
    fuelOrTechnology: 'Direct Drive 3-Blade Micro Wind Turbine',
    installationDate: new Date('2024-08-20'),
    lastUpdated: new Date(),
  },
  {
    _id: '664a00010001000100010004',
    name: 'Emergency Backup Diesel Generator #1',
    sourceType: 'Generator',
    category: 'non-renewable',
    building: 'Research & Development Center',
    capacityKW: 150.0,
    currentGenerationKW: 0.0,
    todayGenerationKWh: 0.0,
    monthlyGenerationKWh: 45.0,
    efficiencyPercent: 82,
    status: 'standby',
    carbonIntensityKgPerKWh: 0.76,
    fuelOrTechnology: 'Cummins QSK19 Clean Diesel (Standby)',
    installationDate: new Date('2023-06-05'),
    lastUpdated: new Date(),
  },
];

const offlineSources = new Map();
initialSources.forEach((s) => offlineSources.set(s._id, s));

// @desc    Get all energy sources
// @route   GET /api/energy-sources
// @access  Private
const getEnergySources = async (req, res, next) => {
  try {
    const { building, sourceType, category } = req.query;
    let sources = Array.from(offlineSources.values());

    if (building && building !== 'ALL' && building !== 'All Buildings') {
      sources = sources.filter(
        (s) => s.building === building || s.building === 'All Buildings'
      );
    }
    if (sourceType && sourceType !== 'ALL') {
      sources = sources.filter((s) => s.sourceType.toLowerCase() === sourceType.toLowerCase());
    }
    if (category && category !== 'ALL') {
      sources = sources.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    res.status(200).json({
      success: true,
      count: sources.length,
      data: sources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get source-wise generation and consumption breakdown with renewable share
// @route   GET /api/energy-sources/breakdown
// @access  Private
const getEnergyBreakdown = async (req, res, next) => {
  try {
    const { building } = req.query;
    let sources = Array.from(offlineSources.values());

    if (building && building !== 'ALL' && building !== 'All Buildings') {
      sources = sources.filter(
        (s) => s.building === building || s.building === 'All Buildings'
      );
    }

    // Totals
    let totalCurrentGenerationKW = 0;
    let totalTodayGenerationKWh = 0;
    let renewableGenerationKW = 0;
    let renewableTodayKWh = 0;
    let nonRenewableGenerationKW = 0;
    let nonRenewableTodayKWh = 0;

    // Grouping by source type
    const sourceTypes = ['Solar', 'Grid', 'Wind', 'Generator'];
    const byType = {};
    sourceTypes.forEach((type) => {
      byType[type] = {
        sourceType: type,
        category: ['Solar', 'Wind'].includes(type) ? 'renewable' : 'non-renewable',
        capacityKW: 0,
        currentGenerationKW: 0,
        todayGenerationKWh: 0,
        count: 0,
        status: 'active',
      };
    });

    sources.forEach((s) => {
      const type = s.sourceType;
      if (!byType[type]) {
        byType[type] = {
          sourceType: type,
          category: s.category,
          capacityKW: 0,
          currentGenerationKW: 0,
          todayGenerationKWh: 0,
          count: 0,
          status: s.status,
        };
      }

      const kw = s.status === 'offline' ? 0 : s.currentGenerationKW || 0;
      const kwh = s.todayGenerationKWh || 0;

      byType[type].capacityKW += s.capacityKW || 0;
      byType[type].currentGenerationKW += kw;
      byType[type].todayGenerationKWh += kwh;
      byType[type].count += 1;
      if (s.status !== 'active') byType[type].status = s.status;

      totalCurrentGenerationKW += kw;
      totalTodayGenerationKWh += kwh;

      if (['Solar', 'Wind'].includes(s.sourceType) || s.category === 'renewable') {
        renewableGenerationKW += kw;
        renewableTodayKWh += kwh;
      } else {
        nonRenewableGenerationKW += kw;
        nonRenewableTodayKWh += kwh;
      }
    });

    // Share calculations
    const totalKW = totalCurrentGenerationKW > 0 ? totalCurrentGenerationKW : 1;
    const totalKWh = totalTodayGenerationKWh > 0 ? totalTodayGenerationKWh : 1;

    const renewableSharePercent = +((renewableTodayKWh / totalKWh) * 100).toFixed(1);
    const nonRenewableSharePercent = +(100 - renewableSharePercent).toFixed(1);

    const sourceBreakdown = Object.values(byType).map((item) => ({
      ...item,
      sharePercent: +((item.todayGenerationKWh / totalKWh) * 100).toFixed(1),
      instantaneousSharePercent: +((item.currentGenerationKW / totalKW) * 100).toFixed(1),
    }));

    res.status(200).json({
      success: true,
      data: {
        totalCurrentGenerationKW: +totalCurrentGenerationKW.toFixed(2),
        totalTodayGenerationKWh: +totalTodayGenerationKWh.toFixed(2),
        renewableGenerationKW: +renewableGenerationKW.toFixed(2),
        renewableTodayKWh: +renewableTodayKWh.toFixed(2),
        nonRenewableGenerationKW: +nonRenewableGenerationKW.toFixed(2),
        nonRenewableTodayKWh: +nonRenewableTodayKWh.toFixed(2),
        renewableSharePercent,
        nonRenewableSharePercent,
        sourcesCount: sources.length,
        sourceBreakdown,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new energy source
// @route   POST /api/energy-sources
// @access  Private (Admin, Facility Manager)
const createEnergySource = async (req, res, next) => {
  try {
    const {
      name,
      sourceType,
      building = 'All Buildings',
      capacityKW,
      fuelOrTechnology,
      status = 'active',
    } = req.body;

    if (!name || !sourceType || !capacityKW) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, sourceType (Solar, Grid, Wind, Generator), and capacityKW',
      });
    }

    const isRenewable = ['Solar', 'Wind'].includes(sourceType);
    const initialKW = status === 'active' ? +(capacityKW * (isRenewable ? 0.65 : 0.45)).toFixed(1) : 0;
    const initialTodayKWh = status === 'active' ? +(initialKW * 4.2).toFixed(1) : 0;

    const newSource = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      sourceType,
      category: isRenewable ? 'renewable' : 'non-renewable',
      building,
      capacityKW: Number(capacityKW),
      currentGenerationKW: initialKW,
      todayGenerationKWh: initialTodayKWh,
      monthlyGenerationKWh: +(initialTodayKWh * 25).toFixed(1),
      efficiencyPercent: isRenewable ? 92 : 96,
      status,
      carbonIntensityKgPerKWh: isRenewable ? 0 : sourceType === 'Grid' ? 0.42 : 0.76,
      fuelOrTechnology: fuelOrTechnology || `${sourceType} Generation Asset`,
      installationDate: new Date(),
      lastUpdated: new Date(),
    };

    offlineSources.set(newSource._id, newSource);

    if (mongoose.connection.readyState === 1) {
      try {
        await EnergySource.create(newSource);
      } catch (err) {
        console.warn('MongoDB energy source create deferred:', err.message);
      }
    }

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ENERGY_SOURCE_REGISTERED',
      entityType: 'energy_source',
      entityId: newSource._id,
      building,
      details: { name: newSource.name, sourceType, capacityKW },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Energy Source '${newSource.name}' (${sourceType}) registered successfully.`,
      data: newSource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update energy source
// @route   PUT /api/energy-sources/:id
// @access  Private (Admin, Facility Manager)
const updateEnergySource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const source = offlineSources.get(id);

    if (!source) {
      return res.status(404).json({ success: false, message: 'Energy source not found' });
    }

    const { name, capacityKW, status, building, fuelOrTechnology, currentGenerationKW } = req.body;

    if (name) source.name = name;
    if (capacityKW !== undefined) source.capacityKW = Number(capacityKW);
    if (status) source.status = status;
    if (building) source.building = building;
    if (fuelOrTechnology) source.fuelOrTechnology = fuelOrTechnology;
    if (currentGenerationKW !== undefined) source.currentGenerationKW = Number(currentGenerationKW);
    source.lastUpdated = new Date();

    offlineSources.set(id, source);

    res.status(200).json({
      success: true,
      message: `Energy Source '${source.name}' updated successfully.`,
      data: source,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete energy source
// @route   DELETE /api/energy-sources/:id
// @access  Private (Admin only)
const deleteEnergySource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const source = offlineSources.get(id);

    if (!source) {
      return res.status(404).json({ success: false, message: 'Energy source not found' });
    }

    offlineSources.delete(id);

    res.status(200).json({
      success: true,
      message: `Energy Source '${source.name}' removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnergySources,
  getEnergyBreakdown,
  createEnergySource,
  updateEnergySource,
  deleteEnergySource,
  offlineSources,
};

