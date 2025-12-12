import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export interface ValidationRule {
  field: string;
  type?: 'string' | 'number' | 'email' | 'boolean';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      console.log('[VALIDATE] Checking', req.path, 'with', rules.length, 'rules');
      const errors: Record<string, string> = {};

      for (const rule of rules) {
        const value = req.body[rule.field];

        // Required check
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors[rule.field] = `${rule.field} is required`;
          continue;
        }

        if (value === undefined || value === null) {
          continue;
        }

        // Type check
        if (rule.type) {
          if (rule.type === 'email') {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(String(value))) {
              errors[rule.field] = `${rule.field} must be a valid email`;
            }
          } else if (typeof value !== rule.type) {
            errors[rule.field] = `${rule.field} must be of type ${rule.type}`;
          }
        }

        // Length checks
        if (rule.minLength !== undefined && String(value).length < rule.minLength) {
          errors[rule.field] = `${rule.field} must be at least ${rule.minLength} characters`;
        }
        if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
          errors[rule.field] = `${rule.field} must not exceed ${rule.maxLength} characters`;
        }
      }

      if (Object.keys(errors).length > 0) {
        console.log('[VALIDATE] Validation failed for', req.path, ':', errors);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: errors,
          statusCode: 400,
        });
        return;
      }

      console.log('[VALIDATE] Validation passed for', req.path);
      next();
    } catch (error) {
      console.error(
        '[VALIDATE] Middleware error:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  };
};
