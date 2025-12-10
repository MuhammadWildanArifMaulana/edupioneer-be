import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T | null = null,
  message: string = 'Success',
  statusCode: number = 200,
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    statusCode,
  });
};

export const sendError = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 500,
  error?: unknown,
): Response => {
  let errorMessage: string | undefined;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as Record<string, unknown>).message);
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: errorMessage,
    statusCode,
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success',
  statusCode: number = 200,
): Response => {
  const totalPages = Math.ceil(total / limit);
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
    statusCode,
  });
};
