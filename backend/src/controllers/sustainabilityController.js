// Sustainability & Carbon Tracking Controller
// Documented Emission Methodology:
// Grid Electricity Emission Factor: 0.385 kg CO2e per kWh (US EPA eGRID Regional Standard)
// Calculation: Total Grid Energy (kWh) * 0.385 = Gross Carbon Emissions (kg CO2e)
// Net Carbon Emissions = (Total Energy - On-Site Solar Generation) * 0.385 kg CO2e

const calculateSustainabilityMetrics = (user) => {
  const emissionFactor = 0.385; // kg CO2 per kWh

  // Baseline energy metrics
  const totalMonthlyKWh = 26500.0;
  const solarGenerationKWh = 6492.5; // Rooftop solar generation
  const gridPurchasedKWh = totalMonthlyKWh - solarGenerationKWh;

  const grossCarbonKg = +(totalMonthlyKWh * emissionFactor).toFixed(1);
  const netCarbonKg = +(gridPurchasedKWh * emissionFactor).toFixed(1);
  const avoidedCarbonKg = +(solarGenerationKWh * emissionFactor).toFixed(1);
  const renewablePercentage = +((solarGenerationKWh / totalMonthlyKWh) * 100).toFixed(1);

  // Daily, weekly, monthly breakdown
  const daily = {
    totalKWh: 883.3,
    solarKWh: 216.4,
    emissionsKg: +(883.3 * emissionFactor).toFixed(1),
    netEmissionsKg: +((883.3 - 216.4) * emissionFactor).toFixed(1),
  };

  const weekly = {
    totalKWh: 6183.0,
    solarKWh: 1515.0,
    emissionsKg: +(6183.0 * emissionFactor).toFixed(1),
    netEmissionsKg: +((6183.0 - 1515.0) * emissionFactor).toFixed(1),
  };

  const monthly = {
    totalKWh: totalMonthlyKWh,
    solarKWh: solarGenerationKWh,
    emissionsKg: grossCarbonKg,
    netEmissionsKg: netCarbonKg,
    targetEmissionsKg: 8500.0,
    reductionProgressPercent: 18.4, // 18.4% reduction achieved vs last year baseline
  };

  // Building-wise carbon footprint
  const buildingBreakdown = [
    {
      building: 'Main Facility',
      monthlyKWh: 9420.0,
      solarKWh: 2850.0,
      grossCarbonKg: 3626.7,
      netCarbonKg: 2529.5,
      renewableShare: '30.3%',
      efficiencyRating: 'A (High Green Standard)',
    },
    {
      building: 'Research & Development Center',
      monthlyKWh: 7890.0,
      solarKWh: 1650.0,
      grossCarbonKg: 3037.6,
      netCarbonKg: 2402.3,
      renewableShare: '20.9%',
      efficiencyRating: 'B+ (Good)',
    },
    {
      building: 'Logistics & Warehousing Hub',
      monthlyKWh: 5450.0,
      solarKWh: 1200.0,
      grossCarbonKg: 2098.2,
      netCarbonKg: 1636.2,
      renewableShare: '22.0%',
      efficiencyRating: 'B (Standard)',
    },
    {
      building: 'Executive Office Tower',
      monthlyKWh: 3740.0,
      solarKWh: 792.5,
      grossCarbonKg: 1439.9,
      netCarbonKg: 1134.8,
      renewableShare: '21.2%',
      efficiencyRating: 'A- (High Standard)',
    },
  ];

  // Actionable Energy Saving & Decarbonization Recommendations
  const recommendations = [
    {
      id: 'REC-01',
      title: 'Chiller Plant Staging & Pre-Cooling Optimization',
      category: 'HVAC Management',
      potentialSavingsKWh: 1250,
      potentialCostSavings: 187.5,
      carbonReductionKg: 481.2,
      priority: 'High',
      roiMonths: 1.5,
      description: 'Pre-cool Main Facility between 07:00 and 09:00 using off-peak rates and solar surplus to reduce midday compressor ramp.',
    },
    {
      id: 'REC-02',
      title: 'Warehouse High-Bay LED Motion Daylight Harvesting',
      category: 'Lighting Systems',
      potentialSavingsKWh: 680,
      potentialCostSavings: 102.0,
      carbonReductionKg: 261.8,
      priority: 'Medium',
      roiMonths: 4.2,
      description: 'Implement automatic dimming for perimeter warehouse lights when daylight luminance exceeds 350 lux.',
    },
    {
      id: 'REC-03',
      title: 'VFD Motor Frequency Trim during Idle Periods',
      category: 'Industrial Loads',
      potentialSavingsKWh: 940,
      potentialCostSavings: 141.0,
      carbonReductionKg: 361.9,
      priority: 'High',
      roiMonths: 2.0,
      description: 'Lower ventilation motor frequency from 60 Hz to 45 Hz when building occupancy falls below 20%.',
    },
    {
      id: 'REC-04',
      title: 'Solar Inverter Reactive Power Support (Volt-VAR Control)',
      category: 'Power Quality & Grid',
      potentialSavingsKWh: 320,
      potentialCostSavings: 48.0,
      carbonReductionKg: 123.2,
      priority: 'Low',
      roiMonths: 0.5,
      description: 'Enable autonomous Volt-VAR curves in rooftop smart inverters to stabilize local bus voltage and raise power factor above 0.95.',
    },
  ];

  return {
    methodology: {
      factorName: 'EPA eGRID 2024 Commercial Regional Benchmark',
      gridEmissionFactor: `${emissionFactor} kg CO₂ / kWh`,
      calculationFormula: 'Gross CO₂ (kg) = Total kWh × 0.385 | Net CO₂ = (Total kWh - Solar kWh) × 0.385',
    },
    summary: {
      grossCarbonKg,
      netCarbonKg,
      avoidedCarbonKg,
      renewablePercentage,
      treesEquivalentPlanted: Math.round(avoidedCarbonKg / 21.7), // 1 tree absorbs ~21.7 kg CO2/year
      milesDrivenAvoided: Math.round(avoidedCarbonKg * 2.45),
    },
    daily,
    weekly,
    monthly,
    buildingBreakdown,
    recommendations,
  };
};

// @desc    Get complete sustainability and carbon summary
// @route   GET /api/sustainability/summary
// @access  Private
const getSustainabilitySummary = async (req, res, next) => {
  try {
    const data = calculateSustainabilityMetrics(req.user);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSustainabilitySummary,
};

