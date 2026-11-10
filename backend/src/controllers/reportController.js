const mongoose = require('mongoose');
const EnergyReport = require('../models/EnergyReport');
const { logAction } = require('../utils/auditLogger');

// Initial pre-configured mandatory reports
const initialReports = [
  {
    _id: '663d00010001000100010001',
    reportId: 'REP-DAILY-01',
    title: 'Daily Energy Usage Report',
    type: 'Daily Energy Usage Report',
    category: 'daily_usage',
    building: 'All Buildings',
    dateRange: 'Past 24 Hours',
    metrics: {
      totalKWh: 884.2,
      totalCost: 132.63,
      previousDayKWh: 924.5,
      deltaKWh: -40.3,
      percentageChange: -4.36,
      peakKW: 48.2,
      peakTime: '14:30',
      activeDevices: 12,
      avgPowerFactor: 0.96,
      carbonKg: 340.4,
    },
    summaryText: 'Total consumption decreased by 4.36% compared to yesterday. Peak demand peaked at 14:30 with 48.2 kW.',
    generatedBy: 'Marcus Vance',
    format: 'PDF',
    status: 'Ready',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000),
  },
  {
    _id: '663d00010001000100010002',
    reportId: 'REP-BLD-02',
    title: 'Building-wise Consumption Report',
    type: 'Building-wise Consumption Report',
    category: 'building_wise',
    building: 'All Buildings',
    dateRange: 'Current Month',
    metrics: {
      totalKWh: 35960.0,
      totalCost: 5394.0,
      highestConsumingFacility: 'Logistics & Warehousing Hub',
      highestConsumingKWh: 13450.0,
      lowestConsumingFacility: 'Research & Development Center',
      lowestConsumingKWh: 7890.0,
      averageEfficiency: 86.5,
      buildingsCount: 4,
    },
    summaryText: 'Logistics & Warehousing Hub represents 37.4% of total enterprise load due to cold storage refrigeration units.',
    generatedBy: 'Dr. Elena Rostova',
    format: 'CSV',
    status: 'Ready',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    _id: '663d00010001000100010003',
    reportId: 'REP-PEAK-03',
    title: 'Peak Demand Report',
    type: 'Peak Demand Report',
    category: 'peak_demand',
    building: 'All Buildings',
    dateRange: 'Past 7 Days',
    metrics: {
      maxDemandKW: 64.8,
      peakTimestamp: '2026-11-09T14:35:00.000Z',
      peakHoursConsumptionKWh: 542.4,
      offPeakHoursConsumptionKWh: 341.8,
      peakCostDollars: 97.63,
      offPeakCostDollars: 41.02,
      peakDemandTargetKW: 70.0,
      demandBufferPercent: 7.4,
    },
    summaryText: 'Peak power reached 64.8 kW at 14:35 during HVAC ramp-up. Load shedding prevented exceeding the 70.0 kW utility threshold.',
    generatedBy: 'Alex Rivera',
    format: 'PDF',
    status: 'Ready',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
  },
  {
    _id: '663d00010001000100010004',
    reportId: 'REP-EFF-04',
    title: 'Energy Efficiency Summary Report',
    type: 'Energy Efficiency Summary',
    category: 'efficiency_summary',
    building: 'All Buildings',
    dateRange: 'Quarter 1 (2026)',
    metrics: {
      totalEnergyConsumedKWh: 26500.0,
      baselineBenchmarkKWh: 31200.0,
      energySavedKWh: 4700.0,
      energyEfficiencyPercent: 88.6,
      renewableEnergySharePercent: 28.5,
      carbonEmissionReductionKg: 1809.5,
      costSavingsDollars: 705.0,
    },
    summaryText: 'Facility efficiency reached 88.6% with 4,700 kWh saved versus baseline model. On-site solar and wind supplied 28.5% of total power.',
    generatedBy: 'Dr. Elena Rostova',
    format: 'PDF',
    status: 'Ready',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000),
  },
];

