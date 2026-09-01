export type Currency = 'UAH' | 'CZK' | 'EUR' | 'USD';

export type PaymentType = 'postpaid' | 'prepaid'; // 'postpaid' = по факту, 'prepaid' = предоплата

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Student {
  id: string;
  name: string; // Ім'я дитини (напр. Артем, Софія)
  parentName: string; // Ім'я та по батькові/контакт батьків (напр. Олена)
  phone: string; // Номер телефону або тег у соцмережі
  messenger: 'telegram' | 'viber' | 'whatsapp' | 'phone';
  currency: Currency; // UAH (₴), CZK (Kč), EUR (€), USD ($)
  paymentType: PaymentType;
  pricePerLesson: number; // Ціна за одне заняття в зазначеній валюті
  prepaidLessonsLeft: number; // Кількість залишкових оплачених занять (для предоплати)
  notes: string; // Коментарі, розклад, правила або особливості (напр., "Програми 6 класу, скасування за 2г")
  bankDetailsOverride?: string; // Картка або IBAN, якщо відрізняється від стандартного
  grade?: string; // Клас/рівень (напр., "6 клас", "7 клас")
  active: boolean;
  createdAt: string;
}

export interface Lesson {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number; // Тривалість у хвилинах (напр., 60)
  status: LessonStatus;
  topic?: string; // Тема заняття
  comment?: string; // Нотатка про успіхи/дз
  isPaid: boolean; // Оплачено чи ні (для оплати по факту)
  paidAt?: string;
  priceAtTime: number; // Фіксована ціна на момент створення
  rescheduledToDate?: string;
}

export interface ProgressNote {
  id: string;
  studentId: string;
  date: string;
  summary: string;
  topicsCovered: string[];
  strengths: string;
  areasToImprove: string;
  aiGenerated?: boolean;
}

export interface MessageTemplate {
  id: string;
  title: string;
  type: 'postpaid' | 'prepaid' | 'progress' | 'custom';
  language: 'ua' | 'cz_eu';
  content: string;
}

export interface UserSettings {
  tutorName: string;
  uaCard: string;
  foreignIban: string;
  defaultLessonDuration: number;
  templates: MessageTemplate[];
}

export interface AppState {
  students: Student[];
  lessons: Lesson[];
  progressNotes: ProgressNote[];
  settings: UserSettings;
}
