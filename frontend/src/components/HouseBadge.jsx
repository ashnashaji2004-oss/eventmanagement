import React from 'react';
import { Shield } from 'lucide-react';

const HOUSE_CONFIG = {
  Orange: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    solid: 'bg-orange-600 text-white',
    badge: 'border-orange-500/30'
  },
  Red: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    solid: 'bg-orange-600 text-white',
    badge: 'border-orange-500/30'
  },
  Blue: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    solid: 'bg-blue-600 text-white',
    badge: 'border-blue-500/30'
  },
  Yellow: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    solid: 'bg-amber-500 text-slate-900',
    badge: 'border-amber-500/30'
  },
  Green: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    solid: 'bg-emerald-600 text-white',
    badge: 'border-emerald-500/30'
  }
};

export default function HouseBadge({ houseName, size = 'sm', variant = 'subtle', showIcon = true }) {
  const name = houseName || 'Unknown';
  const config = HOUSE_CONFIG[name] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    solid: 'bg-slate-600 text-white',
    badge: 'border-slate-300'
  };

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1.5 text-sm font-bold'
    : 'px-2 py-0.5 text-xs font-semibold';

  const styleClass = variant === 'solid' ? config.solid : `${config.bg} border`;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${styleClass} ${sizeClasses} shadow-xs`}>
      {showIcon && <Shield className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{name} House</span>
    </span>
  );
}
