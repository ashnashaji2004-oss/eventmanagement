import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  Building,
  Award,
  Plus,
  Minus,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export default function AdminHouses() {
  const { t, i18n } = useTranslation();
  const [houses, setHouses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/houses/');
      const houseList = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setHouses(houseList);
      if (houseList.length > 0 && !selectedHouse) {
        setSelectedHouse(houseList[0]);
        fetchHouseTransactions(houseList[0].id);
      } else if (selectedHouse) {
        fetchHouseTransactions(selectedHouse.id);
      }
    } catch (err) {
      setError('Failed to load houses.');
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseTransactions = async (houseId) => {
    try {
      const res = await api.get(`/houses/${houseId}/transactions/`);
      const txList = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setTransactions(txList);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building className="w-8 h-8 text-rose-600" />
          <span>Four-House Points & Standings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Official live house championship standings, victory counts, and verified competition points audit ledger.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-800">
          <XCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Houses Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(houses) && houses.map((h) => (
          <div
            key={h.id}
            onClick={() => { setSelectedHouse(h); fetchHouseTransactions(h.id); }}
            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all flex flex-col justify-between shadow-xs ${
              selectedHouse?.id === h.id ? 'ring-4 ring-slate-900/10 scale-102' : 'hover:scale-101'
            }`}
            style={{
              borderColor: h.color_code,
              backgroundColor: `${h.color_code}0C`
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs"
                  style={{ backgroundColor: h.color_code }}
                >
                  {h.name} House
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {h.first_places || 0} Wins (1st)
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <span className="block text-4xl font-black text-slate-900">
                  {h.total_points || 0}
                  <span className="text-xs font-semibold text-slate-500 pl-1">pts</span>
                </span>
                <span className="block text-xs font-semibold text-slate-700">
                  Captain: {h.captain_name || 'Designated Leader'}
                </span>
                <p className="text-[11px] text-slate-500 italic pt-1 line-clamp-2">
                  "{i18n.language === 'ml' && h.motto_ml ? h.motto_ml : h.motto}"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {h.student_count || 0} Students
              </span>
              <span className="text-xs font-bold text-slate-600">
                #{h.rank || '-'} in Championship
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected House Score Transaction Ledger */}
      {selectedHouse && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <span>{selectedHouse.name} House Score Audit Ledger</span>
              </h2>
              <p className="text-xs text-slate-500">
                Permanent official audit log of all points credited from verified competition results.
              </p>
            </div>


          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Reason & Event</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(transactions) && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <span className={`font-mono font-black text-sm ${
                          tx.points >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{tx.reason}</span>
                        {tx.event_name && (
                          <span className="text-slate-500 text-[11px]">{tx.event_name}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {tx.transaction_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {tx.created_by_username || 'System'}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                      No score transactions recorded yet for this house.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


    </div>
  );
}

