import { useState } from 'react';
import { RepeatOption } from '../components/Task';

interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  repeat?: RepeatOption;
}

export function useCalendar() {
  const [isLoading, setIsLoading] = useState(false);

  const addTaskToCalendar = async (event: CalendarEvent) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to add event to calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addTaskToCalendar,
    isLoading,
  };
} 