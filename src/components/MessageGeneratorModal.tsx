import React, { useState, useEffect } from 'react';
import { X, Copy, Send, Check, MessageSquare, RefreshCw, Edit3 } from 'lucide-react';
import { Student, Lesson, UserSettings, MessageTemplate } from '../types';
import {
  getUnpaidLessonsForStudent,
  generateParentMessageText,
  openMessengerShare,
} from '../utils/formatters';

interface MessageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  lessons: Lesson[];
  settings: UserSettings;
  preselectedStudentId?: string | null;
}

export const MessageGeneratorModal: React.FC<MessageGeneratorModalProps> = ({
  isOpen,
  onClose,
  students,
  lessons,
  settings,
  preselectedStudentId,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customBlockCount, setCustomBlockCount] = useState<number>(4);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (students.length > 0) {
      const initialId = preselectedStudentId || students[0].id;
      setSelectedStudentId(initialId);
    }
  }, [students, preselectedStudentId, isOpen]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Auto pick standard template when student changes
  useEffect(() => {
    if (!selectedStudent) return;

    let defaultTmplId = settings.templates[0]?.id;

    if (selectedStudent.paymentType === 'prepaid') {
      const prepaidTmpl = settings.templates.find((t) => t.type === 'prepaid');
      if (prepaidTmpl) defaultTmplId = prepaidTmpl.id;
    } else if (selectedStudent.currency === 'CZK' || selectedStudent.currency === 'EUR') {
      const czTmpl = settings.templates.find((t) => t.language === 'cz_eu');
      if (czTmpl) defaultTmplId = czTmpl.id;
    } else {
      const uaTmpl = settings.templates.find((t) => t.language === 'ua' && t.type === 'postpaid');
      if (uaTmpl) defaultTmplId = uaTmpl.id;
    }

    setSelectedTemplateId(defaultTmplId || settings.templates[0]?.id || '');
  }, [selectedStudentId, settings.templates]);

  // Regenerate message text whenever student, template, or custom count changes
  useEffect(() => {
    if (!selectedStudent) return;
    const tmpl = settings.templates.find((t) => t.id === selectedTemplateId) || settings.templates[0];
    if (!tmpl) return;

    const unpaid = getUnpaidLessonsForStudent(selectedStudent.id, lessons);
    const text = generateParentMessageText(
      selectedStudent,
      unpaid,
      tmpl,
      settings,
      customBlockCount
    );
    setGeneratedText(text);
  }, [selectedStudentId, selectedTemplateId, customBlockCount, lessons, settings]);

  if (!isOpen || !selectedStudent) return null;

  const unpaidLessons = getUnpaidLessonsForStudent(selectedStudent.id, lessons);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMessenger = (messenger: 'telegram' | 'viber' | 'whatsapp' | 'phone') => {
    openMessengerShare(generatedText, messenger);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161129] border border-purple-800/50 rounded-3xl max-w-xl w-full p-6 sm:p-7 text-purple-100 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-white p-1.5 rounded-xl hover:bg-purple-900/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Генератор Повідомлень для Батьків</h2>
            <p className="text-xs text-purple-300/70">Формування тексту розрахунку в 1 клік</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Select Student */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Виберіть учня
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#161129] text-white">
                    {s.name} ({s.parentName || 'Батьки'}) — {s.paymentType === 'postpaid' ? 'По факту' : 'Предоплата'} ({s.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Шаблон повідомлення
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
              >
                {settings.templates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#161129] text-white">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unpaid Stats Summary Bar */}
          <div className="p-3.5 bg-[#221b44] border border-purple-800/40 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-purple-300/70">Батьки: </span>
              <span className="font-semibold text-white">{selectedStudent.parentName || 'Не вказано'}</span>
              <span className="mx-2 text-purple-800">|</span>
              <span className="text-purple-300/70">Тип: </span>
              <span className="font-semibold text-purple-300">
                {selectedStudent.paymentType === 'postpaid' ? 'Оплата по факту' : 'Предоплата'}
              </span>
            </div>

            {selectedStudent.paymentType === 'postpaid' ? (
              <div className="text-rose-300 font-bold bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800/50">
                Неоплачено занять: {unpaidLessons.length}
              </div>
            ) : (
              <div className="text-purple-200 font-bold bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/50">
                Залишок: {selectedStudent.prepaidLessonsLeft} занять
              </div>
            )}
          </div>

          {selectedStudent.paymentType === 'prepaid' && (
            <div className="flex items-center gap-2 text-xs text-purple-200 font-medium">
              <span>Скільки занять пропонувати для поповнення:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={customBlockCount}
                onChange={(e) => setCustomBlockCount(Number(e.target.value))}
                className="w-16 bg-[#221b44] border border-purple-800/60 rounded-xl px-2 py-1 text-center text-white font-bold"
              />
              <span>занять ({selectedStudent.pricePerLesson * customBlockCount} {selectedStudent.currency})</span>
            </div>
          )}

          {/* Generated Editable Message Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                Згенерований текст (можна відредагувати перед відправкою)
              </label>
              <button
                type="button"
                onClick={() => {
                  const tmpl = settings.templates.find((t) => t.id === selectedTemplateId);
                  if (tmpl) {
                    setGeneratedText(
                      generateParentMessageText(
                        selectedStudent,
                        unpaidLessons,
                        tmpl,
                        settings,
                        customBlockCount
                      )
                    );
                  }
                }}
                className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Скинути
              </button>
            </div>

            <textarea
              rows={6}
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              className="w-full bg-[#221b44] border border-purple-800/60 rounded-2xl p-4 text-sm text-purple-100 font-sans focus:outline-none focus:border-purple-500 shadow-xs"
            />
          </div>

          {/* Quick Actions & Messenger Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Скопійовано у буфер!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Скопіювати текст
                  </>
                )}
              </button>
            </div>

            {/* Direct Send to Messengers */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSendMessenger('telegram')}
                className="py-2 px-3 rounded-xl bg-sky-950/80 hover:bg-sky-900/80 text-sky-300 border border-sky-800/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                Telegram
              </button>

              <button
                type="button"
                onClick={() => handleSendMessenger('viber')}
                className="py-2 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                Viber
              </button>

              <button
                type="button"
                onClick={() => handleSendMessenger('whatsapp')}
                className="py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
