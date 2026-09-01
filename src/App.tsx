import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TodayScheduleView } from './components/TodayScheduleView';
import { StudentsListView } from './components/StudentsListView';
import { MessageGeneratorModal } from './components/MessageGeneratorModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AddLessonModal } from './components/AddLessonModal';
import { ProgressReportView } from './components/ProgressReportView';
import { SettingsAndExportView } from './components/SettingsAndExportView';
import { AppState, Student, Lesson, LessonStatus, ProgressNote, UserSettings } from './types';
import { initialMockState } from './data/mockData';
import { getTodayStr, getUnpaidLessonsForStudent } from './utils/formatters';

export default function App() {
  const [appState, setAppState] = useState<AppState>(initialMockState);
  const [activeTab, setActiveTab] = useState<'schedule' | 'students' | 'progress' | 'settings'>('schedule');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isAddLessonOpen, setIsAddLessonOpen] = useState<boolean>(false);
  const [addLessonStudentId, setAddLessonStudentId] = useState<string | undefined>(undefined);
  const [addLessonDate, setAddLessonDate] = useState<string | undefined>(undefined);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false);
  const [messageStudentId, setMessageStudentId] = useState<string | null>(null);

  // Load state on mount from API or LocalStorage
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setAppState(data);
      } else {
        const saved = localStorage.getItem('math_tutor_app_state');
        if (saved) setAppState(JSON.parse(saved));
      }
    } catch (e) {
      const saved = localStorage.getItem('math_tutor_app_state');
      if (saved) setAppState(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save State helper
  const saveStateToBackend = async (newState: AppState) => {
    setAppState(newState);
    setIsSaving(true);
    localStorage.setItem('math_tutor_app_state', JSON.stringify(newState));

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
    } catch (e) {
      console.warn('Backend sync error, saved locally:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Student Handlers
  const handleSaveStudent = (studentData: Partial<Student>) => {
    if (studentData.id) {
      // Edit
      const updatedStudents = appState.students.map((s) =>
        s.id === studentData.id ? ({ ...s, ...studentData } as Student) : s
      );
      saveStateToBackend({ ...appState, students: updatedStudents });
    } else {
      // Create
      const newStudent: Student = {
        id: `st-${Date.now()}`,
        name: studentData.name || 'Новий учень',
        parentName: studentData.parentName || '',
        phone: studentData.phone || '',
        messenger: studentData.messenger || 'telegram',
        currency: studentData.currency || 'UAH',
        paymentType: studentData.paymentType || 'postpaid',
        pricePerLesson: studentData.pricePerLesson || 250,
        prepaidLessonsLeft: studentData.prepaidLessonsLeft || 0,
        notes: studentData.notes || '',
        grade: studentData.grade || '',
        bankDetailsOverride: studentData.bankDetailsOverride,
        active: true,
        createdAt: new Date().toISOString(),
      };
      saveStateToBackend({ ...appState, students: [...appState.students, newStudent] });
    }
    setEditingStudent(null);
  };

  // Lesson Handlers
  const handleSaveLessons = (newLessonsData: Partial<Lesson>[]) => {
    const createdLessons: Lesson[] = newLessonsData.map((ld, idx) => ({
      id: `les-${Date.now()}-${idx}`,
      studentId: ld.studentId!,
      date: ld.date!,
      time: ld.time || '15:00',
      durationMinutes: ld.durationMinutes || 60,
      status: (ld.status as LessonStatus) || 'scheduled',
      topic: ld.topic,
      comment: ld.comment,
      isPaid: ld.isPaid || false,
      priceAtTime: ld.priceAtTime || 250,
    }));

    saveStateToBackend({
      ...appState,
      lessons: [...appState.lessons, ...createdLessons],
    });
  };

  const handleUpdateLessonStatus = (
    lessonId: string,
    newStatus: LessonStatus,
    comment?: string,
    topic?: string
  ) => {
    const updatedLessons = appState.lessons.map((l) => {
      if (l.id === lessonId) {
        return {
          ...l,
          status: newStatus,
          comment: comment !== undefined ? comment : l.comment,
          topic: topic !== undefined ? topic : l.topic,
        };
      }
      return l;
    });

    // Check if lesson was just marked completed for a prepaid student
    const lesson = appState.lessons.find((l) => l.id === lessonId);
    let updatedStudents = appState.students;

    if (lesson && newStatus === 'completed' && lesson.status !== 'completed') {
      const student = appState.students.find((s) => s.id === lesson.studentId);
      if (student && student.paymentType === 'prepaid') {
        updatedStudents = appState.students.map((s) => {
          if (s.id === student.id) {
            return {
              ...s,
              prepaidLessonsLeft: Math.max(0, s.prepaidLessonsLeft - 1),
            };
          }
          return s;
        });
      }
    }

    saveStateToBackend({
      ...appState,
      lessons: updatedLessons,
      students: updatedStudents,
    });
  };

  // Payment Clearing Handler
  const handlePayOutstanding = (studentId: string, addPrepaidLessons?: number) => {
    const student = appState.students.find((s) => s.id === studentId);
    if (!student) return;

    if (student.paymentType === 'postpaid') {
      const updatedLessons = appState.lessons.map((l) => {
        if (l.studentId === studentId && l.status === 'completed' && !l.isPaid) {
          return { ...l, isPaid: true, paidAt: new Date().toISOString() };
        }
        return l;
      });
      saveStateToBackend({ ...appState, lessons: updatedLessons });
    } else {
      const addCount = addPrepaidLessons || 4;
      const updatedStudents = appState.students.map((s) => {
        if (s.id === studentId) {
          return { ...s, prepaidLessonsLeft: s.prepaidLessonsLeft + addCount };
        }
        return s;
      });
      saveStateToBackend({ ...appState, students: updatedStudents });
    }
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    saveStateToBackend({ ...appState, settings: newSettings });
  };

  const handleResetData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAppState(data.data);
      } else {
        setAppState(initialMockState);
      }
    } catch (e) {
      setAppState(initialMockState);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Stats
  const todayStr = getTodayStr();
  const todayLessonsCount = appState.lessons.filter((l) => l.date === todayStr).length;

  const totalUnpaidCount = appState.students.reduce((acc, s) => {
    if (s.paymentType === 'postpaid') {
      const unpaid = getUnpaidLessonsForStudent(s.id, appState.lessons);
      return acc + (unpaid.length > 0 ? 1 : 0);
    }
    return acc;
  }, 0);

  const openAddStudentModal = (student?: Student) => {
    setEditingStudent(student || null);
    setIsAddStudentOpen(true);
  };

  const openAddLessonModal = (studentId?: string, date?: string) => {
    setAddLessonStudentId(studentId);
    setAddLessonDate(date);
    setIsAddLessonOpen(true);
  };

  const openMessageModal = (studentId: string) => {
    setMessageStudentId(studentId);
    setIsMessageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0d091a] text-purple-50 font-sans antialiased selection:bg-purple-500 selection:text-white pb-12">
      {/* Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unpaidCount={totalUnpaidCount}
        todayLessonsCount={todayLessonsCount}
        onRefresh={loadData}
        isSaving={isSaving}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-20 text-center text-purple-300/70 space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium">Завантаження даних занять...</p>
          </div>
        ) : (
          <>
            {activeTab === 'schedule' && (
              <TodayScheduleView
                lessons={appState.lessons}
                students={appState.students}
                onUpdateLessonStatus={handleUpdateLessonStatus}
                onOpenAddLesson={openAddLessonModal}
                onOpenMessageModal={openMessageModal}
              />
            )}

            {activeTab === 'students' && (
              <StudentsListView
                students={appState.students}
                lessons={appState.lessons}
                onOpenAddStudent={openAddStudentModal}
                onOpenAddLesson={openAddLessonModal}
                onOpenMessageModal={openMessageModal}
                onPayOutstanding={handlePayOutstanding}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressReportView
                students={appState.students}
                lessons={appState.lessons}
                progressNotes={appState.progressNotes}
                onSaveProgressNote={(note) => {
                  const newNote: ProgressNote = {
                    id: `pn-${Date.now()}`,
                    studentId: note.studentId!,
                    date: getTodayStr(),
                    summary: note.summary || '',
                    topicsCovered: note.topicsCovered || [],
                    strengths: note.strengths || '',
                    areasToImprove: note.areasToImprove || '',
                    aiGenerated: note.aiGenerated || false,
                  };
                  saveStateToBackend({
                    ...appState,
                    progressNotes: [...appState.progressNotes, newNote],
                  });
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsAndExportView
                settings={appState.settings}
                onSaveSettings={handleSaveSettings}
                onResetData={handleResetData}
                fullData={appState}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSave={handleSaveStudent}
        initialStudent={editingStudent}
      />

      <AddLessonModal
        isOpen={isAddLessonOpen}
        onClose={() => setIsAddLessonOpen(false)}
        onSave={handleSaveLessons}
        students={appState.students}
        initialStudentId={addLessonStudentId}
        initialDate={addLessonDate}
      />

      <MessageGeneratorModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        students={appState.students}
        lessons={appState.lessons}
        settings={appState.settings}
        preselectedStudentId={messageStudentId}
      />
    </div>
  );
}
