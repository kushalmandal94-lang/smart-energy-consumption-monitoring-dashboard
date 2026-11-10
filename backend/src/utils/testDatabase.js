const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');

async function testDatabaseOperations() {
  console.log('\n🔍 Starting MongoDB Atlas CRUD Verification Test...\n');

  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    const db = mongoose.connection.db;
    const testCollection = db.collection('test_energy_diagnostics');

    console.log(`\nTesting Read/Write against collection: "test_energy_diagnostics" in database: "${mongoose.connection.name}"`);

    // 2. Test Document Insertion
    const testData = {
      testSession: 'atlas-live-verification',
      device: 'Smart Energy Meter CT-01',
      voltage: 231.5,
      currentAmps: 12.8,
      powerKW: 2.96,
      energyKWh: 14.8,
      status: 'active',
      testedAt: new Date(),
    };

    console.log('\n📝 1. Executing Document Insertion...');
    const insertResult = await testCollection.insertOne(testData);
    console.log(`   ✅ Document inserted successfully! Inserted ID: ${insertResult.insertedId}`);

    // 3. Test Document Retrieval
    console.log('\n🔎 2. Executing Document Retrieval...');
    const retrievedDoc = await testCollection.findOne({ _id: insertResult.insertedId });

    if (!retrievedDoc) {
      throw new Error('Document insertion was confirmed, but document could not be retrieved.');
    }

    console.log('   ✅ Document retrieved successfully from MongoDB Atlas:');
    console.log('   -----------------------------------------------------');
    console.log(`   _id:         ${retrievedDoc._id}`);
    console.log(`   Device:      ${retrievedDoc.device}`);
    console.log(`   Power (kW):  ${retrievedDoc.powerKW} kW`);
    console.log(`   Voltage (V): ${retrievedDoc.voltage} V`);
    console.log(`   Timestamp:   ${retrievedDoc.testedAt}`);
    console.log('   -----------------------------------------------------');

    // 4. Test Document Update
    console.log('\n🔄 3. Executing Document Update...');
    await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { status: 'verified', verifiedAt: new Date() } }
    );
    const updatedDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`   ✅ Document updated. New Status: "${updatedDoc.status}"`);

    // 5. Test Document Cleanup
    console.log('\n🧹 4. Cleaning up test document...');
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`   ✅ Test document removed (${deleteResult.deletedCount} deleted). Clean state restored.`);

    console.log('\n🎉 =========================================================');
    console.log('🎉 ALL DATABASE TESTS PASSED SUCCESSFULLY ON MONGODB ATLAS!');
    console.log('🎉 =========================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database test encountered an error:');
    console.error(error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

testDatabaseOperations();

