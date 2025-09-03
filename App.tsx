import React, { useState, useEffect, useCallback } from 'react';
import { Child, DiaperLog } from './types';
import { LOCAL_STORAGE_KEY } from './constants';
import Header from './components/Header';
import ChildCard from './components/ChildCard';
import Modal from './components/Modal';
import ChildForm from './components/ChildForm';
import { PlusIcon } from './components/icons';
import CalendarView from './components/CalendarView';
import UsageSummary from './components/UsageSummary';

const App: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarChildId, setCalendarChildId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedChildren = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedChildren) {
        setChildren(JSON.parse(storedChildren));
      }
    } catch (error) {
      console.error("Failed to load children from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(children));
    } catch (error) {
      console.error("Failed to save children to local storage", error);
    }
  }, [children]);

  const handleAddChild = useCallback((child: Omit<Child, 'id' | 'logs'>) => {
    const newChild: Child = {
      ...child,
      id: crypto.randomUUID(),
      logs: [],
    };
    setChildren(prev => [...prev, newChild]);
    setIsModalOpen(false);
  }, []);

  const handleDeleteChild = useCallback((childId: string) => {
    setChildren(prev => prev.filter(child => child.id !== childId));
  }, []);

  const handleSetDiaperCountForDate = useCallback((childId: string, date: Date, newCount: number) => {
    setChildren(prev =>
      prev.map(child => {
        if (child.id !== childId) {
          return child;
        }

        // Normalize date to the start of the day to ensure consistent filtering
        const targetDayStart = new Date(date);
        targetDayStart.setHours(0, 0, 0, 0);
        const targetDayEnd = new Date(targetDayStart);
        targetDayEnd.setDate(targetDayEnd.getDate() + 1);

        const logsForTargetDay = child.logs.filter(log =>
            log.timestamp >= targetDayStart.getTime() && log.timestamp < targetDayEnd.getTime()
        );
        
        const otherLogs = child.logs.filter(log =>
            log.timestamp < targetDayStart.getTime() || log.timestamp >= targetDayEnd.getTime()
        );

        const currentCount = logsForTargetDay.length;
        if (newCount < 0) newCount = 0; // Ensure count is not negative
        const diff = newCount - currentCount;

        let updatedLogsForDay = [...logsForTargetDay];

        if (diff > 0) {
          // Add logs
          for (let i = 0; i < diff; i++) {
            // Add new logs at the start of the day for consistency, with minor offset
            const newLog: DiaperLog = {
              id: crypto.randomUUID(),
              timestamp: targetDayStart.getTime() + i,
            };
            updatedLogsForDay.push(newLog);
          }
        } else if (diff < 0) {
          // Remove logs from the end
          updatedLogsForDay.splice(newCount);
        }

        return {
          ...child,
          logs: [...otherLogs, ...updatedLogsForDay].sort((a,b) => a.timestamp - b.timestamp),
        };
      })
    );
  }, []);
  
  const handleOpenCalendar = useCallback((child: Child) => {
    setCalendarChildId(child.id);
  }, []);

  const handleCloseCalendar = () => {
    setCalendarChildId(null);
  };

  const childForCalendar = calendarChildId ? children.find(c => c.id === calendarChildId) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <UsageSummary children={children} />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-700">הילדים שלי</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors"
          >
            <PlusIcon />
            הוסף ילד
          </button>
        </div>

        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onDeleteChild={handleDeleteChild}
                onOpenCalendar={handleOpenCalendar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-slate-600">עדיין לא הוספת ילדים</h3>
            <p className="text-slate-500 mt-2">לחץ על "הוסף ילד" כדי להתחיל לעקוב אחר צריכת החיתולים.</p>
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ChildForm onAddChild={handleAddChild} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {childForCalendar && (
         <Modal isOpen={!!childForCalendar} onClose={handleCloseCalendar} size="lg">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">
              היסטוריית החלפות: {childForCalendar.name}
            </h2>
            <CalendarView
              logs={childForCalendar.logs}
              onCountChange={(date, count) =>
                handleSetDiaperCountForDate(childForCalendar.id, date, count)
              }
            />
        </Modal>
      )}
    </div>
  );
};

export default App;
