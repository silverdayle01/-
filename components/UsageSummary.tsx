import React, { useMemo } from 'react';
import { Child } from '../types';

interface UsageSummaryProps {
  children: Child[];
}

const UsageSummary: React.FC<UsageSummaryProps> = ({ children }) => {
  const stats = useMemo(() => {
    return children.map(child => {
      const now = new Date();
      
      // Monthly stats
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const monthlyTotal = child.logs.filter(log => {
        return log.timestamp >= startOfMonth.getTime() && log.timestamp <= endOfMonth.getTime();
      }).length;

      // Weekly stats
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday - 0, Saturday - 6
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      const weeklyTotal = child.logs.filter(log => {
        return log.timestamp >= startOfWeek.getTime() && log.timestamp <= endOfWeek.getTime();
      }).length;

      return {
        childId: child.id,
        childName: child.name,
        weeklyTotal,
        monthlyTotal,
      };
    });
  }, [children]);

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-slate-800 mb-4">סיכום שימוש כללי</h3>
      <div className="space-y-4">
        {stats.map(childStats => (
          <div key={childStats.childId} className="p-4 bg-slate-50 rounded-lg">
            <p className="font-semibold text-slate-700">{childStats.childName}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm">
              <div className="flex justify-between items-baseline bg-white p-3 rounded-md shadow-sm">
                <span className="text-slate-500">השבוע:</span>
                <span className="font-bold text-teal-600 text-lg">{childStats.weeklyTotal}</span>
              </div>
              <div className="flex justify-between items-baseline bg-white p-3 rounded-md shadow-sm">
                <span className="text-slate-500">החודש:</span>
                <span className="font-bold text-teal-600 text-lg">{childStats.monthlyTotal}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageSummary;
