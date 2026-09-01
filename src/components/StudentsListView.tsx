import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Wallet,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Edit2,
  Phone,
  Tag,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';
import { Student, Lesson } from '../types';
import { formatCurrency, getUnpaidLessonsForStudent, formatDateUA } from '../utils/formatters';

interface StudentsListViewProps {
  students: Student[];
  lessons: Lesson[];
  onOpenAddStudent: (student?: Student) => void;
  onOpenAddLesson: (studentId: string) => void;
  onOpenMessageModal: (studentId: string) => void;
  onPayOutstanding: (studentId: string, addLessonsCount?: number) => void;
}

export const StudentsListView: React.FC<StudentsListViewProps> = ({
  students,
  lessons,
  onOpenAddStudent,
  onOpenAddLesson,
  onOpenMessageModal,
  onPayOutstanding,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'UAH' | 'CZK' | 'EUR'>('all');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCurrency = currencyFilter === 'all' || s.currency === currencyFilter;

    return matchesSearch && matchesCurrency;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161129] border border-purple-900/40 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Users className="w-4 h-4" />
            Список Учнів та Розрахунки
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Керування Учнями та Балансами</h2>
          <p className="text-xs text-purple-300/70 mt-1">
            Відстежуйте борги по факту, залишок предоплати та генеруйте повідомлення батькам
          </p>
        </div>

        <button
          onClick={() => onOpenAddStudent()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Додати нового учня
        </button>
      </div>

      {/* Search Bar & Currency Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#161129] p-3.5 rounded-2xl border border-purple-900/40 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-purple-400/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Пошук за ім'ям дитини або батьків..."
            className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Всі учні' },
            { id: 'UAH', label: 'Україна (UAH ₴)' },
            { id: 'CZK', label: 'Чехія (CZK Kč)' },
            { id: 'EUR', label: 'Європа (EUR €)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrencyFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                currencyFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                  : 'bg-purple-950/50 border border-purple-900/40 text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map((student) => {
          const unpaidLessons = getUnpaidLessonsForStudent(student.id, lessons);
          const totalDebt = unpaidLessons.reduce((sum, l) => sum + l.priceAtTime, 0);

          return (
            <div
              key={student.id}
              className="bg-[#161129] border border-purple-900/40 hover:border-purple-700/60 rounded-3xl p-6 transition shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Name, Parent, Badges */}
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-purple-900/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{student.name}</h3>
                      {student.grade && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/40 font-medium">
                          {student.grade}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-purple-300/70 mt-1 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-purple-400" />
                      <span>{student.parentName || 'Батьки'}</span>
                      {student.phone && <span>({student.phone})</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-950 text-purple-200 border border-purple-800/50">
                      {formatCurrency(student.pricePerLesson, student.currency)} / зан.
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 uppercase tracking-wider font-semibold border border-purple-800/30">
                      {student.paymentType === 'postpaid' ? 'По факту' : 'Предоплата'}
                    </span>
                  </div>
                </div>

                {/* Balance & Payment Status Section */}
                <div className="py-3">
                  {student.paymentType === 'postpaid' ? (
                    <div className={`p-4 rounded-2xl border ${
                      unpaidLessons.length > 0
                        ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                        : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Wallet className="w-4 h-4 text-purple-300" />
                          {unpaidLessons.length > 0 ? (
                            <span className="text-rose-300">До сплати: {formatCurrency(totalDebt, student.currency)}</span>
                          ) : (
                            <span className="text-emerald-300">Все оплачено! Неоплачених занять немає</span>
                          )}
                        </div>

                        {unpaidLessons.length > 0 && (
                          <button
                            onClick={() => onPayOutstanding(student.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Оплачено
                          </button>
                        )}
                      </div>

                      {unpaidLessons.length > 0 && (
                        <div className="mt-2 text-xs text-rose-300/80 font-medium">
                          Дані занять: {unpaidLessons.map((l) => formatDateUA(l.date)).join(', ')}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Prepaid Model Balance Box */
                    <div className={`p-4 rounded-2xl border ${
                      student.prepaidLessonsLeft <= 1
                        ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                        : 'bg-[#221b44] border-purple-800/50 text-purple-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-purple-300/70">Залишок предоплати:</div>
                          <div className="text-base font-bold flex items-center gap-2 text-white">
                            <span>{student.prepaidLessonsLeft} оплачених занять</span>
                            {student.prepaidLessonsLeft <= 1 && (
                              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onPayOutstanding(student.id, 4)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          +4 заняття
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes & Special Rules */}
                {student.notes && (
                  <div className="text-xs text-purple-200 bg-[#221b44] p-3 rounded-2xl border border-purple-800/30">
                    <span className="font-semibold text-purple-100">Нотатки/Умови: </span>
                    {student.notes}
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons */}
              <div className="pt-3 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onOpenMessageModal(student.id)}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  Повідомлення для батьків
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAddLesson(student.id)}
                    className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 transition"
                    title="Запланувати заняття"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenAddStudent(student)}
                    className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 transition"
                    title="Редагувати дані учня"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
