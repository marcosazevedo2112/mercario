// middlewares/validate.ts

import {Request, Response, NextFunction} from 'express';
import {ZodSchema} from 'zod';

export function validate(schema: ZodSchema, source = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result =
      source === 'body'
        ? schema.safeParse(req.body)
        : schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.flatten(),
      });
    }

    req.body = result.data;

    next();
  };
}
