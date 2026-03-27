import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDefaults } from './db';
import { generateInvoice } from './invoice';
import {
  Zap, Plus, ClipboardList, Settings as SettingsIcon,
  Check, Clock, DollarSign, Trash2, FileText, Camera,
  ChevronDown, ChevronUp, Share, X, Download, Car,
  Phone, Mail, User, CreditCard, Edit3, Image,
} from 'lucide-react';

/* ── seed DB on mount ─────────────────────────────────── */
function useBootstrap() {
  const [ready, setReady] = useState(false);
  useEffect(() => { seedDefaults().then(() => setReady(true)); }, []);
  return ready;
}

/* ── setting helpers ──────────────────────────────────── */
function useSetting(key) {
  const row = useLiveQuery(() => db.settings.get(key), [key]);
  return row?.value ?? '';
}

async function putSetting(key, value) {
  await db.settings.put({ key, value });
}

/* ── status badge ─────────────────────────────────────── */
const STATUS = {
  'in-progress': { label: 'In Progress', color: 'bg-amber-500', icon: Clock },
  completed:     { label: 'Completed',   color: 'bg-emerald-500', icon: Check },
  paid:          { label: 'Paid',        color: 'bg-blue-500', icon: DollarSign },
};

function Badge({ status }) {
  const s = STATUS[status] || STATUS['in-progress'];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${s.color}`}>
      <Icon size={12} /> {s.label}
    </span>
  );
}

/* ── glass nav bar ────────────────────────────────────── */
function NavBar({ tab, setTab }) {
  const tabs = [
    { id: 'jobs',    label: 'Jobs',    icon: ClipboardList },
    { id: 'new',     label: 'New Job', icon: Plus },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/80 border-t border-slate-700/50 safe-bottom">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center py-3 px-6 transition-all duration-200 ${active ? 'text-blue-400 scale-105' : 'text-slate-400'}`}>
              <Icon size={24} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[11px] mt-1 font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ── header ───────────────────────────────────────────── */
function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <span className="text-lg font-extrabold tracking-tight text-white">FlashDash</span>
      </div>
      <span className="text-[11px] text-slate-500 font-medium">Offline-Ready</span>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: NEW JOB — Quick-tap service buttons
   ══════════════════════════════════════════════════════════ */
