import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarEvent, DAYS_OF_WEEK } from '../types/calendar';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
  calendars: Calendar[];
  slideDirection: number;
  onSelectDate: (date: Date) => void;
}

export default function CalendarGrid({
  currentDate,
  selectedDate,
  events,
  calendars,
  slideDirection,
  onSelectDate
}: CalendarGridProps) {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return selectedDate &&
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-gray-400 text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <motion.div
        key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
        className="grid grid-cols-7 gap-0.5 flex-1 auto-rows-fr"
        initial={{ opacity: 0, x: slideDirection > 0 ? 100 : -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: slideDirection > 0 ? -100 : 100 }}
        transition={{ 
          type: "tween",
          duration: 0.2,
          ease: "easeInOut",
          layout: { duration: 0.3 }
        }}
      >
        {generateCalendarDays().map((date, index) => (
          <div
            key={index}
            className={`relative w-full ${
              date ? 'cursor-pointer transform transition-all duration-200' : ''
            } rounded-lg ${
              date && isSelected(date) ? 'bg-black/5 backdrop-blur-xl scale-105' : 'hover:scale-105'
            }`}
            onClick={() => {
              if (date) {
                onSelectDate(date);
              }
            }}
          >
            {date && (
              <div className="absolute inset-1 flex items-center justify-center">
                <div
                  className={`flex items-center justify-center text-sm ${
                    isToday(date)
                      ? 'text-red-500 font-medium'
                      : isSelected(date)
                      ? 'text-black font-medium'
                      : 'text-gray-600 hover:text-black font-light'
                  }`}
                >
                  {date.getDate()}
                </div>
                {getEventsForDate(date).length > 0 && (
                  <div 
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5"
                  >
                    {calendars
                      .filter(cal => 
                        getEventsForDate(date).some(event => event.calendarId === cal.id)
                      )
                      .map(cal => (
                        <div
                          key={cal.id}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: cal.color }}
                        />
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </>
  );
} 