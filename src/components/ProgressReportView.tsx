import React, { useState } from 'react';
import {
  Sparkles,
  LineChart,
  BookOpen,
  Send,
  Copy,
  Check,
  Plus,
  Clock,
  User,
  Bot,
} from 'lucide-react';
import { Student, Lesson, ProgressNote } from '../types';
import { openMessengerShare } from '../utils/formatters';

interface ProgressReportViewProps {
  students: Student[];
  lessons: Lesson[];
  progressNotes: ProgressNote[];
  onSaveProgressNote: (note: Partial<ProgressNote>) => void;
}

export const ProgressReportView: React.FC<ProgressReportViewProps> = ({
  students,
  lessons,
  progressNotes,
  onSaveProgressNote,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiReportText, setAiReportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Form for AI generator
  const [topics, setTopics] = useState('Звичайні дроби, рівняння, текстові задачі');
  const [strengths, setStrengths] = useState('Уважність при виконанні дій, хороша пам\'ять на формули');
  const [areasToImprove, setAreasToImprove] = useState('Розв\'язання складних геометричних задач');

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Filter student lessons
  const studentLessons = lessons
    .filter((l) => l.studentId === selectedStudentId && l.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date));

  // Filter student progress notes
  const studentNotes = progressNotes.filter((n) => n.studentId === selectedStudentId);

  const handleGenerateAiReport = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    setAiReportText('');

    try {
      const response = await fetch('/api/ai/generate-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          parentName: selectedStudent.parentName,
          grade: selectedStudent.grade,
          topics,
          strengths,
          areasToImprove,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setAiReportText(data.result);
      } else if (data.error) {
        setAiReportText(`Помилка: ${data.error}`);
      }
    } catch (err: any) {
      setAiReportText('Не вдалося з’єднатися з сервером AI. Перевірте підключення.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#161129] border border-purple-800/40 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <LineChart className="w-4 h-4" />
          Аналітика та Звіти Прогресу
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Прогрес Учня та Нотатки
        </h2>
        <p className="text-xs text-purple-300/70 mt-1">
          Фіксуйте засвоєні теми та генеруйте підсумкові звіти для батьків за допомогою AI
        </p>
      </div>

      {/* Select Student Selector */}
      <div className="bg-[#161129] border border-purple-800/40 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-purple-200 font-semibold">
          <User className="w-4 h-4 text-purple-400" />
          Виберіть учня:
        </div>

        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="bg-[#221b44] border border-purple-800/50 text-purple-100 rounded-xl px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-purple-500 max-w-md w-full"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#161129] text-white">
              {s.name} ({s.parentName || 'Батьки'}) — {s.grade || 'Учень'}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Report Generator Card */}
          <div className="bg-[#161129] border border-purple-800/40 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
              <Bot className="w-5 h-5 text-purple-400" />
              AI Помічник: Звіт про успіхи для батьків
            </div>

            <p className="text-xs text-purple-300/70">
              Вкажіть головні здобутки дитини за останні кілька занять, щоб згенерувати приємне та структуроване повідомлення.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-purple-300 mb-1">
                  Пройдені теми з математики
                </label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-300 mb-1">
                  Сильні сторони та успіхи
                </label>
                <input
                  type="text"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-300 mb-1">
                  Над чим продовжуємо працювати
                </label>
                <input
                  type="text"
                  value={areasToImprove}
                  onChange={(e) => setAreasToImprove(e.target.value)}
                  className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleGenerateAiReport}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                {isGenerating ? 'AI формулює текст...' : '✨ Згенерувати звіт для батьків'}
              </button>
            </div>

            {/* Generated AI Result */}
            {aiReportText && (
              <div className="p-4 bg-[#221b44] border border-purple-800/50 rounded-2xl space-y-3 mt-4">
                <div className="text-xs font-bold text-purple-200 flex items-center justify-between">
                  <span>Згенероване повідомлення:</span>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Скопійовано' : 'Копіювати'}
                  </button>
                </div>

                <div className="text-xs text-purple-100 whitespace-pre-wrap leading-relaxed">
                  {aiReportText}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-800/40">
                  <button
                    type="button"
                    onClick={() => openMessengerShare(aiReportText, 'telegram')}
                    className="py-1.5 px-3 rounded-xl bg-sky-950/80 hover:bg-sky-900/80 text-sky-300 border border-sky-800/50 text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Telegram
                  </button>
                  <button
                    type="button"
                    onClick={() => openMessengerShare(aiReportText, 'viber')}
                    className="py-1.5 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800/50 text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Viber
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Historical Topics & Progress History */}
          <div className="bg-[#161129] border border-purple-800/40 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Історія проведених занять ({selectedStudent.name})
            </div>

            {studentLessons.length === 0 ? (
              <p className="text-xs text-purple-300/60 italic">
                Проведених занять для цього учня поки немає у системі.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {studentLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-[#221b44] border border-purple-800/40 rounded-2xl p-3.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-purple-200">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {lesson.date} ({lesson.time})
                      </span>
                      <span className="text-purple-300/70 font-medium">
                        {lesson.durationMinutes} хв
                      </span>
                    </div>

                    <div className="text-purple-100">
                      <span className="text-purple-300/70 font-semibold">Тема: </span>
                      {lesson.topic || 'Без назви теми'}
                    </div>

                    {lesson.comment && (
                      <div className="text-purple-200 bg-[#161129] p-2.5 rounded-xl border border-purple-800/40 mt-1">
                        {lesson.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
