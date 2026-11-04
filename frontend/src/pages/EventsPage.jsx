import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Clock,
  User,
  Users,
  Award,
  ChevronDown,
  Info
} from 'lucide-react';

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRulesId, setExpandedRulesId] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/categories/'),
      api.get('/events/')
    ])
      .then(([catRes, evRes]) => {
        setCategories(catRes.data.results || catRes.data || []);
        setEvents(evRes.data.results || evRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory ? String(ev.category) === String(selectedCategory) : true;
    const matchesStatus = selectedStatus ? ev.status === selectedStatus : true;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      ev.name?.toLowerCase().includes(query) ||
      ev.name_ml?.toLowerCase().includes(query) ||
      ev.description?.toLowerCase().includes(query) ||
      ev.venue?.toLowerCase().includes(query);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('events.all_events')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Explore sports tournaments, arts festivals, literary & academic contests with live deadline countdowns.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title, venue..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Select */}
          {/* <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {i18n.language === 'ml' && c.name_ml ? c.name_ml : c.name}
                </option>
              ))}
            </select>
          </div> */}

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open for Registration</option>
              <option value="CLOSED">Registration Closed</option>
              <option value="RESULTS_PUBLISHED">Results Published</option>
              <option value="COMPLETED">Completed</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-700">No events matched your filters.</p>
          <p className="text-xs text-slate-500">Try clearing the search or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isRulesExpanded = expandedRulesId === ev.id;
            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Category and Countdown badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {i18n.language === 'ml' && ev.category_name_ml ? ev.category_name_ml : ev.category_name}
                    </span>
                    <CountdownTimer
                      closeDate={ev.registration_close_date}
                      isOverridden={ev.is_registration_overridden}
                      status={ev.status}
                    />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                      {i18n.language === 'ml' && ev.name_ml ? ev.name_ml : ev.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                      {i18n.language === 'ml' && ev.description_ml ? ev.description_ml : ev.description}
                    </p>
                  </div>

                  {/* Event Details metadata */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ev.event_date} • {ev.start_time?.slice(0, 5)} - {ev.end_time?.slice(0, 5)}</span>
                    </div>

                    {ev.coordinating_teacher_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Coordinator: <strong>{ev.coordinating_teacher_name}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Expandable Rules */}
                  {ev.rules && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedRulesId(isRulesExpanded ? null : ev.id)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>{isRulesExpanded ? 'Hide Rules' : 'View Rules & Criteria'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isRulesExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isRulesExpanded && (
                        <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-100 animate-in fade-in">
                          <p><strong>Rules:</strong> {ev.rules}</p>
                          {ev.scoring_criteria && (
                            <p><strong>Scoring:</strong> {ev.scoring_criteria}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Classes: <strong className="text-slate-700">{ev.participating_classes}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.participants_count || 0} enrolled</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
