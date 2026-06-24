'use client';

import { useState } from 'react';
import { ShieldCheck, Calendar, Clock, User, Phone, Mail, Trash2, X, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDateShort } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, isAdmin, appointments, cancelAppointment, userAppointments } = useApp();
  const [expanded, setExpanded] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);

  // If not admin, show user appointment history
  if (!user) return null;

  if (!isAdmin) {
    return (
      <section className="section-padding bg-white border-t border-pink-50" id="my-appointments">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-bold text-[#1a1a2e]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                My Appointments
              </h2>
              <p className="text-[#9CA3AF] text-sm mt-1">Welcome back, {user.name}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6BB3] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user.name[0]?.toUpperCase()}
            </div>
          </div>

          {userAppointments.length === 0 ? (
            <div className="bg-[#FFF9FC] rounded-2xl p-10 text-center border border-pink-100">
              <Calendar size={36} className="text-pink-200 mx-auto mb-3" />
              <p className="text-[#9CA3AF] text-sm">You have no appointments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-5 border border-pink-100 flex items-start justify-between gap-4 hover:border-pink-200 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F7] flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-[#E91E8C]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a2e]">{formatDateShort(apt.date)}</p>
                      <div className="flex items-center gap-1.5 text-[#9CA3AF] mt-1">
                        <Clock size={12} />
                        <span className="text-xs">{apt.time}</span>
                        {apt.service && (
                          <>
                            <span className="text-pink-200">·</span>
                            <span className="text-xs">{apt.service}</span>
                          </>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-2 ${
                          apt.status === 'confirmed'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmCancel(apt.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0 mt-1"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancel confirmation */}
        {confirmCancel && (
          <CancelConfirm
            onConfirm={async () => {
              await cancelAppointment(confirmCancel);
              setConfirmCancel(null);
            }}
            onCancel={() => setConfirmCancel(null)}
          />
        )}
      </section>
    );
  }

  // Admin view
  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter((a) => a.date >= today);
  const past = appointments.filter((a) => a.date < today);

  return (
    <section className="section-padding bg-[#FFF9FC] border-t border-pink-100" id="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E8C] to-[#FF6BB3] flex items-center justify-center shadow-md shadow-pink-200">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h2
                className="text-2xl font-bold text-[#1a1a2e]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Admin Dashboard
              </h2>
              <p className="text-[#9CA3AF] text-sm">{user.email}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold tracking-widest bg-[#E91E8C] text-white px-2.5 py-1 rounded-full uppercase">
            Admin
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: appointments.length, color: '#E91E8C', icon: BarChart3 },
            { label: 'Upcoming', value: upcoming.length, color: '#10B981', icon: Calendar },
            { label: 'Past', value: past.length, color: '#6B7280', icon: Clock },
            { label: 'Today', value: appointments.filter((a) => a.date === today).length, color: '#F59E0B', icon: User },
          ].map(({ label, value, color, icon: Icon }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 border border-pink-100 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {value}
                </p>
                <p className="text-xs text-[#9CA3AF]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments table */}
        <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-pink-50 cursor-pointer hover:bg-[#FFF9FC] transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <h3 className="text-base font-bold text-[#1a1a2e]">
              All Appointments{' '}
              <span className="text-[#9CA3AF] font-normal text-sm">({appointments.length})</span>
            </h3>
            {expanded ? <ChevronUp size={18} className="text-[#9CA3AF]" /> : <ChevronDown size={18} className="text-[#9CA3AF]" />}
          </div>

          {expanded && (
            appointments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar size={36} className="text-pink-200 mx-auto mb-3" />
                <p className="text-[#9CA3AF] text-sm">No appointments yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-50">
                {appointments.map((apt) => (
                  <div key={apt.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#FFF9FC] transition-colors">
                    {/* Date/time */}
                    <div className="w-24 flex-shrink-0">
                      <p className="text-xs font-bold text-[#1a1a2e]">{formatDateShort(apt.date)}</p>
                      <div className="flex items-center gap-1 text-[#9CA3AF] mt-0.5">
                        <Clock size={10} />
                        <span className="text-[10px]">{apt.time}</span>
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <User size={11} className="text-[#E91E8C]" />
                        <p className="text-sm font-semibold text-[#1a1a2e] truncate">{apt.name}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1 text-[#9CA3AF]">
                          <Mail size={10} />
                          <span className="text-[10px] truncate">{apt.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#9CA3AF]">
                          <Phone size={10} />
                          <span className="text-[10px]">{apt.phone}</span>
                        </div>
                      </div>
                      {apt.service && (
                        <span className="inline-block text-[10px] text-[#E91E8C] bg-[#FFF0F7] px-2 py-0.5 rounded-full mt-1">
                          {apt.service}
                        </span>
                      )}
                    </div>

                    {/* Status + cancel */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'confirmed'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {apt.status}
                      </span>
                      <button
                        onClick={() => setConfirmCancel(apt.id)}
                        className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Cancel confirmation */}
      {confirmCancel && (
        <CancelConfirm
          onConfirm={async () => {
            await cancelAppointment(confirmCancel);
            setConfirmCancel(null);
          }}
          onCancel={() => setConfirmCancel(null)}
        />
      )}
    </section>
  );
}

function CancelConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-red-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1a1a2e]">Cancel Appointment?</h3>
            <p className="text-sm text-[#6B7280] mt-1">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-[#525252] hover:bg-gray-50 transition-colors"
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
