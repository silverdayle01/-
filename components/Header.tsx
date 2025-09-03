
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-6 md:px-8">
        <h1 className="text-3xl font-bold text-teal-600">מעקב חיתולים חכם</h1>
        <p className="text-slate-500 mt-1">כל המידע על צריכת החיתולים במקום אחד</p>
      </div>
    </header>
  );
};

export default Header;