function NewJobTab({ onCreated }) {
  const presets = useLiveQuery(() => db.presets.orderBy('order').toArray()) || [];
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [selected, setSelected] = useState([]);

  const toggle = (preset) => {
    setSelected(prev => {
      const exists = prev.find(s => s.presetId === preset.id);
      if (exists) return prev.filter(s => s.presetId !== preset.id);
      return [...prev, { presetId: preset.id, name: preset.name, price: preset.price }];
    });
  };

  const total = selected.reduce((s, x) => s + Number(x.price), 0);

  const create = async () => {
    if (selected.length === 0) return;
    const id = await db.jobs.add({
      clientName: clientName || 'Walk-in',
      clientPhone,
      vehicle,
      services: selected,
      status: 'in-progress',
      timestamp: Date.now(),
    });
    setClientName(''); setClientPhone(''); setVehicle(''); setSelected([]);
    onCreated?.(id);
  };

  return (
    <div className="px-4 pt-4 pb-28 space-y-5">
      <h2 className="text-xl font-bold text-white">New Job</h2>

      {/* Client info */}
      <div className="space-y-3">
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={clientName} onChange={e => setClientName(e.target.value)}
            placeholder="Client name (optional)"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-500 transition" />
        </div>
        <div className="relative">
          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={clientPhone} onChange={e => setClientPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-500 transition" />
        </div>
        <div className="relative">
          <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={vehicle} onChange={e => setVehicle(e.target.value)}
            placeholder="Vehicle (optional)"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-500 transition" />
        </div>
      </div>

      {/* Service preset buttons */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Tap to select services</h3>
        <div className="grid grid-cols-2 gap-3">
          {presets.map(p => {
            const active = selected.some(s => s.presetId === p.id);
            return (
              <button key={p.id} onClick={() => toggle(p)}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 border-2 min-h-[72px]
                  ${active
                    ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                    : 'bg-slate-800 border-slate-700 active:scale-95'}`}>
                {active && <Check size={18} className="absolute top-2.5 right-2.5 text-blue-400" />}
                <div className="text-white font-bold text-base">{p.name}</div>
                <div className="text-blue-400 font-extrabold text-lg mt-1">${p.price}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total + create */}
      {selected.length > 0 && (
        <div className="sticky bottom-20 z-30">
          <button onClick={create}
            className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Zap size={22} />
            Create Job — ${total.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: JOBS LIST
   ══════════════════════════════════════════════════════════ */
function JobsTab() {
  const jobs = useLiveQuery(() => db.jobs.orderBy('timestamp').reverse().toArray()) || [];
  const presets = useLiveQuery(() => db.presets.toArray()) || [];
  const [expanded, setExpanded] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load settings for invoice
  const businessName  = useSetting('businessName');
  const businessPhone = useSetting('businessPhone');
  const businessEmail = useSetting('businessEmail');
  const logo          = useSetting('logo');
  const stripeLink    = useSetting('stripeLink');

  const cycleStatus = async (job) => {
    const order = ['in-progress', 'completed', 'paid'];
    const next = order[(order.indexOf(job.status) + 1) % order.length];
    await db.jobs.update(job.id, { status: next });
  };

  const deleteJob = async (id) => {
    await db.jobs.delete(id);
    setConfirmDelete(null);
    if (expanded === id) setExpanded(null);
  };

  const downloadInvoice = (job) => {
    const settings = { businessName, businessPhone, businessEmail, logo, stripeLink };
    const doc = generateInvoice(job, settings, presets);
    doc.save(`FlashDash-${String(job.id).padStart(4, '0')}.pdf`);
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 px-4">
        <ClipboardList size={56} strokeWidth={1.2} className="mb-4 text-slate-600" />
        <p className="text-lg font-semibold">No jobs yet</p>
        <p className="text-sm mt-1">Tap "New Job" to get started</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-white">Jobs</h2>
        <span className="text-xs text-slate-500 font-medium">{jobs.length} total</span>
      </div>

      {jobs.map(job => {
        const total = (job.services || []).reduce((s, x) => s + Number(x.price), 0);
        const open = expanded === job.id;
        return (
          <div key={job.id} className="rounded-2xl bg-slate-800/80 border border-slate-700/60 overflow-hidden transition-all">
            {/* Row */}
            <button onClick={() => setExpanded(open ? null : job.id)}
              className="w-full flex items-center gap-3 p-4 text-left active:bg-slate-700/40 transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base truncate">{job.clientName}</span>
                  <Badge status={job.status} />
                </div>
                <div className="text-slate-400 text-sm mt-0.5">
                  {(job.services || []).map(s => s.name).join(', ')}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-white font-extrabold text-lg">${total.toFixed(2)}</div>
                <div className="text-slate-500 text-xs">{new Date(job.timestamp).toLocaleDateString()}</div>
              </div>
              {open ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
            </button>

            {/* Expanded detail */}
            {open && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-700/40 space-y-3">
                {job.clientPhone && <div className="text-sm text-slate-400"><Phone size={14} className="inline mr-1" />{job.clientPhone}</div>}
                {job.vehicle && <div className="text-sm text-slate-400"><Car size={14} className="inline mr-1" />{job.vehicle}</div>}

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => cycleStatus(job)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold active:scale-95 transition min-h-[44px]">
                    <Edit3 size={16} /> Change Status
                  </button>
                  <button onClick={() => downloadInvoice(job)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold active:scale-95 transition min-h-[44px]">
                    <FileText size={16} /> Invoice PDF
                  </button>
                  {confirmDelete === job.id ? (
                    <button onClick={() => deleteJob(job.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold active:scale-95 transition min-h-[44px]">
                      <Trash2 size={16} /> Confirm Delete
                    </button>
                  ) : (
                    <button onClick={() => setConfirmDelete(job.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-700 text-red-400 text-sm font-semibold active:scale-95 transition min-h-[44px]">
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: SETTINGS — Business info, presets, install
   ══════════════════════════════════════════════════════════ */
function SettingsTab() {
  const businessName  = useSetting('businessName');
  const businessPhone = useSetting('businessPhone');
  const businessEmail = useSetting('businessEmail');
  const logo          = useSetting('logo');
  const stripeLink    = useSetting('stripeLink');
  const presets       = useLiveQuery(() => db.presets.orderBy('order').toArray()) || [];

  const [editPreset, setEditPreset] = useState(null);
  const [presetName, setPresetName] = useState('');
  const [presetPrice, setPresetPrice] = useState('');
  const [showInstall, setShowInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  // PWA install prompt capture
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
    } else if (isIOS && !isStandalone) {
      setShowInstall(true);
    }
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => putSetting('logo', reader.result);
    reader.readAsDataURL(file);
  };

  const savePreset = async () => {
    if (!presetName.trim()) return;
    if (editPreset) {
      await db.presets.update(editPreset, { name: presetName, price: Number(presetPrice) || 0 });
    } else {
      const count = await db.presets.count();
      await db.presets.add({ name: presetName, price: Number(presetPrice) || 0, order: count });
    }
    setEditPreset(null); setPresetName(''); setPresetPrice('');
  };

  const deletePreset = async (id) => {
    await db.presets.delete(id);
  };

  const startEdit = (p) => {
    setEditPreset(p.id); setPresetName(p.name); setPresetPrice(String(p.price));
  };

  const Field = ({ icon: Icon, label, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-500 transition" />
      </div>
    </div>
  );

  return (
    <div className="px-4 pt-4 pb-28 space-y-6">
      <h2 className="text-xl font-bold text-white">Settings</h2>

      {/* Business info */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Business Info</h3>
        <Field icon={User} label="Business Name" value={businessName} onChange={v => putSetting('businessName', v)} placeholder="Your Business" />
        <Field icon={Phone} label="Phone" value={businessPhone} onChange={v => putSetting('businessPhone', v)} placeholder="(555) 123-4567" />
        <Field icon={Mail} label="Email" value={businessEmail} onChange={v => putSetting('businessEmail', v)} placeholder="you@business.com" />
        <Field icon={CreditCard} label="Stripe Payment Link" value={stripeLink} onChange={v => putSetting('stripeLink', v)} placeholder="https://buy.stripe.com/..." />

        {/* Logo */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Logo</label>
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="logo" className="w-14 h-14 rounded-xl object-cover border border-slate-700" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Image size={24} className="text-slate-600" />
              </div>
            )}
            <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold cursor-pointer active:scale-95 transition min-h-[44px]">
              <Camera size={16} /> Upload Logo
              <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </label>
            {logo && (
              <button onClick={() => putSetting('logo', '')}
                className="px-3 py-2.5 rounded-xl bg-slate-700 text-red-400 text-sm font-semibold active:scale-95 transition min-h-[44px]">
                Remove
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Service presets */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Service Menu</h3>
        {presets.map(p => (
          <div key={p.id} className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700">
            <div className="flex-1">
              <div className="text-white font-semibold">{p.name}</div>
              <div className="text-blue-400 font-bold text-sm">${p.price}</div>
            </div>
            <button onClick={() => startEdit(p)} className="p-2 rounded-lg bg-slate-700 text-slate-300 active:scale-90 transition"><Edit3 size={16} /></button>
            <button onClick={() => deletePreset(p.id)} className="p-2 rounded-lg bg-slate-700 text-red-400 active:scale-90 transition"><Trash2 size={16} /></button>
          </div>
        ))}

        {/* Add / edit preset */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-dashed border-slate-600 space-y-2">
          <div className="flex gap-2">
            <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Service name"
              className="flex-1 px-3 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500" />
            <input value={presetPrice} onChange={e => setPresetPrice(e.target.value)} placeholder="Price" type="number"
              className="w-24 px-3 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={savePreset}
              className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold active:scale-95 transition min-h-[44px]">
              {editPreset ? 'Save Changes' : '+ Add Service'}
            </button>
            {editPreset && (
              <button onClick={() => { setEditPreset(null); setPresetName(''); setPresetPrice(''); }}
                className="px-4 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm font-semibold active:scale-95 transition min-h-[44px]">
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Install app */}
      {!isStandalone && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Install App</h3>
          <button onClick={handleInstall}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-base active:scale-95 transition flex items-center justify-center gap-2 min-h-[52px]">
            <Download size={20} /> Add FlashDash to Home Screen
          </button>
        </section>
      )}

      {/* iOS install modal */}
      {showInstall && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60" onClick={() => setShowInstall(false)}>
          <div onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl bg-slate-800/95 backdrop-blur-2xl border-t border-slate-600 p-6 space-y-4 pb-10 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Install FlashDash</h3>
              <button onClick={() => setShowInstall(false)} className="p-2 rounded-full bg-slate-700"><X size={18} className="text-slate-300" /></button>
            </div>
            <div className="space-y-4 text-slate-300 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                <p>Tap the <Share size={16} className="inline text-blue-400" /> <strong className="text-white">Share</strong> button in Safari's toolbar</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                <p>Scroll down and tap <Plus size={16} className="inline text-blue-400" /> <strong className="text-white">Add to Home Screen</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
                <p>Tap <strong className="text-white">Add</strong> — FlashDash will appear on your home screen!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data management */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Data</h3>
        <p className="text-xs text-slate-500">All data is stored locally on this device. Nothing is sent to a server.</p>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APP ROOT
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const ready = useBootstrap();
  const [tab, setTab] = useState('new');

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Zap size={48} className="text-blue-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 max-w-lg mx-auto relative">
      <Header />
      {tab === 'jobs'     && <JobsTab />}
      {tab === 'new'      && <NewJobTab onCreated={() => setTab('jobs')} />}
      {tab === 'settings' && <SettingsTab />}
      <NavBar tab={tab} setTab={setTab} />
    </div>
  );
}
