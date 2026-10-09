import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CustomPickers.css';

export const GenderPickerModal = ({ selected, onSelect, onClose }) => {
  const options = ['Prefer not to say', 'Male', 'Female', 'Other'];

  return (
    <div className="custom-picker-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="gender-picker-modal" onClick={e => e.stopPropagation()}>
        {options.map(opt => (
          <div 
            key={opt} 
            className="gender-picker-option"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opt);
              onClose();
            }}
          >
            <span>{opt}</span>
            <div className={`custom-radio ${selected === opt ? 'selected' : ''}`}>
              <div className="custom-radio-inner"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DatePickerModal = ({ initialDate, onSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (initialDate) {
      const parts = initialDate.split('-');
      if (parts.length === 3) {
        return new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
      }
    }
    return new Date();
  });

  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleSet = () => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    onSelect(`${y}-${m}-${d}`);
    onClose();
  };

  const formatDateDisplay = (date) => {
    const dNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const mNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    return `${dNames[date.getDay()]}, ${date.getDate()} ${mNames[date.getMonth()]}`;
  };

  return (
    <div className="custom-picker-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="date-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="date-picker-header">
          <div className="date-picker-year">{currentDate.getFullYear()}</div>
          <div className="date-picker-date-display">{formatDateDisplay(currentDate)}</div>
        </div>
        
        <div className="date-picker-body">
          <div className="date-picker-month-selector">
            <button className="date-picker-nav-btn" onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }}><ChevronLeft size={20}/></button>
            <span>{monthNames[month]} {year}</span>
            <button className="date-picker-nav-btn" onClick={(e) => { e.stopPropagation(); handleNextMonth(); }}><ChevronRight size={20}/></button>
          </div>
          
          <div className="date-picker-grid">
            {dayNames.map((d, i) => <div key={i} className="date-picker-day-name">{d}</div>)}
            {days.map((day, i) => {
              if (!day) return <div key={i} className="date-picker-day empty"></div>;
              const isSelected = currentDate.getDate() === day && currentDate.getMonth() === month && currentDate.getFullYear() === year;
              return (
                <div 
                  key={i} 
                  className={`date-picker-day ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentDate(new Date(year, month, day)); }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="date-picker-footer">
          <button className="date-picker-btn" onClick={(e) => { e.stopPropagation(); onSelect(''); onClose(); }}>CLEAR</button>
          <div className="date-picker-actions">
            <button className="date-picker-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}>CANCEL</button>
            <button className="date-picker-btn" onClick={(e) => { e.stopPropagation(); handleSet(); }}>SET</button>
          </div>
        </div>
      </div>
    </div>
  );
};
