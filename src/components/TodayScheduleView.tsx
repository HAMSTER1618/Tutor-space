import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Lesson, Student, LessonStatus } from '../types';
import { formatFullDateUA, formatCurrency, getTodayStr } from '../utils/formatters';

interface TodayScheduleViewProps {
  lessons: Lesson[];
  students: Student[];
  onUpdateLessonStatus: (lessonId: string, newStatus: LessonStatus, comment?: string, topic?: string) => void;
  onOpenAddLesson: (studentId?: string, date?: string) => void;
  onOpenMessageModal: (studentId: string) => void;
}

export const TodayScheduleView: React.FC<TodayScheduleViewProps> = ({
  lessons,
  students,
  onUpdateLessonStatus,
  onOpenAddLesson,
  onOpenMessageModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [viewFilter, setViewFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');
  const [editingCommentLessonId, setEditingCommentLessonId] = useState<string | null>(null);
  const [tempTopic, setTempTopic] = useState('');
  const [tempComment, setTempComment] = useState('');

  const todayStr = getTodayStr();

  // Helper date calculations
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleFilterChange = (filter: 'today' | 'tomorrow' | 'week' | 'all') => {
    setViewFilter(filter);
    if (filter === 'today') setSelectedDate(todayStr);
    if (filter === 'tomorrow') setSelectedDate(getTomorrowStr());
  };

  const handleDateShift = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
    setViewFilter('today');
  };

  // Filter lessons based on selection
  const filteredLessons = lessons.filter((l) => {
    if (viewFilter === 'today' || viewFilter === 'tomorrow') {
      return l.date === selectedDate;
    }
    if (viewFilter === 'week') {
      const start = new Date(todayStr);
      const end = new Date(todayStr);
      end.setDate(end.getDate() + 7);
      const lDate = new Date(l.date);
      return lDate >= start && lDate <= end;
    }
    return true; // 'all'
  }).sort((a, b) => {
    if (a.date === b.date) return a.time.localeCompare(b.time);
    return a.date.localeCompare(b.date);
  });

  // Calculate statistics for selected view
  const completedCount = filteredLessons.filter((l) => l.status === 'completed').length;
  const scheduledCount = filteredLessons.filter((l) => l.status === 'scheduled').length;
  const cancelledCount = filteredLessons.filter((l) => l.status === 'cancelled').length;

  const startEditComment = (lesson: Lesson) => {
    setEditingCommentLessonId(lesson.id);
    setTempTopic(lesson.topic || '');
    setTempComment(lesson.comment || '');
  };

  const saveEditComment = (lesson: Lesson) => {
    onUpdateLessonStatus(lesson.id, lesson.status, tempComment, tempTopic);
    setEditingCommentLessonId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161129] border border-purple-900/40 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <CalendarIcon className="w-4 h-4" />
            Розклад занять
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">
            {formatFullDateUA(selectedDate)}
          </h2>
          <p className="text-xs text-purple-300/70 mt-1">
            Керуйте відвідуваністю, відмінами та темами у реальному часі з телефону або ПК
          </p>
        </div>

        <button
          onClick={() => onOpenAddLesson(undefined, selectedDate)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Додати заняття
        </button>
      </div>

      {/* Date Navigation & View Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#161129] p-3.5 rounded-2xl border border-purple-900/40 shadow-xl">
        {/* Quick Date Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDateShift(-1)}
            className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 transition"
            title="Попередній день"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setViewFilter('today');
            }}
            className="bg-[#221b44] border border-purple-800/50 text-purple-100 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500"
          />

          <button
            onClick={() => handleDateShift(1)}
            className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 transition"
            title="Наступний день"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-purple-400/60 ml-1 hidden sm:block" />
          {[
            { id: 'today', label: 'Сьогодні' },
            { id: 'tomorrow', label: 'Завтра' },
            { id: 'week', label: 'Цей тиждень' },
            { id: 'all', label: 'Всі заняття' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                viewFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-purple-950/50 border border-purple-900/40 text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Summary Statistics Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-[#161129] border border-purple-900/40 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center justify-center font-bold text-base">
            {scheduledCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-purple-100">Заплановано</div>
            <div className="text-[10px] text-purple-300/60">Очікують проведення</div>
          </div>
        </div>

        <div className="p-4 bg-[#161129] border border-emerald-900/30 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center justify-center font-bold text-base">
            {completedCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-purple-100">Проведено</div>
            <div className="text-[10px] text-purple-300/60">Відбулися успішно</div>
          </div>
        </div>

        <div className="p-4 bg-[#161129] border border-rose-900/30 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800/50 flex items-center justify-center font-bold text-base">
            {cancelledCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-purple-100">Скасовано</div>
            <div className="text-[10px] text-purple-300/60">Відміни або перенесення</div>
          </div>
        </div>
      </div>

      {/* Lessons Cards List */}
      {filteredLessons.length === 0 ? (
        <div className="bg-[#161129] border border-purple-900/40 rounded-3xl p-8 text-center text-purple-300/70 space-y-3 shadow-xl">
          <CalendarIcon className="w-12 h-12 mx-auto text-purple-400/50 stroke-[1.5]" />
          <p className="text-base font-semibold text-purple-100">
            На цей день немає запланованих занять
          </p>
          <p className="text-xs text-purple-300/60 max-w-sm mx-auto">
            Ви можете легко додати нове заняття або вибрати іншу дату у календарі вище.
          </p>
          <button
            onClick={() => onOpenAddLesson(undefined, selectedDate)}
            className="mt-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            + Запланувати заняття
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson) => {
            const student = students.find((s) => s.id === lesson.studentId);
            const isEditing = editingCommentLessonId === lesson.id;

            return (
              <div
                key={lesson.id}
                className={`bg-[#161129] border rounded-3xl p-5 sm:p-6 transition shadow-xl relative overflow-hidden ${
                  lesson.status === 'completed'
                    ? 'border-emerald-800/40 bg-emerald-950/10'
                    : lesson.status === 'cancelled'
                    ? 'border-rose-800/40 bg-rose-950/10 opacity-80'
                    : 'border-purple-900/40'
                }`}
              >
                {/* Header: Student Name & Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#221b44] text-purple-200 border border-purple-700/40 flex items-center justify-center font-bold text-base shadow-xs">
                      {lesson.time}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          {student?.name || 'Учень'}
                        </h3>
                        {student?.grade && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/40 font-medium">
                            {student.grade}
                          </span>
                        )}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800/50">
                          {formatCurrency(lesson.priceAtTime, student?.currency || 'UAH')}
                        </span>
                      </div>

                      <div className="text-xs text-purple-300/70 mt-0.5 flex items-center gap-2">
                        <span>Батьки: {student?.parentName || 'Не вказано'}</span>
                        <span>•</span>
                        <span className="capitalize font-medium">
                          {student?.paymentType === 'postpaid' ? 'По факту' : `Предоплата (${student?.prepaidLessonsLeft} зал.)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {lesson.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Проведено
                      </span>
                    )}

                    {lesson.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800/50 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        Скасовано
                      </span>
                    )}

                    {lesson.status === 'scheduled' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        Заплановано
                      </span>
                    )}

                    {lesson.status === 'rescheduled' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800/50 text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Перенесено
                      </span>
                    )}
                  </div>
                </div>

                {/* Lesson Details & Topic */}
                <div className="py-3 text-xs text-purple-200 space-y-2">
                  {lesson.topic && (
                    <div className="flex items-start gap-2 text-purple-100 bg-[#221b44] p-3 rounded-2xl border border-purple-800/30">
                      <BookOpen className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-purple-300/70 font-medium">Тема: </span>
                        <span className="font-semibold">{lesson.topic}</span>
                      </div>
                    </div>
                  )}

                  {lesson.comment && (
                    <div className="text-purple-200 bg-[#221b44] p-3 rounded-2xl border border-purple-800/30">
                      <span className="font-semibold text-purple-100">Нотатка: </span>
                      {lesson.comment}
                    </div>
                  )}

                  {student?.notes && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/30 font-medium">
                      📌 Умови учня: {student.notes}
                    </div>
                  )}
                </div>

                {/* Inline Edit Topic/Comment Form */}
                {isEditing && (
                  <div className="p-4 bg-[#221b44] border border-purple-800/50 rounded-2xl my-3 space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-purple-300">Тема заняття:</label>
                      <input
                        type="text"
                        value={tempTopic}
                        onChange={(e) => setTempTopic(e.target.value)}
                        placeholder="напр. Дроби, Квадратні рівняння..."
                        className="w-full bg-[#161129] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-purple-300">Коментар / ДЗ / Прогрес:</label>
                      <input
                        type="text"
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        placeholder="напр. Засвоїли формули, ДЗ ст.45 №10-15"
                        className="w-full bg-[#161129] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingCommentLessonId(null)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-950 text-purple-300 text-xs font-medium border border-purple-800/40"
                      >
                        Скасувати
                      </button>
                      <button
                        onClick={() => saveEditComment(lesson)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm"
                      >
                        Зберегти
                      </button>
                    </div>
                  </div>
                )}

                {/* Fast Action Buttons Bar */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-purple-900/30">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onUpdateLessonStatus(lesson.id, 'completed')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        lesson.status === 'completed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-purple-950/80 text-purple-300 border border-purple-800/40 hover:bg-emerald-950 hover:text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Проведено
                    </button>

                    <button
                      onClick={() => onUpdateLessonStatus(lesson.id, 'cancelled')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        lesson.status === 'cancelled'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-purple-950/80 text-purple-300 border border-purple-800/40 hover:bg-rose-950 hover:text-rose-300'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Відміна
                    </button>

                    <button
                      onClick={() => onUpdateLessonStatus(lesson.id, 'scheduled')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        lesson.status === 'scheduled'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-950/80 text-purple-300/80 border border-purple-800/40 hover:text-white hover:bg-purple-900/60'
                      }`}
                    >
                      Заплановано
                    </button>
                  </div>

                  {/* Comment & Parent Message Quick Triggers */}
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <button
                        onClick={() => startEditComment(lesson)}
                        className="px-3 py-1.5 text-xs text-purple-300 hover:text-white bg-purple-950/80 hover:bg-purple-900/60 border border-purple-800/40 rounded-xl transition font-medium"
                        title="Додати тему або коментар"
                      >
                        + Тема/Нотатка
                      </button>
                    )}

                    {student && (
                      <button
                        onClick={() => onOpenMessageModal(student.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700/50 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                        Повідомлення батькам
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
