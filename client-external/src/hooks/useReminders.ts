import useSWR from 'swr';
import { apiClient } from '../services/api';
import type { Reminder } from '../types';

export const useReminders = () => {
  const { data, error, isLoading, mutate } = useSWR<Reminder[]>('/reminders', apiClient);

  return {
    reminders: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
