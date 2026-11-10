const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Device = require('../models/Device');
const SmartLoad = require('../models/SmartLoad');
const LoadSchedule = require('../models/LoadSchedule');

async function testCRUD() {
  console.log('\n🧪 Testing Devices & Smart Loads CRUD Operations...\n');
  try {
    await connectDB();

    const user = await User.findOne({ email: 'admin@energydashboard.io' });
    if (!user) throw new Error('Demo user not found. Run seed script first.');

    // 1. Test Device CRUD
    console.log('--- 1. Testing Device Model CRUD ---');
    const testDeviceId = `TEST-DEV-${Date.now().toString().slice(-4)}`;
    const newDevice = await Device.create({
      userId: user._id,
      deviceId: testDeviceId,
      name: 'Test Sub-panel Meter Alpha',
      type: 'Smart Energy Meter',
      building: 'Testing Lab',
      location: 'Bench 01',
      powerRatingKW: 15.0,
      status: 'online',
    });
    console.log(`✅ Device Created: ID=${newDevice.deviceId}, Name="${newDevice.name}", _id=${newDevice._id}`);

    // Read & Filter
    const foundDevice = await Device.findOne({ userId: user._id, deviceId: testDeviceId });
    if (!foundDevice) throw new Error('Device not found on read');
    console.log(`✅ Device Read Confirmed: ${foundDevice.name}`);

    // Update
    foundDevice.name = 'Test Sub-panel Meter Alpha [Updated]';
    foundDevice.powerRatingKW = 18.5;
    await foundDevice.save();
    console.log(`✅ Device Updated Confirmed: ${foundDevice.name}, Rating=${foundDevice.powerRatingKW}kW`);

    // 2. Test SmartLoad CRUD
    console.log('\n--- 2. Testing SmartLoad Model CRUD ---');
    const newLoad = await SmartLoad.create({
      userId: user._id,
      deviceId: foundDevice._id,
      name: 'Test Industrial Blower Fan',
      type: 'Industrial Motors',
      building: 'Testing Lab',
      location: 'Exhaust Duct A',
      ratedPowerKW: 5.5,
      maxLimitKW: 7.0,
      status: 'ON',
      isControllable: true,
      peakHourShedding: true,
    });
    console.log(`✅ Smart Load Created: Name="${newLoad.name}", DeviceId=${newLoad.deviceId}`);

    // Read & populate
    const foundLoad = await SmartLoad.findById(newLoad._id).populate('deviceId', 'deviceId name');
    console.log(`✅ Smart Load Read & Populated: assigned to Device "${foundLoad.deviceId?.name}"`);

    // Toggle simulation relay
    foundLoad.status = 'OFF';
    foundLoad.currentPowerKW = 0;
    await foundLoad.save();
    console.log(`✅ Smart Load Relay Toggled: Status="${foundLoad.status}", CurrentKW=${foundLoad.currentPowerKW}`);

    // 3. Test LoadSchedule CRUD
    console.log('\n--- 3. Testing LoadSchedule Model CRUD ---');
    const newSchedule = await LoadSchedule.create({
      userId: user._id,
      smartLoadId: foundLoad._id,
      name: 'Test Exhaust Daily Ventilation',
      startTime: '08:30',
      endTime: '17:30',
      daysOfWeek: ['Mon', 'Wed', 'Fri'],
      isEnabled: true,
      peakHourShedding: true,
    });
    console.log(`✅ Load Schedule Created: Name="${newSchedule.name}", Days=[${newSchedule.daysOfWeek.join(', ')}]`);

    // Toggle schedule enabled
    newSchedule.isEnabled = false;
    await newSchedule.save();
    console.log(`✅ Load Schedule Toggled: isEnabled=${newSchedule.isEnabled}`);

    // Cleanup test records
    console.log('\n--- 4. Cleaning Up Test Documents ---');
    await LoadSchedule.deleteOne({ _id: newSchedule._id });
    await SmartLoad.deleteOne({ _id: newLoad._id });
    await Device.deleteOne({ _id: foundDevice._id });
    console.log('✅ Test documents cleaned up cleanly.');

    console.log('\n🎉 ALL CRUD TESTS PASSED SUCCESSFULLY ON MONGODB ATLAS!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ CRUD Test Failed:', err);
    process.exit(1);
  }
}

testCRUD();

