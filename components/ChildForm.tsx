
import React, { useState } from 'react';
import { Child, DiaperBrand } from '../types';
import { DIAPER_BRANDS } from '../constants';

interface ChildFormProps {
  onAddChild: (child: Omit<Child, 'id' | 'logs'>) => void;
  onCancel: () => void;
}

const ChildForm: React.FC<ChildFormProps> = ({ onAddChild, onCancel }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [brand, setBrand] = useState<DiaperBrand>(DIAPER_BRANDS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dob) {
      setError('נא למלא את כל השדות.');
      return;
    }
    const birthDate = new Date(dob);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    if (birthDate > today) {
      setError('תאריך הלידה לא יכול להיות בעתיד.');
      return;
    }
    setError('');
    onAddChild({
      name,
      dateOfBirth: dob,
      diaperBrand: brand,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 text-center">הוספת ילד חדש</h2>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          שם הילד
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          placeholder="לדוגמה: דניאל"
        />
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">
          תאריך לידה
        </label>
        <input
          type="date"
          id="dob"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          max={new Date().toISOString().split("T")[0]} // Prevent future dates
        />
      </div>

      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-slate-700 mb-1">
          סוג חיתול
        </label>
        <select
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value as DiaperBrand)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white"
        >
          {DIAPER_BRANDS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors"
        >
          הוסף ילד
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-opacity-75 transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  );
};

export default ChildForm;
