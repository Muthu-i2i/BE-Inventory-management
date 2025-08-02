import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: string;
  };
}

export interface PaginationQuery {
  page?: string;
  page_size?: string;
}

export interface FilterQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeQuery {
  start_date: string;
  end_date: string;
}