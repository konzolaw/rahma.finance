import api from './client';
import { RecurringTransaction } from '@/types';

export const recurringApi = {
  list: () => api.get<RecurringTransaction[]>('/recurring/'),
  create: (data: Partial<RecurringTransaction>) => api.post<RecurringTransaction>('/recurring/', data),
  update: (id: string, data: Partial<RecurringTransaction>) => api.patch<RecurringTransaction>(`/recurring/${id}/`, data),
  delete: (id: string) => api.delete(`/recurring/${id}/`),
  trigger: () => api.post<{message: string, count: number}>('/recurring/trigger_processing/'),
};
