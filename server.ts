import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initialMockState } from "./src/data/mockData";
import { AppState, Student, Lesson, ProgressNote, UserSettings } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// File persistence path
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "tutor_db.json");

function ensureDbExists(): AppState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialMockState, null, 2), "utf-8");
    return initialMockState;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading database file, resetting to default:", e);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialMockState, null, 2), "utf-8");
    return initialMockState;
  }
}

function saveDb(data: AppState) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// REST API Endpoints
app.get("/api/data", (req, res) => {
  const data = ensureDbExists();
  res.json(data);
});

app.post("/api/data", (req, res) => {
  const data: AppState = req.body;
  if (!data || !Array.isArray(data.students) || !Array.isArray(data.lessons)) {
    return res.status(400).json({ error: "Invalid data format" });
  }
  saveDb(data);
  res.json({ status: "success", message: "Дані збережено успішно!" });
});

app.post("/api/reset", (req, res) => {
  saveDb(initialMockState);
  res.json({ status: "success", data: initialMockState });
});

// Update student
app.put("/api/students/:id", (req, res) => {
  const db = ensureDbExists();
  const id = req.params.id;
  const index = db.students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }
  db.students[index] = { ...db.students[index], ...req.body };
  saveDb(db);
  res.json(db.students[index]);
});

// Quick action: Toggle lesson paid status
app.post("/api/lessons/:id/mark-paid", (req, res) => {
  const db = ensureDbExists();
  const id = req.params.id;
  const lesson = db.lessons.find((l) => l.id === id);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }
  lesson.isPaid = req.body.isPaid ?? true;
  lesson.paidAt = lesson.isPaid ? new Date().toISOString() : undefined;
  saveDb(db);
  res.json(lesson);
});

// Quick action: Mark all unpaid completed lessons for a student as paid
app.post("/api/students/:id/pay-outstanding", (req, res) => {
  const db = ensureDbExists();
  const studentId = req.params.id;
  const student = db.students.find((s) => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const nowIso = new Date().toISOString();
  let paidCount = 0;

  if (student.paymentType === "postpaid") {
    db.lessons.forEach((l) => {
      if (l.studentId === studentId && l.status === "completed" && !l.isPaid) {
        l.isPaid = true;
        l.paidAt = nowIso;
        paidCount++;
      }
    });
  } else if (student.paymentType === "prepaid") {
    // Add prepaid lessons count
    const addCount = Number(req.body.addLessons) || 4;
    student.prepaidLessonsLeft += addCount;
    paidCount = addCount;
  }

  saveDb(db);
  res.json({ status: "success", paidCount, student, lessons: db.lessons });
});

// AI Feature: Generate custom parent progress message using Gemini
app.post("/api/ai/generate-progress", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY не налаштовано в секретах. Можна ввести текст вручну.",
      });
    }

    const { studentName, parentName, grade, topics, strengths, areasToImprove, style } = req.body;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Ти ввічливий, досвідчений та привітний репетитор з математики.
Склади коротке, красиве та структуроване повідомлення для батьків дитини.

Інформація:
- Ім'я дитини: ${studentName || "учень"}
- Ім'я батьків: ${parentName || "шановні батьки"}
- Клас/рівень: ${grade || "школяр"}
- Пройдені теми: ${topics || "математичні теми, рівняння, дроби"}
- Що виходить добре: ${strengths || "старанність, уважність"}
- Над чим треба попрацювати: ${areasToImprove || "уважність при обчисленнях, додаткова практика ДЗ"}
- Стиль: ${style || "дружній, професійний, ввічливий"}

Згенеруй українською мовою готову відповідь для відправки в месенджер (Telegram/Viber). Використовуй емодзі, чітке виділення, але не роби текст занадто довгим (максимум 2-3 короткі абзаци).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    res.status(500).json({ error: error.message || "Помилка при генерації AI тексту" });
  }
});

