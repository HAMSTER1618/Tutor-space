import React, { useState } from 'react';
import { X, Calendar, Clock, BookOpen, PlusCircle } from 'lucide-react';
import { Student, Lesson } from '../types';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newLessons: Partial<Lesson>[]) => void;
  students: Student[];
  initialStudentId?: string;
  initialDate?: string;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  initialStudentId,
  initialDate,
}) => {
  const [studentId, setStudentId] = useState(initialStudentId || (students[0]?.id || ''));
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('15:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [topic, setTopic] = useState('');
  const [recurringWeeks, setRecurringWeeks] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    const selectedStudent = students.find((s) => s.id === studentId);
    const price = selectedStudent ? selectedStudent.pricePerLesson : 250;

    const lessonsToCreate: Partial<Lesson>[] = [];

    // Base lesson
    const baseDateObj = new Date(date);

    for (let i = 0; i < recurringWeeks; i++) {
      const d = new Date(baseDateObj);
      d.setDate(d.getDate() + i * 7);
      const dateStr = d.toISOString().split('T')[0];

      lessonsToCreate.push({
        studentId,
        date: dateStr,
        time,
        durationMinutes: Number(durationMinutes) || 60,
        status: 'scheduled',
        topic: topic.trim() || undefined,
        isPaid: selectedStudent?.paymentType === 'prepaid' ? true : false,
        priceAtTime: price,
      });
    }

    onSave(lessonsToCreate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161129] border border-purple-800/50 rounded-3xl max-w-md w-full p-6 text-purple-100 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-white p-1.5 rounded-xl hover:bg-purple-900/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Додати заняття у розклад</h2>
            <p className="text-xs text-purple-300/70">Встановіть дату, час та учня</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Student Picker */}
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Учень *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#161129] text-white">
                  {s.name} ({s.parentName || 'Батьки'}) — {s.pricePerLesson} {s.currency}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Дата *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Час *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl pl-9 pr-3.5 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Тривалість (хвилин)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-semibold transition ${
                    durationMinutes === mins
                      ? 'bg-purple-600 border-purple-500 text-white shadow-xs'
                      : 'bg-[#221b44] border-purple-800/40 text-purple-300 hover:bg-[#2c2254]'
                  }`}
                >
                  {mins} хв
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Тема заняття (необов’язково)
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="напр. Дроби, Рівняння, Підготовка Cermat"
                className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl pl-9 pr-3.5 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Recurring Option */}
          <div className="p-3.5 bg-[#221b44] border border-purple-800/50 rounded-2xl">
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Повторити на наступні тижні
            </label>
            <select
              value={recurringWeeks}
              onChange={(e) => setRecurringWeeks(Number(e.target.value))}
              className="w-full bg-[#161129] border border-purple-800/60 rounded-xl px-3 py-1.5 text-xs text-purple-100 focus:outline-none focus:border-purple-500"
            >
              <option value={1} className="bg-[#161129] text-white">Одноразово (тільки 1 заняття)</option>
              <option value={2} className="bg-[#161129] text-white">Повторити 2 тижні поспіль</option>
              <option value={4} className="bg-[#161129] text-white">Повторити 4 тижні (місяць)</option>
              <option value={8} className="bg-[#161129] text-white">Повторити 8 тижнів</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-purple-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#221b44] text-purple-300 hover:bg-[#2c2254] text-xs font-semibold transition"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-600/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Додати у розклад
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
