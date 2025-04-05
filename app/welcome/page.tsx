'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import ICAL from 'ical.js';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import EventModal from '../components/EventModal';
import CalendarGrid from '../components/CalendarGrid';
import { Calendar, CalendarEvent, MONTHS } from '../types/calendar';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WelcomePage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRightTab, setShowRightTab] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams?.get('username');
  const isFirstLogin = searchParams?.get('firstLogin') === 'true';

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for left, 1 for right
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!username) {
      router.push('/login');
      return;
    }

    // Only show welcome message if it's first login or initial page load
    const fromSettings = sessionStorage.getItem('fromSettings');
    if (!fromSettings) {
      setShowWelcome(true);
      setShowCalendar(false); // Initially hide calendar
      setShowRightTab(false); // Ensure right tab is hidden initially
      const timer = setTimeout(() => {
        setShowWelcome(false);
        // Show calendar after welcome message disappears
        setTimeout(() => setShowCalendar(true), 500);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      sessionStorage.removeItem('fromSettings');
      setShowWelcome(false);
      setShowCalendar(true);
      setShowRightTab(false); // Ensure right tab is hidden when coming from settings
    }

    // Load events from MongoDB
    fetchEvents();
  }, [username, router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/events?username=${encodeURIComponent(username!)}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })));
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jcalData = ICAL.parse(text);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      const calendarId = crypto.randomUUID();
      const calendarName = file.name.replace('.ics', '');
      const calendarColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;

      const newEvents: CalendarEvent[] = vevents.map((vevent) => {
        const event = new ICAL.Event(vevent);
        return {
          id: event.uid || crypto.randomUUID(),
          title: event.summary,
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          description: event.description,
          calendarId,
          calendarName
        };
      });

      // Save to MongoDB
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: newEvents,
          username,
          calendarId
        }),
      });

      if (!response.ok) throw new Error('Failed to save events');

      setCalendars(prev => [...prev, { id: calendarId, name: calendarName, color: calendarColor }]);
      setEvents(prev => [...prev, ...newEvents]);
      alert(`Successfully imported ${newEvents.length} events from ${calendarName}!`);
    } catch (error) {
      console.error('Error importing calendar:', error);
      alert('Error importing calendar file. Please make sure it\'s a valid .ics file.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}&username=${username}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    try {
      const response = await fetch(`/api/events?calendarId=${calendarId}&username=${username}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete calendar');
      setEvents(prev => prev.filter(event => event.calendarId !== calendarId));
      setCalendars(prev => prev.filter(cal => cal.id !== calendarId));
    } catch (error) {
      console.error('Error deleting calendar:', error);
      alert('Failed to delete calendar');
    }
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          updates: event,
          username
        }),
      });
      if (!response.ok) throw new Error('Failed to update event');
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      setEditingEvent(null);
      setShowEventModal(false);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  const handleExportCalendar = (calendarId: string) => {
    const calendarEvents = events.filter(event => event.calendarId === calendarId);
    const calendar = calendars.find(cal => cal.id === calendarId);
    
    const comp = new ICAL.Component(['vcalendar', [], []]);
    comp.updatePropertyWithValue('prodid', '-//SUTDy Calendar//EN');
    comp.updatePropertyWithValue('version', '2.0');

    calendarEvents.forEach(event => {
      const vevent = new ICAL.Component('vevent');
      vevent.updatePropertyWithValue('uid', event.id);
      vevent.updatePropertyWithValue('summary', event.title);
      vevent.updatePropertyWithValue('dtstart', ICAL.Time.fromJSDate(event.start));
      vevent.updatePropertyWithValue('dtend', ICAL.Time.fromJSDate(event.end));
      if (event.description) {
        vevent.updatePropertyWithValue('description', event.description);
      }
      comp.addSubcomponent(vevent);
    });

    const blob = new Blob([comp.toString()], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calendar?.name || 'calendar'}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const handlePreviousMonth = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection(-1);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
      setTimeout(() => setIsAnimating(false), 200);
    }, 0);
  };

  const handleNextMonth = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection(1);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
      setTimeout(() => setIsAnimating(false), 200);
    }, 0);
  };

  if (!username) {
    console.log('Rendering null - no username');
    return null;
  }

  console.log('Rendering welcome page with username:', username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 relative overflow-hidden">
      {/* Glassmorphic background effects */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-center">
              <motion.h1 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-6xl font-light text-gray-900 mb-4"
              >
                {isFirstLogin ? 'Hello' : 'Welcome Back'}, {username}!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-gray-600"
              >
                {isFirstLogin ? 'We\'re excited to have you here!' : 'Great to see you again!'}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0
            }}
            className="p-8"
          >
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => router.push(`/settings?username=${encodeURIComponent(username || '')}`)}
                className="p-2 rounded-full hover:bg-white/30 backdrop-blur-xl transition-colors"
                title="Settings"
              >
                <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex gap-4 items-start">
              {/* Left Tab */}
              <div className="w-[360px] flex-shrink-0 h-fit backdrop-blur-2xl bg-white/20 p-6 rounded-2xl shadow-xl border border-white/50 sticky top-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      {MONTHS[currentDate.getMonth()]} Reminders
                    </h3>
                    {events.filter(event => {
                      const eventDate = new Date(event.start);
                      return eventDate.getMonth() === currentDate.getMonth() &&
                             eventDate.getFullYear() === currentDate.getFullYear();
                    }).length > 0 ? (
                      <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
                        {events
                          .filter(event => {
                            const eventDate = new Date(event.start);
                            return eventDate.getMonth() === currentDate.getMonth() &&
                                   eventDate.getFullYear() === currentDate.getFullYear();
                          })
                          .sort((a, b) => a.start.getTime() - b.start.getTime())
                          .map((event) => (
                            <div
                              key={event.id}
                              className="p-3 bg-white/30 backdrop-blur-xl rounded-lg shadow-sm cursor-pointer hover:bg-white/40 transition-colors"
                              style={{
                                borderLeft: `4px solid ${
                                  calendars.find(cal => cal.id === event.calendarId)?.color || '#000'
                                }`
                              }}
                              onClick={() => {
                                const eventDate = new Date(event.start);
                                setCurrentDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
                                setSelectedDate(eventDate);
                              }}
                            >
                              <div className="flex flex-col">
                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                  {event.title}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <p className="text-xs text-gray-500">
                                    {event.start.toLocaleDateString('en-US', { 
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {event.start.toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No events this month</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Main Calendar Section */}
              <div 
                className={`flex-1 backdrop-blur-2xl bg-white/20 p-6 rounded-2xl shadow-xl border border-white/50 min-w-[800px] flex flex-col h-[calc(100vh-8rem)] transition-[width,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${showRightTab ? 'max-w-[calc(100%-400px)]' : ''}`}
                style={{
                  width: showRightTab ? 'calc(100% - 400px)' : '100%'
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-light text-gray-900">{username}'s Study Calendar</h2>
                      <div className="mt-2 flex items-center space-x-4">
                        <label className="inline-flex items-center px-4 py-2 bg-black/60 backdrop-blur-xl text-white rounded-lg hover:bg-black/50 transition-colors cursor-pointer">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Import Calendar
                          <input
                            type="file"
                            accept=".ics"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => {
                            const today = new Date();
                            setCurrentDate(today);
                            setSelectedDate(today);
                          }}
                          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-white/30 backdrop-blur-xl rounded-lg hover:bg-white/40 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Today
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handlePreviousMonth}
                        className="p-2 hover:bg-black/5 rounded-full transition-all duration-200 transform hover:scale-110"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-lg font-light text-gray-900 min-w-[140px] text-center">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </span>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-black/5 rounded-full transition-all duration-200 transform hover:scale-110"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {calendars.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {calendars.map(calendar => (
                        <div
                          key={calendar.id}
                          className="flex items-center space-x-2 px-3 py-1 bg-white/30 backdrop-blur-xl rounded-full shadow-sm"
                          style={{ borderLeft: `4px solid ${calendar.color}` }}
                        >
                          <span className="text-sm font-medium text-gray-900">{calendar.name}</span>
                          <button
                            onClick={() => handleExportCalendar(calendar.id)}
                            className="p-1 hover:bg-white/30 backdrop-blur-xl rounded-full transition-colors"
                            title="Export calendar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCalendar(calendar.id)}
                            className="p-1 hover:bg-white/30 backdrop-blur-xl rounded-full text-red-500 transition-colors"
                            title="Delete calendar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    <CalendarGrid
                      currentDate={currentDate}
                      selectedDate={selectedDate}
                      events={events}
                      calendars={calendars}
                      slideDirection={slideDirection}
                      onSelectDate={(date) => {
                        setSelectedDate(date);
                        setShowRightTab(true);
                      }}
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Tab */}
              <AnimatePresence>
                {showRightTab && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 360, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    style={{
                      maxWidth: 360,
                      overflow: 'hidden'
                    }}
                    className="h-fit backdrop-blur-2xl bg-white/20 rounded-2xl shadow-xl border border-white/50 sticky top-8"
                  >
                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="w-full self-start overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-hide"
                        >
                          {selectedDate && (
                            <motion.div
                              key={selectedDate.toISOString()}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              className="w-full"
                            >
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {selectedDate.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {selectedDate.getFullYear()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => setShowRightTab(false)}
                                  className="p-1.5 hover:bg-white/30 rounded-full transition-colors"
                                  title="Close details"
                                >
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              {getEventsForDate(selectedDate).length > 0 ? (
                                <div className="space-y-3">
                                  {getEventsForDate(selectedDate).map((event) => (
                                    <div
                                      key={event.id}
                                      className="p-3 bg-white/30 backdrop-blur-xl rounded-lg shadow-sm"
                                      style={{
                                        borderLeft: `4px solid ${
                                          calendars.find(cal => cal.id === event.calendarId)?.color || '#000'
                                        }`
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => {
                                              setEditingEvent(event);
                                              setShowEventModal(true);
                                            }}
                                            className="p-1 hover:bg-gray-100/50 backdrop-blur-sm rounded-full"
                                            title="Edit event"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="p-1 hover:bg-gray-100/50 backdrop-blur-sm rounded-full text-red-500"
                                            title="Delete event"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-500">
                                        {event.start.toLocaleTimeString()} - {event.end.toLocaleTimeString()}
                                      </p>
                                      {event.description && (
                                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">{event.calendarName}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600 bg-white/30 backdrop-blur-xl rounded-lg py-2 px-3">No events scheduled for this day</p>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showEventModal && editingEvent && (
        <EventModal
          editingEvent={editingEvent}
          onClose={() => {
            setEditingEvent(null);
            setShowEventModal(false);
          }}
          onSave={handleEditEvent}
        />
      )}
    </div>
  );
} 