'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';

export type Interval = 'day' | 'month' | 'year';

export interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string, interval: Interval) => void;
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [activePreset, setActivePreset] = useState<'year' | 'month' | '30days' | '7days' | 'custom'>('year');
  const [interval, setInterval] = useState<Interval>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Initialize with current year
  useEffect(() => {
    handlePreset('year');
  }, []);

  const handlePreset = (preset: 'year' | 'month' | '30days' | '7days' | 'custom') => {
    setActivePreset(preset);
    const now = new Date();
    let start = new Date();
    let end = new Date(now.getFullYear() + 1, 0, 1); // Default end is start of next year for "current year" logic
    let newInterval: Interval = 'month';

    if (preset === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      newInterval = 'month';
    } else if (preset === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      newInterval = 'day';
    } else if (preset === '30days') {
      start = new Date();
      start.setDate(now.getDate() - 30);
      end = new Date();
      end.setDate(now.getDate() + 1); // Include today
      newInterval = 'day';
    } else if (preset === '7days') {
      start = new Date();
      start.setDate(now.getDate() - 7);
      end = new Date();
      end.setDate(now.getDate() + 1);
      newInterval = 'day';
    } else if (preset === 'custom') {
      setShowCustom(true);
      return; // Don't trigger change yet
    }

    setShowCustom(false);
    const startDateStr = start.toISOString().split('T')[0] || '';
    const endDateStr = end.toISOString().split('T')[0] || '';
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    setInterval(newInterval);
    onFilterChange(start.toISOString(), end.toISOString(), newInterval);
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      onFilterChange(new Date(startDate).toISOString(), new Date(endDate).toISOString(), interval);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePreset('year')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activePreset === 'year' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cette année
          </button>
          <button
            onClick={() => handlePreset('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activePreset === 'month' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ce mois
          </button>
          <button
            onClick={() => handlePreset('30days')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activePreset === '30days' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30 derniers jours
          </button>
          <button
            onClick={() => handlePreset('7days')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activePreset === '7days' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7 derniers jours
          </button>
          <button
            onClick={() => handlePreset('custom')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activePreset === 'custom' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Personnalisé
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 px-2">Vue par :</span>
            <select
              value={interval}
              onChange={(e) => {
                const newInterval = e.target.value as Interval;
                setInterval(newInterval);
                if (startDate && endDate) {
                  onFilterChange(new Date(startDate).toISOString(), new Date(endDate).toISOString(), newInterval);
                }
              }}
              className="bg-transparent text-sm font-medium text-forest-dark focus:outline-none cursor-pointer"
            >
              <option value="day">Jour</option>
              <option value="month">Mois</option>
              <option value="year">Année</option>
            </select>
          </div>
        </div>
      </div>

      {showCustom && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-forest focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-forest focus:border-transparent outline-none"
            />
          </div>
          <Button 
            appName="web" 
            onClick={handleCustomApply}
            className="bg-forest hover:bg-forest-light text-white px-4 py-2 rounded-lg text-sm"
          >
            Appliquer
          </Button>
        </div>
      )}
    </div>
  );
}
