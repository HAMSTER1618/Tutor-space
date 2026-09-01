import React, { useState, useEffect } from 'react';
import { X, User, Phone, Wallet, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';
import { Student, Currency, PaymentType } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Partial<Student>) => void;
  initialStudent?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStudent,
}) => {
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [messenger, setMessenger] = useState<'telegram' | 'viber' | 'whatsapp' | 'phone'>('telegram');
  const [currency, setCurrency] = useState<Currency>('UAH');
  const [paymentType, setPaymentType] = useState<PaymentType>('postpaid');
  const [pricePerLesson, setPricePerLesson] = useState<number>(250);
  const [prepaidLessonsLeft, setPrepaidLessonsLeft] = useState<number>(0);
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const [bankDetailsOverride, setBankDetailsOverride] = useState('');

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name || '');
      setParentName(initialStudent.parentName || '');
      setPhone(initialStudent.phone || '');
      setMessenger(initialStudent.messenger || 'telegram');
      setCurrency(initialStudent.currency || 'UAH');
      setPaymentType(initialStudent.paymentType || 'postpaid');
      setPricePerLesson(initialStudent.pricePerLesson || 250);
      setPrepaidLessonsLeft(initialStudent.prepaidLessonsLeft || 0);
      setGrade(initialStudent.grade || '');
      setNotes(initialStudent.notes || '');
      setBankDetailsOverride(initialStudent.bankDetailsOverride || '');
    } else {
      setName('');
      setParentName('');
      setPhone('');
      setMessenger('telegram');
      setCurrency('UAH');
      setPaymentType('postpaid');
      setPricePerLesson(250);
      setPrepaidLessonsLeft(0);
      setGrade('');
      setNotes('');
      setBankDetailsOverride('');
    }
  }, [initialStudent, isOpen]);

  // Adjust currency defaults when user picks currency
  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    if (newCurrency === 'UAH' && pricePerLesson === 300) setPricePerLesson(250);
    if (newCurrency === 'CZK') setPricePerLesson(300);
    if (newCurrency === 'EUR') setPricePerLesson(15);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialStudent?.id,
      name: name.trim(),
      parentName: parentName.trim(),
      phone: phone.trim(),
      messenger,
      currency,
      paymentType,
      pricePerLesson: Number(pricePerLesson) || 0,
      prepaidLessonsLeft: paymentType === 'prepaid' ? Number(prepaidLessonsLeft) || 0 : 0,
      grade: grade.trim(),
      notes: notes.trim(),
      bankDetailsOverride: bankDetailsOverride.trim() || undefined,
      active: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161129] border border-purple-800/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 text-purple-100 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-white p-1.5 rounded-xl hover:bg-purple-900/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {initialStudent ? 'Редагувати учня' : 'Додати нового учня'}
            </h2>
            <p className="text-xs text-purple-300/70">
              Заповніть контактні дані, правила оплати та примітки
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Name & Parent Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Ім’я дитини *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Максим, Софія"
                className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Батьки (Ім’я)
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="напр. Олена Петрівна"
                className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Grade & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Клас / Програма
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="напр. 6 клас, Чехія (Cermat)"
                  className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl pl-9 pr-3.5 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Телефон / Контакт
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+380... або @telegram"
                  className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl pl-9 pr-3.5 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Messenger Picker */}
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Основний Месенджер для зв’язку
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'telegram', label: 'Telegram' },
                { id: 'viber', label: 'Viber' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'phone', label: 'SMS/Дзвінок' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMessenger(m.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    messenger === m.id
                      ? 'bg-purple-600 border-purple-500 text-white shadow-xs'
                      : 'bg-[#221b44] border-purple-800/40 text-purple-300 hover:bg-[#2c2254]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency & Payment Type */}
          <div className="p-4 bg-[#221b44] border border-purple-800/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
              <Wallet className="w-4 h-4 text-purple-400" />
              Налаштування Оплати
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-purple-300 mb-1">
                  Валюта
                </label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                  className="w-full bg-[#161129] border border-purple-800/60 rounded-xl px-3 py-2 text-purple-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="UAH" className="bg-[#161129] text-white">Україна (UAH ₴)</option>
                  <option value="CZK" className="bg-[#161129] text-white">Чехія (CZK Kč)</option>
                  <option value="EUR" className="bg-[#161129] text-white">Європа (EUR €)</option>
                  <option value="USD" className="bg-[#161129] text-white">Долар (USD $)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-300 mb-1">
                  Ціна за 1 заняття
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={pricePerLesson}
                  onChange={(e) => setPricePerLesson(Number(e.target.value))}
                  className="w-full bg-[#161129] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Payment Type Switch */}
            <div>
              <label className="block text-xs font-medium text-purple-300 mb-1">
                Модель оплати
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('postpaid')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    paymentType === 'postpaid'
                      ? 'bg-purple-900/60 border-purple-500 text-white'
                      : 'bg-[#161129] border-purple-800/40 text-purple-300 hover:bg-[#221b44]'
                  }`}
                >
                  <div className="font-bold">По факту</div>
                  <div className="text-[10px] text-purple-300/70">Оплата після проведення занять</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('prepaid')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    paymentType === 'prepaid'
                      ? 'bg-purple-900/60 border-purple-500 text-white'
                      : 'bg-[#161129] border-purple-800/40 text-purple-300 hover:bg-[#221b44]'
                  }`}
                >
                  <div className="font-bold">Предоплата</div>
                  <div className="text-[10px] text-purple-300/70">Оплата блоком заздалегідь</div>
                </button>
              </div>
            </div>

            {paymentType === 'prepaid' && (
              <div>
                <label className="block text-xs font-medium text-purple-300 mb-1">
                  Скільки вже оплачено занять наразі?
                </label>
                <input
                  type="number"
                  min="0"
                  value={prepaidLessonsLeft}
                  onChange={(e) => setPrepaidLessonsLeft(Number(e.target.value))}
                  className="w-full bg-[#161129] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* Notes & Custom Conditions */}
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Примітки / Особливі умови та правила
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="напр. Попереджати про відміну за 3 год, особливості програми, посібники..."
                className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl pl-9 pr-3.5 py-2 text-xs text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Custom Bank Details Override (optional) */}
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Окрема картка / IBAN для цього учня (необов’язково)
            </label>
            <input
              type="text"
              value={bankDetailsOverride}
              onChange={(e) => setBankDetailsOverride(e.target.value)}
              placeholder="Якщо відрізняється від основної у налаштуваннях"
              className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-purple-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#221b44] text-purple-300 hover:bg-[#2c2254] transition text-xs font-semibold"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-purple-600/30 transition text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
