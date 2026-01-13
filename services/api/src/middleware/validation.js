import { ValidationError } from '@n8n-clone/shared';

export function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      if (rules.required && !value) {
        errors.push(`${field} is required`);
      }
      
      if (value && rules.type) {
        const actualType = typeof value;
        if (actualType !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
      }
      
      if (value && rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
    }
    
    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
    
    next();
  };
}
