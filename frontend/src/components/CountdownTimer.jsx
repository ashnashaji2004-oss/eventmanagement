import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CountdownTimer({ closeDate, isOverridden = false, status = 'OPEN' }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!closeDate) return { expired: true };
    const difference = new Date(closeDate) - new Date();
    if (difference <= 0) {
      return { expired: true };
    }
    return {
      expired: false,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [closeDate]);

  if (isOverridden) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold">
        <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
        <span>Admin Reopened / Extended</span>
      </div>
    );
  }

  if (timeLeft.expired || status === 'CLOSED' || status === 'COMPLETED') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <span>{t('events.registration_closed')}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
      <Clock className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
      <span>{t('events.registration_closes_in')}:</span>
      <span className="font-mono font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
