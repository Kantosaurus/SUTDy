import React from 'react';
import { CalendarEvent } from '../types/calendar';

interface EventModalProps {
  editingEvent: CalendarEvent;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}

export default function EventModal({ editingEvent: initialEvent, onClose, onSave }: EventModalProps) {
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent>(initialEvent);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Event</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(editingEvent);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                value={editingEvent.start.toISOString().slice(0, 16)}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  start: new Date(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="datetime-local"
                value={editingEvent.end.toISOString().slice(0, 16)}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  end: new Date(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  description: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 