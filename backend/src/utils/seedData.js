const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Device = require('../models/Device');
const SmartLoad = require('../models/SmartLoad');
const LoadSchedule = require('../models/LoadSchedule');
const EnergyReading = require('../models/EnergyReading');
const Alert = require('../models/Alert');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_energy_db';
    await mongoose.connect(mongoURI);
    console.log(`✅ Connected to MongoDB for database seeding...`);
  } catch (error) {
    console.error(`❌ DB Connection failed during seed: ${error.message}`);
    process.exit(1);
  }
};

const sampleDevices = [
  {
    deviceId: 'MTR-HQ-01',
    name: 'Main Feeder Incomer Meter',
    type: 'Sub-station Feeder',
    building: 'Headquarters Tower',
    location: 'Basement Electrical Substation',
    powerRatingKW: 120.0,
    currentPowerKW: 68.4,
    dailyConsumptionKWh: 485.2,
    alertThresholdKW: 110.0,
    status: 'online',
    ipAddress: '192.168.1.10',
    installationDate: new Date('2025-02-15'),
    lastCommunication: new Date(),
    notes: 'Primary 415V three-phase grid incomer with Modbus TCP gateway',
  },
  {
    deviceId: 'MTR-HQ-02',
    name: 'HVAC Chiller Plant Meter',
    type: 'Smart Energy Meter',
    building: 'Headquarters Tower',
    location: 'Roof Level Mechanical Penthouse',
    powerRatingKW: 45.0,
    currentPowerKW: 24.8,
    dailyConsumptionKWh: 182.6,
    alertThresholdKW: 42.0,
    status: 'online',
    ipAddress: '192.168.1.11',
    installationDate: new Date('2025-03-10'),
    lastCommunication: new Date(),
    notes: 'Dual chiller compressor and AHU distribution panel',
  },
  {
    deviceId: 'MTR-HQ-03',
    name: 'Lighting & Auxiliary Panel',
    type: 'Smart Energy Meter',
    building: 'Headquarters Tower',
    location: 'Floor 2 Electrical Riser',
    powerRatingKW: 18.0,
    currentPowerKW: 6.7,
    dailyConsumptionKWh: 54.3,
    alertThresholdKW: 16.0,
    status: 'online',
    ipAddress: '192.168.1.12',
    installationDate: new Date('2025-03-12'),
    lastCommunication: new Date(),
    notes: 'LED lighting circuits across floors 1 to 4',
  },
  {
    deviceId: 'CT-TECH-01',
    name: 'Data Center Primary UPS Gateway',
    type: 'Power Quality Analyzer',
    building: 'Technology Wing',
    location: 'Server Room B3 - Row A',
    powerRatingKW: 60.0,
    currentPowerKW: 38.2,
    dailyConsumptionKWh: 305.8,
    alertThresholdKW: 52.0,
    status: 'online',
    ipAddress: '192.168.2.20',
    installationDate: new Date('2025-01-20'),
    lastCommunication: new Date(),
    notes: 'Monitors N+1 redundant UPS bank for high-density rack clusters',
  },
  {
    deviceId: 'CT-TECH-02',
    name: 'Workstation Subpanel Monitor',
    type: 'CT Clamp Gateway',
    building: 'Technology Wing',
    location: 'Floor 3 Engineering Lab',
    powerRatingKW: 25.0,
    currentPowerKW: 11.4,
    dailyConsumptionKWh: 78.4,
    alertThresholdKW: 22.0,
    status: 'online',
    ipAddress: '192.168.2.21',
    installationDate: new Date('2025-04-05'),
    lastCommunication: new Date(),
    notes: 'Precision wireless CT clamps on engineering workstation circuits',
  },
  {
    deviceId: 'MTR-MFG-01',
    name: 'Heavy Motor Control Center (MCC)',
    type: 'Sub-station Feeder',
    building: 'Manufacturing Plant',
    location: 'Shop Floor Section B',
    powerRatingKW: 95.0,
    currentPowerKW: 46.5,
    dailyConsumptionKWh: 372.1,
    alertThresholdKW: 88.0,
    status: 'online',
    ipAddress: '192.168.3.30',
    installationDate: new Date('2025-01-15'),
    lastCommunication: new Date(),
    notes: 'Controls industrial conveyors, stamping presses, and robotic arms',
  },
  {
    deviceId: 'MTR-MFG-02',
    name: 'Air Compression & Pneumatics Meter',
    type: 'Smart Energy Meter',
    building: 'Manufacturing Plant',
    location: 'Compressor House',
    powerRatingKW: 35.0,
    currentPowerKW: 15.2,
    dailyConsumptionKWh: 118.0,
    alertThresholdKW: 32.0,
    status: 'standby',
    ipAddress: '192.168.3.31',
    installationDate: new Date('2025-02-01'),
    lastCommunication: new Date(),
    notes: 'Dual rotary screw air compressors for assembly line tooling',
  },
  {
    deviceId: 'CT-MFG-03',
    name: 'Robotic Welders Analyzer',
    type: 'Power Quality Analyzer',
    building: 'Manufacturing Plant',
    location: 'Robotics Bay 4',
    powerRatingKW: 40.0,
    currentPowerKW: 0.0,
    dailyConsumptionKWh: 42.0,
    alertThresholdKW: 36.0,
    status: 'offline',
    ipAddress: '192.168.3.32',
    installationDate: new Date('2025-04-18'),
    lastCommunication: new Date(Date.now() - 3600000 * 7),
    notes: 'Offline due to network switch maintenance in Robotics Bay',
  },
  {
    deviceId: 'MTR-LOG-01',
    name: 'Fleet EV Fast Charging Gateway',
    type: 'Smart Energy Meter',
    building: 'Logistics Hub',
    location: 'Loading Bay & Fleet Lot',
    powerRatingKW: 50.0,
    currentPowerKW: 7.2,
    dailyConsumptionKWh: 164.5,
    alertThresholdKW: 45.0,
    status: 'online',
    ipAddress: '192.168.4.40',
    installationDate: new Date('2025-03-01'),
    lastCommunication: new Date(),
    notes: 'Fast chargers for electric delivery vans and corporate shuttles',
  },
  {
    deviceId: 'MTR-LOG-02',
    name: 'Cold Storage Refrigeration Monitor',
    type: 'Smart Energy Meter',
    building: 'Logistics Hub',
    location: 'Refrigerated Warehouse Zone',
    powerRatingKW: 28.0,
    currentPowerKW: 16.8,
    dailyConsumptionKWh: 132.0,
    alertThresholdKW: 25.0,
    status: 'online',
    ipAddress: '192.168.4.41',
    installationDate: new Date('2025-02-28'),
    lastCommunication: new Date(),
    notes: 'Walk-in chillers and pharmaceutical climate chamber monitor',
  },
  {
    deviceId: 'DEV-PLG-01',
    name: 'Central Pump Station Relay',
    type: 'Smart IoT Plug / Relay',
    building: 'Headquarters Tower',
    location: 'Sub-Basement B2 Pump Pit',
    powerRatingKW: 15.0,
    currentPowerKW: 7.5,
    dailyConsumptionKWh: 45.0,
    alertThresholdKW: 14.0,
    status: 'online',
    ipAddress: '192.168.1.15',
    installationDate: new Date('2025-05-10'),
    lastCommunication: new Date(),
    notes: 'Smart relay controller for hydronic circulation and sump extraction',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('🔄 Cleaning up existing demo data...');
    const demoEmail = 'admin@energydashboard.io';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      console.log('👤 Creating demo user account...');
      demoUser = await User.create({
        name: 'Alex Rivera (Facility Lead)',
        email: demoEmail,
        password: 'Password123!',
        role: 'admin',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 500,
          dailyTargetKWh: 120,
          alertNotifications: true,
        },
      });
      console.log(`✅ Demo User created: ${demoUser.email} / Password123!`);
    } else {
      console.log(`👤 Using existing demo user: ${demoUser.email}`);
    }

    // Clean existing devices, loads, and schedules for this user
    await Device.deleteMany({ userId: demoUser._id });
    await SmartLoad.deleteMany({ userId: demoUser._id });
    await LoadSchedule.deleteMany({ userId: demoUser._id });
    await Alert.deleteMany({ userId: demoUser._id });
    await EnergyReading.deleteMany({ userId: demoUser._id });

    console.log('⚡ Creating registered IoT devices (11 devices)...');
    const createdDevices = await Device.insertMany(
      sampleDevices.map((d) => ({
        ...d,
        userId: demoUser._id,
        powerRatingKW: d.powerRatingKW,
        ratedPowerWatts: d.powerRatingKW * 1000,
      }))
    );
    console.log(`✅ Created ${createdDevices.length} IoT devices across 4 buildings.`);

    // Helper to find created device by deviceId
    const dev = (id) => createdDevices.find((d) => d.deviceId === id) || createdDevices[0];

    console.log('🔌 Creating electrical smart loads (17 loads)...');
    const sampleLoads = [
      // HVAC Loads
      {
        userId: demoUser._id,
        deviceId: dev('MTR-HQ-02')._id,
        name: 'Central Chiller Unit #1 (York YK)',
        type: 'HVAC',
        building: 'Headquarters Tower',
        location: 'Rooftop Mechanical Penthouse',
        ratedPowerKW: 22.0,
        currentPowerKW: 16.4,
        maxLimitKW: 25.0,
        status: 'ON',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: true,
        notes: 'Variable speed screw chiller with automated chilled water setpoint control',
      },
      {
        userId: demoUser._id,
        deviceId: dev('MTR-HQ-02')._id,
        name: 'Air Handling Unit (AHU) Supply Fan 2A',
        type: 'HVAC',
        building: 'Headquarters Tower',
        location: 'Floor 2 Mech Room',
        ratedPowerKW: 7.5,
        currentPowerKW: 5.2,
        maxLimitKW: 9.0,
        status: 'ON',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: 'VFD driven supply fan serving open plan offices',
      },
      {
        userId: demoUser._id,
        deviceId: dev('CT-TECH-01')._id,
        name: 'Precision InRow Cooling Unit CRAC-01',
        type: 'HVAC',
        building: 'Technology Wing',
        location: 'Server Room B3',
        ratedPowerKW: 14.0,
        currentPowerKW: 10.8,
        maxLimitKW: 16.5,
        status: 'ON',
        isControllable: false, // Critical IT climate, cannot be auto-shed
        priority: 'critical',
        peakHourShedding: false,
        notes: 'Mission critical thermal management for high-density servers',
      },

      // Lighting Systems
      {
        userId: demoUser._id,
        deviceId: dev('MTR-HQ-03')._id,
        name: 'Corporate Office Smart LED Array (Fl. 1-2)',
        type: 'Lighting Systems',
        building: 'Headquarters Tower',
        location: 'Floors 1 & 2',
        ratedPowerKW: 4.8,
        currentPowerKW: 3.6,
        maxLimitKW: 5.5,
        status: 'ON',
        isControllable: true,
        priority: 'sheddable',
        peakHourShedding: true,
        notes: 'DALI dimmable smart LED fixtures with daylight harvesting sensors',
      },
      {
        userId: demoUser._id,
        deviceId: dev('MTR-MFG-01')._id,
        name: 'Manufacturing High-Bay Luminaire Grid',
        type: 'Lighting Systems',
        building: 'Manufacturing Plant',
        location: 'Shop Floor Section A',
        ratedPowerKW: 6.5,
        currentPowerKW: 5.1,
        maxLimitKW: 8.0,
        status: 'ON',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: 'Industrial LED high-bay luminaires with motion zoning',
      },
      {
        userId: demoUser._id,
        deviceId: dev('MTR-LOG-01')._id,
        name: 'Logistics Perimeter Security Floodlights',
        type: 'Lighting Systems',
        building: 'Logistics Hub',
        location: 'External Loading Yard',
        ratedPowerKW: 3.2,
        currentPowerKW: 0.0,
        maxLimitKW: 4.0,
        status: 'OFF',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: 'Daylight sensor turns ON at dusk (18:30)',
      },

      // Computers & IT
      {
        userId: demoUser._id,
        deviceId: dev('CT-TECH-01')._id,
        name: 'Primary Blade Server Cluster Rack 1-4',
        type: 'Computers & IT',
        building: 'Technology Wing',
        location: 'Server Room B3 - Row A',
        ratedPowerKW: 18.5,
        currentPowerKW: 14.2,
        maxLimitKW: 22.0,
        status: 'ON',
        isControllable: false,
        priority: 'critical',
        peakHourShedding: false,
        notes: 'Enterprise virtualization cluster hosting internal services and database',
      },
      {
        userId: demoUser._id,
        deviceId: dev('CT-TECH-02')._id,
        name: 'CAD Engineering Workstations Pod',
        type: 'Computers & IT',
        building: 'Technology Wing',
        location: 'Floor 3 Engineering Lab',
        ratedPowerKW: 8.0,
        currentPowerKW: 5.4,
        maxLimitKW: 10.0,
        status: 'ON',
        isControllable: true,
        priority: 'sheddable',
        peakHourShedding: false,
        notes: 'High performance GPU rendering machines',
      },
      {
        userId: demoUser._id,
        deviceId: dev('CT-TECH-01')._id,
        name: 'Core Network Core Switches & SAN Array',
        type: 'Computers & IT',
        building: 'Technology Wing',
        location: 'Server Room B3 - Rack 00',
        ratedPowerKW: 4.5,
        currentPowerKW: 3.8,
        maxLimitKW: 5.5,
        status: 'ON',
        isControllable: false,
        priority: 'critical',
        peakHourShedding: false,
        notes: 'Redundant 100GbE fiber aggregation switches and NVMe storage array',
      },

      // Industrial Motors
      {
        userId: demoUser._id,
        deviceId: dev('MTR-MFG-01')._id,
        name: 'Assembly Line Primary Conveyor Motor',
        type: 'Industrial Motors',
        building: 'Manufacturing Plant',
        location: 'Assembly Hall Section 1',
        ratedPowerKW: 12.0,
        currentPowerKW: 8.9,
        maxLimitKW: 15.0,
        status: 'ON',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: 'Three-phase 415V induction motor with soft starter',
      },
      {
        userId: demoUser._id,
        deviceId: dev('MTR-MFG-02')._id,
        name: 'Pneumatics Rotary Screw Air Compressor',
        type: 'Industrial Motors',
        building: 'Manufacturing Plant',
        location: 'Compressor House',
        ratedPowerKW: 18.0,
        currentPowerKW: 6.3,
        maxLimitKW: 22.0,
        status: 'STANDBY',
        isControllable: true,
        priority: 'sheddable',
        peakHourShedding: true,
        notes: 'Atlas Copco 18kW compressor operating in modulating load cycle',
      },

      // Water Pumps
      {
        userId: demoUser._id,
        deviceId: dev('DEV-PLG-01')._id,
        name: 'HVAC Chilled Water Hydronic Pump #1',
        type: 'Water Pumps',
        building: 'Headquarters Tower',
        location: 'Sub-Basement B2 Pump Pit',
        ratedPowerKW: 7.5,
        currentPowerKW: 5.8,
        maxLimitKW: 9.5,
        status: 'ON',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: 'Circulates chilled water through building risers to AHUs',
      },
      {
        userId: demoUser._id,
        deviceId: dev('DEV-PLG-01')._id,
        name: 'Sub-Basement Stormwater Sump Pump',
        type: 'Water Pumps',
        building: 'Headquarters Tower',
        location: 'Sub-Basement B2 Pit East',
        ratedPowerKW: 3.5,
        currentPowerKW: 0.0,
        maxLimitKW: 5.0,
        status: 'OFF',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: 'Automatic float switch operated; currently on standby',
      },

      // Electric Vehicle Chargers
      {
        userId: demoUser._id,
        deviceId: dev('MTR-LOG-01')._id,
        name: 'Commercial DC Fast Charger Unit #1 (50kW)',
        type: 'Electric Vehicle Chargers',
        building: 'Logistics Hub',
        location: 'Fleet Parking Bay 1',
        ratedPowerKW: 25.0,
        currentPowerKW: 0.0,
        maxLimitKW: 30.0,
        status: 'OFF',
        isControllable: true,
        priority: 'sheddable',
        peakHourShedding: true,
        notes: 'High-power DC charging point for delivery vans (night charged)',
      },
      {
        userId: demoUser._id,
        deviceId: dev('MTR-LOG-01')._id,
        name: 'Employee EV Charging Station Pod #2',
        type: 'Electric Vehicle Chargers',
        building: 'Logistics Hub',
        location: 'Staff Parking Area',
        ratedPowerKW: 7.2,
        currentPowerKW: 7.2,
        maxLimitKW: 8.0,
        status: 'ON',
        isControllable: true,
        priority: 'sheddable',
        peakHourShedding: true,
        notes: 'Level-2 32A J1772 charge point actively charging employee vehicle',
      },

      // Other Electrical Equipment
      {
        userId: demoUser._id,
        deviceId: dev('MTR-LOG-02')._id,
        name: 'Cold Storage Walk-In Chamber Unit',
        type: 'Other Electrical Equipment',
        building: 'Logistics Hub',
        location: 'Refrigerated Warehouse Zone',
        ratedPowerKW: 16.5,
        currentPowerKW: 12.8,
        maxLimitKW: 20.0,
        status: 'ON',
        isControllable: true,
        priority: 'normal',
        peakHourShedding: false,
        notes: 'Cold chain temperature preservation at -18°C',
      },
      {
        userId: demoUser._id,
        deviceId: dev('MTR-HQ-03')._id,
        name: 'Cafeteria Commercial Steam & Baking Oven',
        type: 'Other Electrical Equipment',
        building: 'Headquarters Tower',
        location: 'Floor 1 Cafeteria Kitchen',
        ratedPowerKW: 8.5,
        currentPowerKW: 0.0,
        maxLimitKW: 10.0,
        status: 'OFF',
        isControllable: true,
        priority: 'sheddable',
        peakHourShedding: true,
        notes: 'Operates primarily during morning prep hours (07:00 - 11:30)',
      },
    ];

    const createdLoads = await SmartLoad.insertMany(sampleLoads);
    console.log(`✅ Created ${createdLoads.length} smart electrical loads.`);

    // Helper to find created load by name substring
    const ld = (term) => createdLoads.find((l) => l.name.toLowerCase().includes(term.toLowerCase())) || createdLoads[0];

    console.log('⏰ Creating operating load schedules (6 schedules)...');
    const sampleSchedules = [
      {
        userId: demoUser._id,
        smartLoadId: ld('Chiller Unit #1')._id,
        name: 'Weekday HVAC Daytime Comfort Cycle',
        startTime: '07:30',
        endTime: '18:30',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isEnabled: true,
        peakHourShedding: true,
        action: 'TURN_ON',
        notes: 'Pre-cools building before 08:00; sheds 20% power during 14:00 peak tariff window',
      },
      {
        userId: demoUser._id,
        smartLoadId: ld('Corporate Office Smart LED')._id,
        name: 'Office Smart Lighting Automated Schedule',
        startTime: '08:00',
        endTime: '19:30',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isEnabled: true,
        peakHourShedding: true,
        action: 'TURN_ON',
        notes: 'Auto-dim to 50% during lunch hour and full cutoff at 19:30',
      },
      {
        userId: demoUser._id,
        smartLoadId: ld('DC Fast Charger Unit #1')._id,
        name: 'Fleet EV Off-Peak Smart Charging',
        startTime: '23:00',
        endTime: '05:30',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        isEnabled: true,
        peakHourShedding: false,
        action: 'TURN_ON',
        notes: 'Takes advantage of lowest off-peak tariff rate ($0.06/kWh)',
      },
      {
        userId: demoUser._id,
        smartLoadId: ld('Compressor House')._id || ld('Rotary Screw')._id,
        name: 'Air Compressor Peak Load Shedding',
        startTime: '13:30',
        endTime: '17:00',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isEnabled: true,
        peakHourShedding: true,
        action: 'TURN_OFF',
        notes: 'Runs on accumulator storage tanks to avoid utility peak demand penalty charges',
      },
      {
        userId: demoUser._id,
        smartLoadId: ld('Hydronic Pump #1')._id,
        name: 'Morning Hydronic Loop Priming',
        startTime: '06:00',
        endTime: '09:00',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isEnabled: true,
        peakHourShedding: false,
        action: 'TURN_ON',
        notes: 'Pre-circulates chilled water through building piping prior to staff arrival',
      },
      {
        userId: demoUser._id,
        smartLoadId: ld('Perimeter Security')._id,
        name: 'Night Yard Floodlighting Cycle',
        startTime: '18:45',
        endTime: '06:15',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        isEnabled: true,
        peakHourShedding: false,
        action: 'TURN_ON',
        notes: 'Security lighting operating every evening through dawn',
      },
    ];

    const createdSchedules = await LoadSchedule.insertMany(sampleSchedules);
    console.log(`✅ Created ${createdSchedules.length} operating load schedules.`);

    console.log('🔔 Creating sample alerts...');
    await Alert.insertMany([
      {
        userId: demoUser._id,
        deviceId: createdDevices[1]._id,
        deviceName: createdDevices[1].name,
        title: 'HVAC Chiller Load Warning',
        message: 'HVAC Chiller Plant Meter recorded sustained power demand exceeding 42 kW threshold during afternoon thermal spike.',
        severity: 'warning',
        type: 'threshold_exceeded',
        metricValue: 43.6,
        thresholdValue: 42.0,
        isResolved: false,
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
      {
        userId: demoUser._id,
        deviceId: createdDevices[7]._id,
        deviceName: createdDevices[7].name,
        title: 'Robotic Welders Analyzer Offline',
        message: 'Device CT-MFG-03 lost network ping heartbeat 7 hours ago. Telemetry transmission interrupted.',
        severity: 'critical',
        type: 'device_offline',
        isResolved: false,
        timestamp: new Date(Date.now() - 3600000 * 7),
      },
      {
        userId: demoUser._id,
        deviceId: createdDevices[3]._id,
        deviceName: createdDevices[3].name,
        title: 'UPS Voltage Fluctuation Restored',
        message: 'Line voltage on Phase 2 dropped to 211V for 4 seconds before returning to nominal 230V.',
        severity: 'info',
        type: 'voltage_fluctuation',
        metricValue: 211,
        thresholdValue: 220,
        isResolved: true,
        resolvedAt: new Date(),
        timestamp: new Date(Date.now() - 3600000 * 18),
      },
    ]);
    console.log('✅ Created sample alert logs.');

    console.log('📊 Generating 30 days of hourly energy readings...');
    const readings = [];
    const now = new Date();

    // 30 days * 24 hours = 720 points
    for (let day = 29; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

        let hourMultiplier = 0.65;
        if (hour >= 8 && hour <= 18) hourMultiplier = 2.2;
        else if (hour >= 19 && hour <= 22) hourMultiplier = 1.35;

        const devRef = createdDevices[hour % createdDevices.length];
        const powerKW = +(4.8 * hourMultiplier + (Math.random() - 0.5) * 1.5).toFixed(2);
        const energyKWh = +(powerKW * 1.0).toFixed(2);
        const cost = +(energyKWh * 0.15).toFixed(2);
        const carbonKg = +(energyKWh * 0.385).toFixed(3);

        readings.push({
          userId: demoUser._id,
          deviceId: devRef._id,
          deviceName: devRef.name,
          category: devRef.type,
          zone: devRef.location,
          powerKW,
          energyKWh,
          voltage: +(229 + Math.random() * 4).toFixed(1),
          currentAmps: +(powerKW * 4.3).toFixed(1),
          powerFactor: +(0.94 + Math.random() * 0.04).toFixed(2),
          frequencyHz: 50,
          cost,
          carbonKg,
          timestamp,
        });
      }
    }

    await EnergyReading.insertMany(readings);
    console.log(`✅ Seeded ${readings.length} historical readings.`);

    console.log(`
🎉 Database Seeding Completed Successfully!
Devices:   ${createdDevices.length} IoT Meters & Gateways
Loads:     ${createdLoads.length} Smart Electrical Loads
Schedules: ${createdSchedules.length} Operating Schedules
Credentials:
  Email:    admin@energydashboard.io
  Password: Password123!
    `);

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
