import { AppState, MessageTemplate } from '../types';

export const defaultTemplates: MessageTemplate[] = [
  {
    id: 'tmpl-postpaid-ua',
    title: 'По факту (Україна, UAH)',
    type: 'postpaid',
    language: 'ua',
    content: `Доброго дня, {parent}!
До сплати за заняття з математики для {child} ({dates}) = {amount} {currency}.
Картка: {card}
Як оплатите, повідомте, будь ласка, щоб я перевірила. Дякую!`,
  },
  {
    id: 'tmpl-postpaid-cz',
    title: 'По факту (Закордон / Чехія, CZK/EUR)',
    type: 'postpaid',
    language: 'cz_eu',
    content: `Доброго дня, {parent}!
До сплати за додаткові заняття з математики ({child}):
Дати: {dates}
Сума: {amount} {currency}
Реквізити для оплати: {iban}
Дякую, гарного дня!`,
  },
  {
    id: 'tmpl-prepaid-warning',
    title: 'Предоплата: Залишилось обмаль занять',
    type: 'prepaid',
    language: 'ua',
    content: `Доброго дня, {parent}!
Нагадую, що у {child} залишилося {lessons_left} оплачених занять з математики.
Для продовження занять наступний блок з 4 занять становить {amount_block} {currency}.
Реквізити: {card}
Дякую!`,
  },
  {
    id: 'tmpl-progress-summary',
    title: 'Звіт про прогрес дитини',
    type: 'progress',
    language: 'ua',
    content: `Доброго дня, {parent}!
Хочу поділитися прогресом {child} з математики за останні заняття:
{progress_text}
{child} дуже старається! Дякую за співпрацю.`,
  },
];

export const initialMockState: AppState = {
  students: [
    {
      id: 'st-1',
      name: 'Максим',
      parentName: 'Олена Петрівна',
      phone: '+380971234567',
      messenger: 'viber',
      currency: 'UAH',
      paymentType: 'postpaid',
      pricePerLesson: 250,
      prepaidLessonsLeft: 0,
      notes: '6 клас, Звичайні дроби, рівняння. Скасування обов’язково за 3 години.',
      grade: '6 клас',
      active: true,
      createdAt: '2026-08-01T10:00:00Z',
    },
    {
      id: 'st-2',
      name: 'Софія',
      parentName: 'Тетяна (Прага)',
      phone: '+420771234567',
      messenger: 'telegram',
      currency: 'CZK',
      paymentType: 'prepaid',
      pricePerLesson: 300,
      prepaidLessonsLeft: 2,
      notes: 'Навчається у чеській школі. Працюємо за програмою 8 класу та готуємось до Cermat.',
      grade: '8 клас (Чехія)',
      active: true,
      createdAt: '2026-08-02T10:00:00Z',
    },
    {
      id: 'st-3',
      name: 'Богдан',
      parentName: 'Ірина Миколаївна',
      phone: '+380509876543',
      messenger: 'telegram',
      currency: 'UAH',
      paymentType: 'postpaid',
      pricePerLesson: 300,
      prepaidLessonsLeft: 0,
      notes: '9 клас, підготовка до НМТ / ДПА з геометрії.',
      grade: '9 клас',
      active: true,
      createdAt: '2026-08-03T10:00:00Z',
    },
    {
      id: 'st-4',
      name: 'Денис',
      parentName: 'Оксана (Німеччина)',
      phone: '+491512345678',
      messenger: 'whatsapp',
      currency: 'EUR',
      paymentType: 'prepaid',
      pricePerLesson: 15,
      prepaidLessonsLeft: 1,
      notes: '7 клас Gymnasium, теми німецькою та українською.',
      grade: '7 клас (EU)',
      active: true,
      createdAt: '2026-08-04T10:00:00Z',
    },
  ],
  lessons: [
    {
      id: 'les-101',
      studentId: 'st-1',
      date: '2026-08-08',
      time: '15:00',
      durationMinutes: 60,
      status: 'completed',
      topic: 'Множення та ділення звичайних дробів',
      comment: 'Максим чудово засвоїв скорочення дробів.',
      isPaid: false,
      priceAtTime: 250,
    },
    {
      id: 'les-102',
      studentId: 'st-1',
      date: '2026-08-10',
      time: '15:00',
      durationMinutes: 60,
      status: 'completed',
      topic: 'Десяткові дроби та відсотки',
      comment: 'Потрібно повторити перетворення у відсотки.',
      isPaid: false,
      priceAtTime: 250,
    },
    {
      id: 'les-103',
      studentId: 'st-2',
      date: '2026-08-09',
      time: '17:00',
      durationMinutes: 60,
      status: 'completed',
      topic: 'Розв’язування квадратних рівнянь (Cermat)',
      comment: 'Софія добре впоралася з графіками.',
      isPaid: true,
      priceAtTime: 300,
    },
    {
      id: 'les-104',
      studentId: 'st-3',
      date: '2026-08-10',
      time: '18:30',
      durationMinutes: 60,
      status: 'scheduled',
      topic: 'Теорема Піфагора та подібність трикутників',
      comment: '',
      isPaid: false,
      priceAtTime: 300,
    },
    {
      id: 'les-105',
      studentId: 'st-2',
      date: '2026-08-12',
      time: '17:00',
      durationMinutes: 60,
      status: 'scheduled',
      topic: 'Геометричні задачі',
      comment: '',
      isPaid: true,
      priceAtTime: 300,
    },
    {
      id: 'les-106',
      studentId: 'st-4',
      date: '2026-08-11',
      time: '16:00',
      durationMinutes: 60,
      status: 'scheduled',
      topic: 'Lineare Gleichungen (Лінійні рівняння)',
      comment: '',
      isPaid: true,
      priceAtTime: 15,
    },
  ],
  progressNotes: [
    {
      id: 'pn-1',
      studentId: 'st-1',
      date: '2026-08-10',
      summary: 'Максим значно покращив обчислення з дробами.',
      topicsCovered: ['Звичайні дроби', 'Десяткові дроби'],
      strengths: 'Уважність у розв’язанні прикладів, швидкий рахунок.',
      areasToImprove: 'Задачі на відсотки потребують додаткового аналізу тексту.',
      aiGenerated: false,
    },
  ],
  settings: {
    tutorName: 'Анна (Репетитор з математики)',
    uaCard: '4149 4999 8888 7777 (Monobank / Приват)',
    foreignIban: 'CZ89 0800 0000 0012 3456 7890 (Revolut / AirBank)',
    defaultLessonDuration: 60,
    templates: defaultTemplates,
  },
};
