import React, { useState, useMemo } from 'react';
import { DiaperLog } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarViewProps {
  logs: DiaperLog[];
  onCountChange: (date: Date, newCount: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, onCountChange }) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const logsByDay = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [logs]);

  const changeMonth = (amount: number) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // Set to the 1st to avoid month skipping issues
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };
  
  const handleDateSelect = (year: number, month: number) => {
      setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(year, month, 1);
        return newDate;
    });
  };

  const monthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  
  // Start calendar on Sunday of the week the month begins in
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const days = [];
  let currentDate = new Date(startDate);
  
  // Always render 6 weeks for a consistent grid height
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const monthNames = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => 
        new Date(2000, i, 1).toLocaleString('he-IL', { month: 'long' })
    ), []);
  
  const currentSelectedYear = displayDate.getFullYear();
  const years = useMemo(() => {
    const startYear = new Date().getFullYear() - 5;
    const yearList = Array.from({ length: 11 }, (_, i) => startYear + i);
    if (!yearList.includes(currentSelectedYear)) {
      yearList.push(currentSelectedYear);
      yearList.sort((a, b) => a - b);
    }
    return yearList;
  }, [currentSelectedYear]);

  return (
    <div className="bg-slate-50 p-4 rounded-b-xl border-t border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-200 transition-colors" aria-label="החודש הקודם"><ChevronLeftIcon /></button>
        
        <div className="flex items-center gap-2">
            <select
                value={displayDate.getMonth()}
                onChange={(e) => handleDateSelect(displayDate.getFullYear(), parseInt(e.target.value, 10))}
                className="font-semibold text-md text-slate-700 bg-slate-100 border-slate-300 border rounded-md py-1 px-2 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                aria-label="בחר חודש"
            >
                {monthNames.map((name, index) => (
                    <option key={name} value={index}>{name}</option>
                ))}
            </select>
            <select
                value={displayDate.getFullYear()}
                onChange={(e) => handleDateSelect(parseInt(e.target.value, 10), displayDate.getMonth())}
                className="font-semibold text-md text-slate-700 bg-slate-100 border-slate-300 border rounded-md py-1 px-2 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                aria-label="בחר שנה"
            >
                {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>

        <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-200 transition-colors" aria-label="החודש הבא"><ChevronRightIcon /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const count = logsByDay.get(dayKey) || 0;
          const isCurrentMonth = day.getMonth() === displayDate.getMonth();
          const isToday = day.getTime() === today.getTime();
          
          const cellClasses = [
            "relative flex flex-col items-center justify-center p-1 h-20 rounded-lg transition-colors",
            isCurrentMonth ? "bg-white" : "bg-slate-100 text-slate-400",
            isToday ? "ring-2 ring-teal-500" : ""
          ].join(" ");

          return (
            <div key={index} className={cellClasses}>
              <span className="absolute top-1.5 end-2.5 text-xs font-bold">{day.getDate()}</span>
              {isCurrentMonth && (
                 <input
                    type="number"
                    min="0"
                    value={count}
                    onChange={(e) => {
                      const newCount = parseInt(e.target.value, 10);
                      if (!isNaN(newCount) && newCount >= 0) {
                        onCountChange(day, newCount);
                      } else if (e.target.value === '') {
                        onCountChange(day, 0);
                      }
                    }}
                    className="w-16 p-1 text-center bg-transparent focus:bg-slate-100 rounded-md border-b-2 border-slate-200 focus:border-teal-500 focus:outline-none font-mono font-semibold text-lg text-blue-600 appearance-none m-0"
                    aria-label={`מספר חיתולים ל-${day.toLocaleDateString('he-IL')}`}
                    style={{ MozAppearance: 'textfield' }}
                  />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;