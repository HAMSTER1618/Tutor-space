import React, { useState } from 'react';
import {
  Settings,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Code,
  Copy,
  Check,
  RotateCcw,
  Save,
  Download,
  Terminal,
  Server,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { UserSettings, AppState } from '../types';

interface SettingsAndExportViewProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onResetData: () => void;
  fullData: AppState;
}

export const SettingsAndExportView: React.FC<SettingsAndExportViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  fullData,
}) => {
  const [tutorName, setTutorName] = useState(settings.tutorName || '');
  const [uaCard, setUaCard] = useState(settings.uaCard || '');
  const [foreignIban, setForeignIban] = useState(settings.foreignIban || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'gs' | 'html' | 'prompt'>('gs');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      tutorName: tutorName.trim(),
      uaCard: uaCard.trim(),
      foreignIban: foreignIban.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadCsv = () => {
    let csv = 'Імʼя дитини,Батьки,Телефон,Модель Оплати,Валюта,Ціна за заняття,Залишок предоплати\n';
    fullData.students.forEach((s) => {
      csv += `"${s.name}","${s.parentName}","${s.phone}","${s.paymentType}","${s.currency}",${s.pricePerLesson},${s.prepaidLessonsLeft}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MathTutor_Students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const codeGsSnippet = `/**
 * МАТЕМАТИЧНИЙ ПОМІЧНИК — Google Apps Script (Code.gs)
 * База даних: Google Таблиця з аркушами "Учні" та "Заняття"
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Математичний Помічник Репетитора')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getAppData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var studentsSheet = ss.getSheetByName("Учні") || ss.insertSheet("Учні");
  var lessonsSheet = ss.getSheetByName("Заняття") || ss.insertSheet("Заняття");

  var sRows = studentsSheet.getDataRange().getValues();
  var students = [];
  for (var i = 1; i < sRows.length; i++) {
    if (sRows[i][0]) {
      students.push({
        id: String(sRows[i][0]),
        name: String(sRows[i][1] || ''),
        parentName: String(sRows[i][2] || ''),
        phone: String(sRows[i][3] || ''),
        messenger: String(sRows[i][4] || 'telegram'),
        currency: String(sRows[i][5] || 'UAH'),
        paymentType: String(sRows[i][6] || 'postpaid'),
        pricePerLesson: Number(sRows[i][7] || 250),
        prepaidLessonsLeft: Number(sRows[i][8] || 0),
        notes: String(sRows[i][9] || ''),
        grade: String(sRows[i][10] || '')
      });
    }
  }

  var lRows = lessonsSheet.getDataRange().getValues();
  var lessons = [];
  for (var j = 1; j < lRows.length; j++) {
    if (lRows[j][0]) {
      lessons.push({
        id: String(lRows[j][0]),
        studentId: String(lRows[j][1]),
        date: String(lRows[j][2]),
        time: String(lRows[j][3]),
        durationMinutes: Number(lRows[j][4] || 60),
        status: String(lRows[j][5] || 'scheduled'),
        topic: String(lRows[j][6] || ''),
        comment: String(lRows[j][7] || ''),
        isPaid: Boolean(lRows[j][8])
      });
    }
  }

  return JSON.stringify({ students: students, lessons: lessons });
}

function saveStudent(student) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Учні");
  var rows = sheet.getDataRange().getValues();
  var found = -1;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(student.id)) { found = i + 1; break; }
  }
  var data = [student.id, student.name, student.parentName, student.phone, student.messenger, student.currency, student.paymentType, student.pricePerLesson, student.prepaidLessonsLeft, student.notes, student.grade];
  if (found > 0) { sheet.getRange(found, 1, 1, data.length).setValues([data]); }
  else { sheet.appendRow(data); }
  return "OK";
}`;

  const codeHtmlSnippet = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Математичний Помічник</title>
</head>
<body class="bg-[#0d091a] text-purple-100 p-6 font-sans">
  <div className="max-w-4xl mx-auto space-y-6">
    <div class="bg-[#161129] border border-purple-800/50 p-6 rounded-3xl shadow-xl flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">🧮 Математичний Помічник (GAS)</h1>
        <p class="text-xs text-purple-300">Google Apps Script + Google Таблиці в якості БД</p>
      </div>
      <button onclick="loadData()" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition">
        🔄 Оновити дані
      </button>
    </div>

    <div id="content" class="bg-[#161129] border border-purple-800/50 p-6 rounded-3xl min-h-[300px]">
      <div class="text-center text-purple-300 py-12">Завантаження даних з Google Таблиць...</div>
    </div>
  </div>

  <script>
    function loadData() {
      google.script.run.withSuccessHandler(render).getAppData();
    }
    function render(jsonStr) {
      const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      let html = '<h2 class="text-lg font-bold text-white mb-4">Список Учнів (' + data.students.length + ')</h2>';
      html += '<div class="grid gap-3 sm:grid-cols-2">';
      data.students.forEach(s => {
        html += '<div class="p-4 bg-[#221b44] rounded-2xl border border-purple-800/40">';
        html += '<div class="font-bold text-white text-base">' + s.name + '</div>';
        html += '<div class="text-xs text-purple-300">Батьки: ' + (s.parentName || 'Не вказано') + ' | ' + s.pricePerLesson + ' ' + s.currency + '</div>';
        html += '</div>';
      });
      html += '</div>';
      document.getElementById('content').innerHTML = html;
    }
    window.onload = loadData;
  </script>
</body>
</html>`;

  const systemPromptSnippet = `Ти — експерт з розробки веб-додатків на Google Apps Script (GAS) з Google Таблицями в якості бази даних.
Створи готовий до використання Web App додаток для репетитора з математики з двома файлами (Code.gs та Index.html):

Вимоги:
1. БД на Google Таблицях з аркушами: "Учні" та "Заняття".
2. Функціонал:
   - Облік учнів, модель оплати (по факту / предоплата).
   - Розклад занять з відмітками (проведено, скасовано, перенесено).
   - Генерація тексту повідомлення для батьків з реквізитами та сумою у 1 клік.
   - Красивий сучасний темний дизайн з Tailwind CSS.
3. Додай зрозумілі інструкції для розгортання в Google Workspace (Apps Script Web App -> Deploy).`;

  const copyToClipboard = (text: string, type: 'gs' | 'html' | 'prompt') => {
    navigator.clipboard.writeText(text);
    if (type === 'gs') {
      setCopiedGs(true);
      setTimeout(() => setCopiedGs(false), 2000);
    } else if (type === 'html') {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#161129] border border-purple-800/40 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <Settings className="w-4 h-4" />
          Налаштування & Google Apps Script
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Реквізити, Сервер та Автономний Код для Google Apps Script
        </h2>
        <p className="text-xs text-purple-300/70 mt-1">
          Налаштуйте картки, збережіть дані в CSV або скопіюйте готовий код для запуску у власних Google Таблицях
        </p>
      </div>

      {/* Hosting & Server Clarification Info */}
      <div className="p-5 bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-700/50 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-purple-200 font-bold text-sm">
          <Server className="w-4 h-4 text-purple-400" />
          💡 Де розгортати додаток і чому GitHub та платні сервери НЕ потрібні:
        </div>
        <div className="text-xs text-purple-300/90 leading-relaxed space-y-1.5">
          <p>
            1. <strong>Цей веб-додаток в AI Studio вже розгорнуто в хмарі Google Cloud Run!</strong> Вам не потрібен увімкнений комп'ютер чи GitHub. Посилання у браузері буде працювати завжди.
          </p>
          <p>
            2. <strong>Google Apps Script (GAS):</strong> Якщо ви бажаєте зберігати все прямо всередині своїх Google Таблиць — скопіюйте код нижче у Google Apps Script (меню <em>Розширення -&gt; Apps Script</em>) і натисніть "Розгорнути як веб-додаток". Це абсолютно безкоштовно та працює без серверів!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Details & Profile Form */}
        <form onSubmit={handleSave} className="bg-[#161129] border border-purple-800/40 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-base border-b border-purple-800/40 pb-3">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Ваші Реквізити та Профіль Репетитора
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Ваше Ім'я / Підпис у повідомленнях
            </label>
            <input
              type="text"
              value={tutorName}
              onChange={(e) => setTutorName(e.target.value)}
              placeholder="напр. Анна (Репетитор з математики)"
              className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              Українська Картка (для банку Monobank / Приват)
            </label>
            <input
              type="text"
              value={uaCard}
              onChange={(e) => setUaCard(e.target.value)}
              placeholder="4149 0000 0000 0000 (Monobank)"
              className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              Закордонний IBAN / Рахунок (для CZK, EUR, Revolut)
            </label>
            <input
              type="text"
              value={foreignIban}
              onChange={(e) => setForeignIban(e.target.value)}
              placeholder="CZ89 0800 0000 0012 3456 7890 (Revolut)"
              className="w-full bg-[#221b44] border border-purple-800/50 rounded-xl px-3.5 py-2 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
              }`}
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {savedSuccess ? 'Збережено успішно!' : 'Зберегти налаштування'}
            </button>
          </div>
        </form>

        {/* Export Data CSV */}
        <div className="bg-[#161129] border border-purple-800/40 rounded-3xl p-6 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-purple-800/40 pb-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Експорт даних учнів у CSV / Google Sheets
            </div>

            <p className="text-xs text-purple-300/70 leading-relaxed">
              Ви можете завантажити повний список учнів у форматі CSV для імпорту в Google Таблиці чи Excel у 1 клік.
            </p>

            <div className="p-3.5 bg-[#221b44] border border-purple-800/40 rounded-2xl space-y-1.5 text-xs text-purple-200">
              <div className="font-semibold text-white">Статистика в базі:</div>
              <div>• Кількість учнів: <strong className="text-purple-300">{fullData.students.length}</strong></div>
              <div>• Заплановано занять: <strong className="text-purple-300">{fullData.lessons.length}</strong></div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadCsv}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 border border-emerald-800/50 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Завантажити список учнів (.CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Google Apps Script Code Bundle */}
      <div className="bg-[#161129] border border-purple-800/40 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/40 pb-4">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
            <Code className="w-5 h-5 text-purple-400" />
            Готовий Код для Google Apps Script (Копіювати в 1 клік)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('gs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCodeTab === 'gs'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[#221b44] text-purple-300 hover:text-white'
              }`}
            >
              Code.gs
            </button>
            <button
              onClick={() => setActiveCodeTab('html')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCodeTab === 'html'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[#221b44] text-purple-300 hover:text-white'
              }`}
            >
              Index.html
            </button>
            <button
              onClick={() => setActiveCodeTab('prompt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCodeTab === 'prompt'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[#221b44] text-purple-300 hover:text-white'
              }`}
            >
              ✨ Системний Промпт
            </button>
          </div>
        </div>

        {activeCodeTab === 'gs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span>Скопіюйте цей код у файл <strong>Code.gs</strong> у Google Apps Script:</span>
              <button
                onClick={() => copyToClipboard(codeGsSnippet, 'gs')}
                className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 rounded-xl flex items-center gap-1.5 font-semibold transition"
              >
                {copiedGs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedGs ? 'Скопійовано!' : 'Копіювати Code.gs'}
              </button>
            </div>
            <pre className="bg-[#0f0b1d] border border-purple-900/60 p-4 rounded-2xl text-xs text-purple-200 font-mono overflow-x-auto max-h-72 leading-relaxed selection:bg-purple-600 selection:text-white">
              {codeGsSnippet}
            </pre>
          </div>
        )}

        {activeCodeTab === 'html' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span>Скопіюйте цей код у файл <strong>Index.html</strong> у Google Apps Script:</span>
              <button
                onClick={() => copyToClipboard(codeHtmlSnippet, 'html')}
                className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 rounded-xl flex items-center gap-1.5 font-semibold transition"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedHtml ? 'Скопійовано!' : 'Копіювати Index.html'}
              </button>
            </div>
            <pre className="bg-[#0f0b1d] border border-purple-900/60 p-4 rounded-2xl text-xs text-purple-200 font-mono overflow-x-auto max-h-72 leading-relaxed selection:bg-purple-600 selection:text-white">
              {codeHtmlSnippet}
            </pre>
          </div>
        )}

        {activeCodeTab === 'prompt' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span>Системний промпт для розробки додатків у Google Apps Script:</span>
              <button
                onClick={() => copyToClipboard(systemPromptSnippet, 'prompt')}
                className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 rounded-xl flex items-center gap-1.5 font-semibold transition"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPrompt ? 'Скопійовано!' : 'Копіювати промпт'}
              </button>
            </div>
            <pre className="bg-[#0f0b1d] border border-purple-900/60 p-4 rounded-2xl text-xs text-purple-200 font-mono overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap selection:bg-purple-600 selection:text-white">
              {systemPromptSnippet}
            </pre>
          </div>
        )}
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-[#161129] border border-rose-900/50 rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-300">Скинути всі дані до початкових</h3>
          <p className="text-xs text-purple-300/60 mt-0.5">
            Відновить стандартний демо-список учнів та занять
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Ви впевнені, що хочете скинути всі дані?')) {
              onResetData();
            }
          }}
          className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          Скинути базу
        </button>
      </div>
    </div>
  );
};

