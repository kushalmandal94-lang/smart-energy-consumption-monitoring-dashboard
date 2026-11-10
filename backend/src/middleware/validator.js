const { body, validationResult } = require('express-validator');

// Validation error result formatter
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// User Registration Validation Rules
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate,
];

// User Login Validation Rules
const loginValidationRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Device Validation Rules
const deviceValidationRules = [
  body('name').trim().notEmpty().withMessage('Device name is required'),
  body('type').trim().notEmpty().withMessage('Device type is required'),
  body('building').trim().notEmpty().withMessage('Building name is required'),
  body('location').trim().notEmpty().withMessage('Location or zone is required'),
  body('powerRatingKW')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Power rating in kW must be a positive number'),
  body('ratedPowerWatts')
    .optional()
    .isNumeric()
    .withMessage('Rated power in Watts must be numeric'),
  validate,
];

// Smart Load Validation Rules
const smartLoadValidationRules = [
  body('name').trim().notEmpty().withMessage('Smart load name is required'),
  body('type')
    .notEmpty()
    .withMessage('Load category type is required')
    .isIn([
      'HVAC',
      'Lighting Systems',
      'Computers & IT',
      'Industrial Motors',
      'Water Pumps',
      'Electric Vehicle Chargers',
      'Other Electrical Equipment',
    ])
    .withMessage('Invalid load category'),
  body('building').trim().notEmpty().withMessage('Building name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('ratedPowerKW')
    .isFloat({ min: 0.01 })
    .withMessage('Rated power in kW must be a positive number'),
  body('maxLimitKW')
    .isFloat({ min: 0.01 })
    .withMessage('Maximum power limit in kW must be a positive number'),
  body('deviceId').notEmpty().withMessage('Assigned IoT device is required'),
  validate,
];

// Load Schedule Validation Rules
const loadScheduleValidationRules = [
  body('name').trim().notEmpty().withMessage('Schedule name is required'),
  body('smartLoadId').notEmpty().withMessage('Associated smart load is required'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be formatted as HH:MM (24-hour)'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be formatted as HH:MM (24-hour)'),
  body('daysOfWeek')
    .isArray({ min: 1 })
    .withMessage('At least one operating day must be selected'),
  validate,
];

// Energy Reading Validation Rules
const readingValidationRules = [
  body('powerKW').isNumeric().withMessage('Power in kW must be a valid number'),
  body('energyKWh').isNumeric().withMessage('Energy in kWh must be a valid number'),
  validate,
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
  deviceValidationRules,
  smartLoadValidationRules,
  loadScheduleValidationRules,
  readingValidationRules,
};
