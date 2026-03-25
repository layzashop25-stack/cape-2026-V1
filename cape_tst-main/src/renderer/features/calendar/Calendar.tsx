import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useLanguage } from '@/i18n/LanguageContext';
import { monthNames } from '@/i18n/translations';
import { db } from '@/services/database';

interface Event {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newEvent, setNewEvent] = useState({ time: '', title: '', description: '' });
  const { t, language } = useLanguage();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const saved = await db.getCalendarEvents();
    setEvents(saved);
  };

  const saveEvents = async (evts: Event[]) => {
    setEvents(evts);
    await db.saveCalendarEvents(evts);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.time) return;
    const event: Event = {
      id: Date.now().toString(),
      date: selectedDate,
      ...newEvent
    };
    saveEvents([...events, event]);
    setNewEvent({ time: '', title: '', description: '' });
    setShowModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  const openModal = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="glass rounded-2xl p-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {monthNames[language][currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} variant="secondary">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button onClick={() => setCurrentDate(new Date())} variant="secondary">
              {t.today || 'Today'}
            </Button>
            <Button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} variant="secondary">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center font-bold text-slate-600 py-2">{day}</div>
          ))}
          {blanks.map(i => <div key={`blank-${i}`} />)}
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            return (
              <div
                key={day}
                onClick={() => openModal(day)}
                className={`min-h-24 p-2 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</div>
                {dayEvents.map(evt => (
                  <div key={evt.id} className="text-xs bg-purple-100 text-purple-700 rounded px-1 py-0.5 mb-1 truncate">
                    {evt.time} {evt.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="glass rounded-2xl p-6 card-hover">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {t.upcomingEvents || 'Upcoming Events'}
        </h3>
        {events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(evt => (
          <div key={evt.id} className="flex items-center justify-between p-4 bg-white rounded-xl mb-2 border-2 border-slate-100">
            <div className="flex-1">
              <div className="font-bold text-slate-800">{evt.title}</div>
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(evt.date).toLocaleDateString()} - {evt.time}
              </div>
              {evt.description && <div className="text-sm text-slate-500 mt-1">{evt.description}</div>}
            </div>
            <Button onClick={() => handleDeleteEvent(evt.id)} variant="secondary" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">{t.addEvent || 'Add Event'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <Input label={t.date || 'Date'} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              <Input label={t.time || 'Time'} type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} />
              <Input label={t.title || 'Title'} value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.description || 'Description'}</label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  rows={3}
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <Button onClick={handleAddEvent} className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                {t.addEvent || 'Add Event'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
