import { Currency, Lesson, MessageTemplate, Student, UserSettings } from '../types';

export function formatCurrency(amount: number, currency: Currency): string {
  switch (currency) {
    case 'UAH':
      return `${amount} грн`;
    case 'CZK':
      return `${amount} Kč`;
    case 'EUR':
      return `${amount} €`;
    case 'USD':
      return `$${amount}`;
    default:
      return `${amount} ${currency}`;
  }
}

export function formatDateUA(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

export function formatFullDateUA(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const months = [
    'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
    'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
  ];
  
  const days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'];
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

export function getTodayStr(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUnpaidLessonsForStudent(studentId: string, lessons: Lesson[]): Lesson[] {
  return lessons.filter(
    (l) => l.studentId === studentId && l.status === 'completed' && !l.isPaid
  ).sort((a, b) => a.date.localeCompare(b.date));
}

export function generateParentMessageText(
  student: Student,
  unpaidLessons: Lesson[],
  template: MessageTemplate,
  settings: UserSettings,
  customBlockCount: number = 4
): string {
  const parent = student.parentName || 'батьки';
  const child = student.name || 'дитина';
  const currencyStr = student.currency === 'UAH' ? 'грн' : student.currency === 'CZK' ? 'Kč' : student.currency === 'EUR' ? '€' : student.currency;
  
  const datesList = unpaidLessons.map((l) => formatDateUA(l.date)).join(' та ');
  const totalAmount = unpaidLessons.reduce((sum, l) => sum + (l.priceAtTime || student.pricePerLesson), 0);
  const card = student.bankDetailsOverride || settings.uaCard;
  const iban = student.bankDetailsOverride || settings.foreignIban;
  
  const blockAmount = student.pricePerLesson * customBlockCount;

  let text = template.content;
  text = text.replace(/\{parent\}/g, parent);
  text = text.replace(/\{child\}/g, child);
  text = text.replace(/\{dates\}/g, datesList || 'незавершених занять');
  text = text.replace(/\{amount\}/g, String(totalAmount));
  text = text.replace(/\{amount_block\}/g, String(blockAmount));
  text = text.replace(/\{currency\}/g, currencyStr);
  text = text.replace(/\{card\}/g, card);
  text = text.replace(/\{iban\}/g, iban);
  text = text.replace(/\{lessons_left\}/g, String(student.prepaidLessonsLeft));

  return text;
}

export function openMessengerShare(text: string, messenger: 'telegram' | 'viber' | 'whatsapp' | 'phone') {
  const encodedText = encodeURIComponent(text);
  if (messenger === 'telegram') {
    window.open(`https://t.me/share/url?url=&text=${encodedText}`, '_blank');
  } else if (messenger === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  } else if (messenger === 'viber') {
    window.open(`viber://forward?text=${encodedText}`, '_blank');
  } else {
    navigator.clipboard.writeText(text);
    alert('Текст скопійовано! Вставте його у месенджер.');
  }
}