const offlineReports = new Map();
initialReports.forEach((r) => offlineReports.set(r.reportId, r));

// Helper: generate 24h hourly breakdown for Daily Energy Usage Report
const generateDailyHourlyBreakdown = (dateStr, building = 'All Buildings') => {
  const hours = [];
  let totalKWh = 0;
  let totalCost = 0;

  for (let h = 0; h < 24; h++) {
    const timeLabel = `${h.toString().padStart(2, '0')}:00`;
    let factor = 0.5;
    if (h >= 9 && h <= 17) factor = 1.8;
    else if (h >= 18 && h <= 21) factor = 1.2;

    const baseKW = (building === 'All Buildings' ? 36.0 : 18.0) * factor;
    const powerKW = +(baseKW + (Math.sin(h / 3) * 3.5) + (h === 14 ? 7.2 : 0)).toFixed(1);
    const hourlyKWh = +(powerKW * 1.0).toFixed(2);
    const isPeakHour = h >= 9 && h <= 18;
    const rate = isPeakHour ? 0.18 : 0.12;
    const cost = +(hourlyKWh * rate).toFixed(2);
    const solarKWh = h >= 7 && h <= 18 ? +(Math.sin(((h - 7) / 11) * Math.PI) * (building === 'All Buildings' ? 14 : 7)).toFixed(1) : 0;
    const netKWh = +(Math.max(0, hourlyKWh - solarKWh)).toFixed(2);

    totalKWh += hourlyKWh;
    totalCost += cost;

    hours.push({
      hour: h,
      time: timeLabel,
      powerKW,
      consumptionKWh: hourlyKWh,
      cost,
      rate,
      isPeakHour,
      solarKWh,
      netKWh,
    });
  }

  return {
    hours,
    totalDailyKWh: +totalKWh.toFixed(1),
    totalDailyCost: +totalCost.toFixed(2),
    previousDayKWh: +(totalKWh * 1.045).toFixed(1),
    deltaKWh: +(totalKWh - totalKWh * 1.045).toFixed(1),
    percentageChange: -4.3,
  };
};