// Export Apps Script Code for Google Sheets integration
app.get("/api/export/apps-script", (req, res) => {
  const code = `/**
 * ====================================================================
 * МАТЕМАТИЧНИЙ ПОМІЧНИК РЕПЕТИТОРА — Google Apps Script Web App
 * ====================================================================
 * Інструкція зі створення у Google Таблицях:
 * 1. Створіть нову Google Таблицю з 2 аркушами: "Учні" та "Заняття".
 * 2. У "Учні" зробіть такі колонки (Рядок 1):
 *    ID | Ім'я | Батьки | Телефон | Месенджер | Валюта | Модель оплати | Ціна за заняття | Залишок предоплати | Примітки | Клас
 * 3. У "Заняття" зробіть такі колонки (Рядок 1):
 *    ID | ID Учня | Дата | Час | Тривалість | Статус | Тема | Коментар | Оплачено
 * 4. Натисніть Розширення -> Apps Script
 * 5. Вставте цей код у файл Code.gs
 * 6. Створіть файл Index.html та вставте відповідний HTML/JS код
 * 7. Натисніть "Розгорнути" -> "Нове розгортання" -> Тип: "Веб-додаток"
 *    - Доступ: "Усі" (Anyone)
 * ====================================================================
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Математичний Помічник Репетитора')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Повертає всі дані з Google Таблиці
function getAppData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var studentsSheet = ss.getSheetByName("Учні");
  var lessonsSheet = ss.getSheetByName("Заняття");
  
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet("Учні");
    studentsSheet.appendRow(["ID", "Ім'я", "Батьки", "Телефон", "Месенджер", "Валюта", "Модель оплати", "Ціна за заняття", "Залишок предоплати", "Примітки", "Клас"]);
  }
  if (!lessonsSheet) {
    lessonsSheet = ss.insertSheet("Заняття");
    lessonsSheet.appendRow(["ID", "ID Учня", "Дата", "Час", "Тривалість", "Статус", "Тема", "Коментар", "Оплачено"]);
  }

  var studentRows = studentsSheet.getDataRange().getValues();
  var students = [];
  for (var i = 1; i < studentRows.length; i++) {
    var r = studentRows[i];
    if (r[0]) {
      students.push({
        id: String(r[0]),
        name: String(r[1] || ''),
        parentName: String(r[2] || ''),
        phone: String(r[3] || ''),
        messenger: String(r[4] || 'telegram'),
        currency: String(r[5] || 'UAH'),
        paymentType: String(r[6] || 'postpaid'),
        pricePerLesson: Number(r[7] || 250),
        prepaidLessonsLeft: Number(r[8] || 0),
        notes: String(r[9] || ''),
        grade: String(r[10] || '')
      });
    }
  }

  var lessonRows = lessonsSheet.getDataRange().getValues();
  var lessons = [];
  for (var j = 1; j < lessonRows.length; j++) {
    var lr = lessonRows[j];
    if (lr[0]) {
      lessons.push({
        id: String(lr[0]),
        studentId: String(lr[1]),
        date: String(lr[2]),
        time: String(lr[3]),
        durationMinutes: Number(lr[4] || 60),
        status: String(lr[5] || 'scheduled'),
        topic: String(lr[6] || ''),
        comment: String(lr[7] || ''),
        isPaid: Boolean(lr[8])
      });
    }
  }

  return { students: students, lessons: lessons };
}

// Додати або оновити учня
function saveStudent(studentData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Учні");
  var rows = sheet.getDataRange().getValues();
  var foundRow = -1;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(studentData.id)) {
      foundRow = i + 1;
      break;
    }
  }

  var rowData = [
    studentData.id || "st-" + Date.now(),
    studentData.name,
    studentData.parentName || "",
    studentData.phone || "",
    studentData.messenger || "telegram",
    studentData.currency || "UAH",
    studentData.paymentType || "postpaid",
    studentData.pricePerLesson || 250,
    studentData.prepaidLessonsLeft || 0,
    studentData.notes || "",
    studentData.grade || ""
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: "success" };
}

// Додати новий урок
function saveLesson(lessonData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Заняття");
  
  var rowData = [
    lessonData.id || "les-" + Date.now(),
    lessonData.studentId,
    lessonData.date,
    lessonData.time || "15:00",
    lessonData.durationMinutes || 60,
    lessonData.status || "scheduled",
    lessonData.topic || "",
    lessonData.comment || "",
    lessonData.isPaid ? true : false
  ];

  sheet.appendRow(rowData);
  return { status: "success" };
}
`;
  res.type("text/plain").send(code);
});

async function startServer() {
  // Setup Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер Математичного Помічника запущено на http://0.0.0.0:${PORT}`);
  });
}

startServer();
