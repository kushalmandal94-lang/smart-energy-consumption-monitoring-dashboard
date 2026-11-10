const bcrypt = require('bcryptjs');

// In-memory resilient store for users across sessions
const offlineUsersByEmail = new Map();
const offlineUsersById = new Map();

// Helper to seed all 4 RBAC role demo accounts
const initDemoUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    const demoUsers = [
      {
        _id: '662f1a2b3c4d5e6f7a8b9c01',
        id: '662f1a2b3c4d5e6f7a8b9c01',
        name: 'Alex Rivera (System Administrator)',
        email: 'admin@energydashboard.io',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        assignedBuildings: ['All Buildings'],
        department: 'Information Technology & Infrastructure',
        phone: '+1 (555) 019-2831',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 5000,
          dailyTargetKWh: 1200,
          alertNotifications: true,
          theme: 'dark',
        },
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date(),
      },
      {
        _id: '662f1a2b3c4d5e6f7a8b9c02',
        id: '662f1a2b3c4d5e6f7a8b9c02',
        name: 'Marcus Vance (Facility Manager)',
        email: 'manager@energydashboard.io',
        password: hashedPassword,
        role: 'manager',
        status: 'active',
        assignedBuildings: ['Main Facility', 'Research & Development Center'],
        department: 'Operations & Facilities Management',
        phone: '+1 (555) 342-8901',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 1800,
          dailyTargetKWh: 350,
          alertNotifications: true,
          theme: 'dark',
        },
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date(),
      },
      {
        _id: '662f1a2b3c4d5e6f7a8b9c03',
        id: '662f1a2b3c4d5e6f7a8b9c03',
        name: 'Dr. Elena Rostova (Energy Analyst)',
        email: 'analyst@energydashboard.io',
        password: hashedPassword,
        role: 'analyst',
        status: 'active',
        assignedBuildings: [
          'Main Facility',
          'Research & Development Center',
          'Logistics & Warehousing Hub',
          'Executive Office Tower',
        ],
        department: 'Energy Efficiency & Sustainability Analytics',
        phone: '+1 (555) 789-1234',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 2500,
          dailyTargetKWh: 600,
          alertNotifications: true,
          theme: 'dark',
        },
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date(),
      },
      {
        _id: '662f1a2b3c4d5e6f7a8b9c05',
        id: '662f1a2b3c4d5e6f7a8b9c05',
        name: 'Dr. Elena Rostova (Operator)',
        email: 'auditor@energydashboard.io',
        password: hashedPassword,
        role: 'analyst',
        status: 'active',
        assignedBuildings: [
          'Main Facility',
          'Research & Development Center',
          'Logistics & Warehousing Hub',
          'Executive Office Tower',
        ],
        department: 'Energy Efficiency & Sustainability Audit',
        phone: '+1 (555) 789-1234',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 2500,
          dailyTargetKWh: 600,
          alertNotifications: true,
          theme: 'dark',
        },
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date(),
      },
      {
        _id: '662f1a2b3c4d5e6f7a8b9c04',
        id: '662f1a2b3c4d5e6f7a8b9c04',
        name: 'Claire Bennet (Building User)',
        email: 'user@energydashboard.io',
        password: hashedPassword,
        role: 'building_user',
        status: 'active',
        assignedBuildings: ['Main Facility'],
        department: 'Facility Tenant & Building Occupant',
        phone: '+1 (555) 456-7890',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 500,
          dailyTargetKWh: 100,
          alertNotifications: false,
          theme: 'dark',
        },
        createdAt: new Date('2026-02-15'),
        updatedAt: new Date(),
      },
      {
        _id: '662f1a2b3c4d5e6f7a8b9c06',
        id: '662f1a2b3c4d5e6f7a8b9c06',
        name: 'Claire Bennet (Viewer)',
        email: 'viewer@energydashboard.io',
        password: hashedPassword,
        role: 'building_user',
        status: 'active',
        assignedBuildings: ['Main Facility'],
        department: 'Corporate Sustainability & Stakeholder Relations',
        phone: '+1 (555) 456-7890',
        preferences: {
          currency: '$',
          ratePerKWh: 0.15,
          monthlyBudgetLimit: 500,
          dailyTargetKWh: 100,
          alertNotifications: false,
          theme: 'dark',
        },
        createdAt: new Date('2026-02-15'),
        updatedAt: new Date(),
      },
    ];

    demoUsers.forEach(saveUser);
  } catch (err) {
    console.warn('Demo users pre-seed notice:', err.message);
  }
};

const saveUser = (user) => {
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  const userId = (user._id || user.id || '').toString();

  const userRecord = {
    ...user,
    _id: userId,
    id: userId,
    email: normalizedEmail,
    role: user.role || 'manager',
    status: user.status || 'active',
    assignedBuildings: user.assignedBuildings || ['Main Facility'],
  };

  offlineUsersByEmail.set(normalizedEmail, userRecord);
  if (userId) {
    offlineUsersById.set(userId, userRecord);
  }
  return userRecord;
};

const getUserByEmail = (email) => {
  if (!email) return null;
  return offlineUsersByEmail.get(email.trim().toLowerCase()) || null;
};

const getUserById = (id) => {
  if (!id) return null;
  return offlineUsersById.get(id.toString()) || null;
};

const getAllUsers = () => {
  return Array.from(offlineUsersByEmail.values());
};

const deleteUser = (id) => {
  const user = getUserById(id);
  if (!user) return false;
  offlineUsersByEmail.delete(user.email);
  offlineUsersById.delete(id.toString());
  return true;
};

// Auto-sync any registered offline users into MongoDB Atlas when connection is established
const syncToMongo = async (UserModel) => {
  if (!UserModel) return;
  try {
    for (const user of offlineUsersByEmail.values()) {
      const exists = await UserModel.findOne({ email: user.email }).maxTimeMS(3000);
      if (!exists && user.password) {
        await UserModel.collection.insertOne({
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role || 'manager',
          status: user.status || 'active',
          assignedBuildings: user.assignedBuildings || ['Main Facility'],
          department: user.department || 'Operations',
          phone: user.phone || '',
          preferences: user.preferences || {
            currency: '$',
            ratePerKWh: 0.15,
            monthlyBudgetLimit: 500,
            dailyTargetKWh: 100,
            alertNotifications: true,
            theme: 'dark',
          },
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
        });
        console.log(`✅ Synced registered user '${user.email}' to MongoDB Atlas.`);
      }
    }
  } catch (err) {
    console.warn('Notice: MongoDB user sync deferred until cluster is reachable:', err.message);
  }
};

// Initialize demo users
initDemoUsers();

module.exports = {
  saveUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  deleteUser,
  syncToMongo,
};