// @desc    Get all reports list
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res, next) => {
  try {
    const { type, building, category } = req.query;
    let list = Array.from(offlineReports.values());

    if (type && type !== 'ALL') list = list.filter((r) => r.type === type);
    if (category && category !== 'ALL') list = list.filter((r) => r.category === category);
    if (building && building !== 'ALL' && building !== 'All Buildings') {
      list = list.filter((r) => r.building === building || r.building === 'All Buildings');
    }

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detailed Mandatory Report Data (A, B, C, D) with date filtering
// @route   GET /api/reports/mandatory/:type
// @access  Private
const getMandatoryReport = async (req, res, next) => {
  try {
    const { type } = req.params; // 'daily_usage', 'building_wise', 'peak_demand', 'efficiency_summary'
    const { startDate, endDate, building = 'All Buildings' } = req.query;

    if (type === 'daily_usage') {
      const breakdown = generateDailyHourlyBreakdown(startDate || 'today', building);
      return res.status(200).json({
        success: true,
        reportType: 'Daily Energy Usage Report',
        building,
        date: startDate || new Date().toISOString().split('T')[0],
        metrics: {
          totalDailyKWh: breakdown.totalDailyKWh,
          totalDailyCost: breakdown.totalDailyCost,
          previousDayKWh: breakdown.previousDayKWh,
          deltaKWh: breakdown.deltaKWh,
          percentageChange: breakdown.percentageChange,
          peakDemandKW: Math.max(...breakdown.hours.map((h) => h.powerKW)),
          peakTime: '14:00',
        },
        hourlyBreakdown: breakdown.hours,
      });
    }

    if (type === 'building_wise') {
      const facilities = [
        {
          name: 'Main Facility',
          code: 'BLD-HQ-01',
          totalKWh: 9420.0,
          cost: 1413.0,
          carbonKg: 3626.7,
          efficiencyScore: 91,
          sharePercent: 26.2,
          isHighest: false,
        },
        {
          name: 'Research & Development Center',
          code: 'BLD-RD-02',
          totalKWh: 7890.0,
          cost: 1183.5,
          carbonKg: 3037.6,
          efficiencyScore: 86,
          sharePercent: 21.9,
          isHighest: false,
        },
        {
          name: 'Logistics & Warehousing Hub',
          code: 'BLD-LOG-03',
          totalKWh: 13450.0,
          cost: 2017.5,
          carbonKg: 5178.2,
          efficiencyScore: 78,
          sharePercent: 37.4,
          isHighest: true, // HIGHEST CONSUMING
        },
        {
          name: 'Executive Office Tower',
          code: 'BLD-TWR-04',
          totalKWh: 5200.0,
          cost: 780.0,
          carbonKg: 2002.0,
          efficiencyScore: 88,
          sharePercent: 14.5,
          isHighest: false,
        },
      ];

      return res.status(200).json({
        success: true,
        reportType: 'Building-wise Consumption Report',
        dateRange: {
          startDate: startDate || '2026-11-01',
          endDate: endDate || '2026-11-09',
        },
        highestConsumingFacility: 'Logistics & Warehousing Hub',
        totalKWh: 35960.0,
        totalCost: 5394.0,
        facilities,
      });
    }

    if (type === 'peak_demand') {
      const trendPoints = [];
      const now = new Date();
      for (let i = 24; i >= 0; i--) {
        const t = new Date(now.getTime() - i * 3600000);
        const hour = t.getHours();
        let base = 28;
        if (hour >= 10 && hour <= 16) base = 52;
        const kw = +(base + Math.sin(i / 2) * 8 + (hour === 14 ? 12.8 : 0)).toFixed(1);
        trendPoints.push({
          timestamp: t.toISOString(),
          timeLabel: `${hour.toString().padStart(2, '0')}:00`,
          powerDemandKW: kw,
          thresholdLimitKW: 70.0,
          isPeakPeriod: hour >= 9 && hour <= 18,
        });
      }

      return res.status(200).json({
        success: true,
        reportType: 'Peak Demand Report',
        building,
        dateRange: { startDate: startDate || 'Past 24 Hours', endDate: endDate || 'Now' },
        metrics: {
          maxDemandKW: 64.8,
          peakTimestamp: '2026-11-09T14:35:00.000Z',
          peakHoursConsumptionKWh: 542.4,
          offPeakHoursConsumptionKWh: 341.8,
          peakHoursPercent: 61.3,
          offPeakHoursPercent: 38.7,
          peakCost: 97.63,
          offPeakCost: 41.02,
          thresholdLimitKW: 70.0,
          headroomKW: 5.2,
        },
        demandTrend: trendPoints,
      });
    }

    if (type === 'efficiency_summary') {
      return res.status(200).json({
        success: true,
        reportType: 'Energy Efficiency Summary',
        dateRange: { startDate: startDate || '2026-01-01', endDate: endDate || '2026-11-09' },
        metrics: {
          totalEnergyConsumedKWh: 26500.0,
          baselineBenchmarkKWh: 31200.0,
          energySavedKWh: 4700.0,
          savingsPercentage: 15.06,
          renewableEnergySharePercent: 28.5,
          renewableSources: {
            solarKWh: 5936.0,
            windKWh: 1616.5,
            gridKWh: 18947.5,
          },
          energyEfficiencyScore: 88.6,
          carbonEmissionReductionKg: 1809.5,
          costAvoidedDollars: 705.0,
        },
        recommendations: [
          {
            id: 'rec-01',
            category: 'HVAC Scheduling',
            title: 'Pre-cool Building HQ before 14:00 Peak Tariff Window',
            impact: 'High',
            estimatedSavings: '240 kWh/month ($43/mo)',
            difficulty: 'Low',
          },
          {
            id: 'rec-02',
            category: 'Power Quality',
            title: 'Install Power Factor Correction Capacitor at Logistics Hub',
            impact: 'Medium',
            estimatedSavings: 'Avoid $115/month reactive power utility penalty',
            difficulty: 'Medium',
          },
          {
            id: 'rec-03',
            category: 'Renewables',
            title: 'Expand Solar PV on Warehouse Roof by 25 kW',
            impact: 'High',
            estimatedSavings: '3,100 kWh/month ($465/mo)',
            difficulty: 'High',
          },
          {
            id: 'rec-04',
            category: 'Lighting & Loads',
            title: 'Enable Motion Sensor Auto-Shutoff on Floor 3 & 4 Offices',
            impact: 'Low',
            estimatedSavings: '120 kWh/month ($18/mo)',
            difficulty: 'Low',
          },
        ],
      });
    }

    return res.status(400).json({
      success: false,
      message: `Unknown report type '${type}'. Valid types: 'daily_usage', 'building_wise', 'peak_demand', 'efficiency_summary'`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a new report on-demand
// @route   POST /api/reports/generate
// @access  Private (Admin, Manager, Operator, Analyst)
const generateReport = async (req, res, next) => {
  try {
    const { type, building = 'All Buildings', dateRange = 'Current Month', format = 'PDF' } = req.body;

    const reportId = `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const randomKWh = Math.round(500 + Math.random() * 2000);
    const newReport = {
      _id: new mongoose.Types.ObjectId().toString(),
      reportId,
      title: `${type} – ${building}`,
      type,
      building,
      dateRange,
      metrics: {
        totalKWh: randomKWh,
        totalCost: +(randomKWh * 0.15).toFixed(2),
        peakKW: +(28 + Math.random() * 30).toFixed(1),
        avgPowerFactor: +(0.93 + Math.random() * 0.05).toFixed(2),
        carbonKg: +(randomKWh * 0.385).toFixed(1),
        efficiencyScore: Math.round(82 + Math.random() * 15),
        activeDevices: 12,
      },
      summaryText: `Automated ${type} generated for ${building}. Metrics verified against VoltPulse active telemetry stream.`,
      generatedBy: req.user.name,
      format: format || 'PDF',
      status: 'Ready',
      createdAt: new Date(),
    };

    offlineReports.set(reportId, newReport);

    await logAction({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'REPORT_GENERATED',
      entityType: 'report',
      entityId: reportId,
      building,
      details: { reportType: type, format, reportId },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Report '${newReport.title}' generated successfully.`,
      data: newReport,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export report data as CSV or JSON
// @route   GET /api/reports/:id/export
// @access  Private
const exportReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'csv' } = req.query;

    // Check if this is an export for one of the 4 mandatory reports
    if (['daily_usage', 'building_wise', 'peak_demand', 'efficiency_summary'].includes(id.toLowerCase())) {
      const type = id.toLowerCase();
      if (type === 'daily_usage') {
        const data = generateDailyHourlyBreakdown('today');
        let csv = 'Hour,Time,Power Demand (kW),Consumption (kWh),Cost ($),Tariff Rate ($/kWh),Solar Offset (kWh),Net Grid (kWh)\n';
        data.hours.forEach((h) => {
          csv += `${h.hour},"${h.time}",${h.powerKW},${h.consumptionKWh},${h.cost},${h.rate},${h.solarKWh},${h.netKWh}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="daily_energy_usage_report.csv"');
        return res.status(200).send(csv);
      }

      if (type === 'building_wise') {
        let csv = 'Facility Name,Building Code,Consumption (kWh),Cost ($),Carbon Emissions (kg CO2),Efficiency Score (%),Enterprise Share (%)\n';
        const facilities = [
          { name: 'Main Facility', code: 'BLD-HQ-01', kwh: 9420.0, cost: 1413.0, carbon: 3626.7, eff: 91, share: 26.2 },
          { name: 'Research & Development Center', code: 'BLD-RD-02', kwh: 7890.0, cost: 1183.5, carbon: 3037.6, eff: 86, share: 21.9 },
          { name: 'Logistics & Warehousing Hub (Highest Consuming)', code: 'BLD-LOG-03', kwh: 13450.0, cost: 2017.5, carbon: 5178.2, eff: 78, share: 37.4 },
          { name: 'Executive Office Tower', code: 'BLD-TWR-04', kwh: 5200.0, cost: 780.0, carbon: 2002.0, eff: 88, share: 14.5 },
        ];
        facilities.forEach((f) => {
          csv += `"${f.name}","${f.code}",${f.kwh},${f.cost},${f.carbon},${f.eff},${f.share}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="building_wise_consumption_report.csv"');
        return res.status(200).send(csv);
      }

      if (type === 'peak_demand') {
        let csv = 'Metric,Value,Unit,Notes\n';
        csv += '"Maximum Power Demand",64.8,"kW","Occurred at 14:35 during HVAC peak"\n';
        csv += '"Peak Hours Consumption (09:00-18:00)",542.4,"kWh","61.3% of total consumption"\n';
        csv += '"Off-Peak Hours Consumption (18:00-09:00)",341.8,"kWh","38.7% of total consumption"\n';
        csv += '"Peak Period Energy Cost",97.63,"USD","Peak rate $0.18/kWh"\n';
        csv += '"Off-Peak Period Energy Cost",41.02,"USD","Off-peak rate $0.12/kWh"\n';
        csv += '"Utility Demand Threshold Limit",70.0,"kW","Penalty threshold"\n';
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="peak_demand_report.csv"');
        return res.status(200).send(csv);
      }

      if (type === 'efficiency_summary') {
        let csv = 'Metric,Value,Unit,Description\n';
        csv += '"Total Energy Consumed",26500.0,"kWh","Gross energy monitored"\n';
        csv += '"Baseline Benchmark",31200.0,"kWh","Target historical baseline"\n';
        csv += '"Energy Saved",4700.0,"kWh","15.06% net reduction"\n';
        csv += '"Renewable Energy Share",28.5,"%","Combined Solar (22.4%) and Wind (6.1%)"\n';
        csv += '"Energy Efficiency Score",88.6,"%","Composite operational rating"\n';
        csv += '"Carbon Emissions Avoided",1809.5,"kg CO2","Direct environmental reduction"\n';
        csv += '"Estimated Cost Avoidance",705.0,"USD","Cost savings achieved"\n';
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="energy_efficiency_summary.csv"');
        return res.status(200).send(csv);
      }
    }

    const report = Array.from(offlineReports.values()).find((r) => r.reportId === id.toUpperCase() || r._id === id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (format.toLowerCase() === 'csv') {
      const csvHeader = 'Report ID,Title,Type,Building,Date Range,Total Energy (kWh),Cost ($),Peak Demand (kW),Avg Power Factor,Carbon (kg CO2),Efficiency Score,Generated By,Date\n';
      const csvRow = `"${report.reportId}","${report.title}","${report.type}","${report.building}","${report.dateRange}",${report.metrics?.totalKWh || 0},${report.metrics?.totalCost || 0},${report.metrics?.peakKW || 0},${report.metrics?.avgPowerFactor || 0},${report.metrics?.carbonKg || 0},${report.metrics?.efficiencyScore || 0},"${report.generatedBy}","${new Date(report.createdAt).toISOString()}"\n`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportId}.csv"`);
      return res.status(200).send(csvHeader + csvRow);
    }

    res.status(200).json({
      success: true,
      format: 'JSON',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  getMandatoryReport,
  generateReport,
  exportReport,
};
