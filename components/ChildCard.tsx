
import React, { useState, useEffect, useMemo } from 'react';
import { Child, DiaperConsumptionEstimate } from '../types';
import { getDiaperRecommendation } from '../services/geminiService';
import { TrashIcon, CalendarIcon } from './icons';
import UsageChart from './UsageChart';

interface ChildCardProps {
  child: Child;
  onDeleteChild: (childId: string) => void;
  onOpenCalendar: (child: Child) => void;
}

const calculateAgeInMonths = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  return months <= 0 ? 0 : months;
};


const ChildCard: React.FC<ChildCardProps> = ({ child, onDeleteChild, onOpenCalendar }) => {
  const [estimate, setEstimate] = useState<DiaperConsumptionEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ageInMonths = useMemo(() => calculateAgeInMonths(child.dateOfBirth), [child.dateOfBirth]);

  useEffect(() => {
    const fetchEstimate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDiaperRecommendation(ageInMonths);
        setEstimate(data);
      } catch (err) {
        setError("לא ניתן היה לקבל המלצה כרגע.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimate();
  }, [ageInMonths]);

  const { monthlyActual, weeklyBreakdowns, monthName } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // 0 gives the last day of the previous month
    const monthName = now.toLocaleString('he-IL', { month: 'long' });

    const monthlyLogs = child.logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getFullYear() === now.getFullYear() && logDate.getMonth() === now.getMonth();
    });
    
    const monthlyActual = monthlyLogs.length;

    const weeklyBreakdowns: { label: string; count: number }[] = [];
    let currentDate = new Date(startOfMonth);

    while (currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear()) {
        const weekStart = new Date(currentDate);
        let weekEnd = new Date(currentDate);
        
        const dayOfWeek = weekEnd.getDay(); // Sunday is 0, Saturday is 6
        weekEnd.setDate(weekEnd.getDate() + (6 - dayOfWeek));
        
        if (weekEnd.getMonth() !== now.getMonth() || weekEnd.getFullYear() !== now.getFullYear()) {
            weekEnd = new Date(endOfMonth);
        }

        const weekStartTimestamp = new Date(weekStart).setHours(0, 0, 0, 0);
        const weekEndTimestamp = new Date(weekEnd).setHours(23, 59, 59, 999);
        
        const count = monthlyLogs.filter(
            log => log.timestamp >= weekStartTimestamp && log.timestamp <= weekEndTimestamp
        ).length;

        const label = `שבוע ${weekStart.getDate()}-${weekEnd.getDate()}`;
        
        weeklyBreakdowns.push({ label, count });

        currentDate = new Date(weekEnd);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { monthlyActual, weeklyBreakdowns, monthName };
  }, [child.logs]);

  const StatItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-baseline">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-700">{value}</dd>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{child.name}</h3>
            <p className="text-sm text-slate-500">{`בן ${ageInMonths} חודשים • ${child.diaperBrand}`}</p>
          </div>
          <button
            onClick={() => onDeleteChild(child.id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
            aria-label={`מחק את ${child.name}`}
          >
            <TrashIcon />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h4 className="font-semibold text-teal-600 mb-2">צריכה בפועל - חודש {monthName}</h4>
            <dl className="space-y-1">
              {weeklyBreakdowns.map((week, index) => (
                <StatItem key={index} label={week.label} value={week.count} />
              ))}
              <div className="border-t border-slate-100 my-2"></div>
              <StatItem label="סה״כ לחודש" value={monthlyActual} />
            </dl>
          </div>
          
          <div>
            <h4 className="font-semibold text-teal-600 mb-2">צריכה יומית (7 ימים אחרונים)</h4>
            <div className="h-40 relative">
              <UsageChart logs={child.logs} />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-teal-600 mb-2">צפי שימוש (לפי המלצת AI)</h4>
            {isLoading && <div className="text-sm text-slate-500">טוען המלצה...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {estimate && !isLoading && (
              <dl className="space-y-1">
                <StatItem label="צפי יומי" value={`~${estimate.daily}`} />
                <StatItem label="צפי שבועי" value={`~${estimate.weekly}`} />
                <StatItem label="צפי חודשי" value={`~${estimate.monthly}`} />
              </dl>
            )}
          </div>
        </div>
      </div>
      <div className="bg-slate-50 p-4 border-t border-slate-100">
        <button
          onClick={() => onOpenCalendar(child)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-all"
        >
          <CalendarIcon />
          עדכון צריכה יומית
        </button>
      </div>
    </div>
  );
};

export default ChildCard;
