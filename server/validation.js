const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters and spaces',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'string.min': 'Password must be at least 8 characters long'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required()
});

// Task validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(255)
    .trim()
    .required(),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow(''),
  points: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required(),
  assigned_to: Joi.number()
    .integer()
    .positive()
    .required(),
  is_recurring: Joi.boolean()
    .default(false),
  recurrence_type: Joi.string()
    .valid('days', 'weeks', 'months')
    .when('is_recurring', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  recurrence_value: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .when('is_recurring', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
});

const completeTaskSchema = Joi.object({
  completed_by: Joi.number()
    .integer()
    .positive()
    .required()
});

// Search validation
const searchSchema = Joi.object({
  q: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
});

// ID validation
const idSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
});

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    createTask: createTaskSchema,
    completeTask: completeTaskSchema,
    search: searchSchema,
    id: idSchema
  }
};