import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from "recharts";
import {
  CalendarDays, Users, DollarSign, CheckSquare, Settings, Gift, LayoutGrid, TrendingUp, ClipboardList, Heart, Briefcase
} from "lucide-react";
import './index.css';

// --- Components ---
const Card = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl shadow-sm border border-gray-200 bg-white p-6 w-full ${className}`}>
    {title && <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">{title}</div>}
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-3">{children}</h2>
);

const Label = ({ children }) => (
  <label className="text-sm text-gray-600 font-medium">{children}</label>
);

const Input = (props) => (
  <input {...props} className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className || ""}`} />
);

const Select = ({ options = [], value, onChange, className }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className || ""}`}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const TextArea = (props) => (
  <textarea {...props} className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className || ""}`} />
);

// --- Data defaults ---
const DEFAULT_SETUP = {
  brideName: "Alex Example",
  groomName: "Sam Sample",
  weddingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10),
  ceremony: "Example Chapel",
  reception: "Example Hall",
  currency: "£",
  roles: ["Bride", "Groom", "Bridesmaid", "Groomsman", "Parent", "MC", "Friend", "Family"],
  guestTags: ["Bride Family", "Groom Family", "Bride Friends", "Groom Friends", "Workmates", "Vendors", "Kids"],
  rsvpOptions: ["Yes", "No", "Maybe", "No response"],
  saveDateOptions: ["Not sent", "Sent", "Delivered"],
  inviteOptions: ["Not sent", "Sent", "Delivered"],
  accommodationOptions: ["Not needed", "Required", "Booked", "N/A"],
  mealOptions: ["Beef", "Fish", "Vegetarian", "Vegan", "Kids", "Other"],
  vendorTypes: ["Photographer", "Caterer", "Band/DJ", "Florist", "Venue", "Transport", "Hair/Makeup", "Officiant", "Stationery", "Cake", "Decor", "Lighting", "AV", "Rentals", "Planner", "Misc"],
};

const PHASES = ["12+ months", "6–12 months", "3–6 months", "2–3 months", "1 month", "2–3 weeks", "Week of"];
const STATUS = ["Not started", "In progress", "Complete"];
const PRIORITY = ["High", "Medium", "Low"];

const currency = (sym, v) => `${sym}${Number(v || 0).toLocaleString()}`;

function usePersistentState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

// --- App ---
export default function App() {
  const [tab, setTab] = usePersistentState("wp_tab", "dashboard");
  const [setup, setSetup] = usePersistentState("wp_setup", DEFAULT_SETUP);
  const [guests, setGuests] = usePersistentState("wp_guests", []);
  const [vendors, setVendors] = usePersistentState("wp_vendors", {});
  const [tasks, setTasks] = usePersistentState("wp_tasks", []);
  const [budgetPlan, setBudgetPlan] = usePersistentState("wp_budgetPlan", []);
  const [expenses, setExpenses] = usePersistentState("wp_expenses", []);
  const [tables, setTables] = usePersistentState("wp_tables", []);
  const [seats, setSeats] = usePersistentState("wp_seats", []);

  const weddingDate = new Date(setup.weddingDate);
  const daysLeft = Math.max(0, Math.ceil((weddingDate - new Date()) / (1000 * 60 * 60 * 24)));

  const totalGuests = guests.length;
  const invitesSent = guests.filter(g => ["Sent", "Delivered"].includes(g.invite)).length;
  const confirmed = guests.filter(g => g.rsvp === "Yes").length;
  const totalPlanned = budgetPlan.reduce((s, b) => s + Number(b.planned || 0), 0);
  const spent = expenses.filter(e => e.paid).reduce((s, e) => s + Number(e.amount || 0), 0);
  const leftToPay = expenses.filter(e => !e.paid).reduce((s, e) => s + Number(e.amount || 0), 0);

  // Charts
  const rsvpBreakdown = setup.rsvpOptions.map(s => ({ name: s, value: guests.filter(g => g.rsvp === s).length }));
  const vendorFinalByType = setup.vendorTypes.map(vt => ({ name: vt, value: (vendors[vt] || []).filter(v => v.final).reduce((s, v) => s + Number(v.contract || 0), 0) }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-indigo-600" />
            <div className="font-semibold">Wedding Planner</div>
            <div className="text-sm text-gray-500">{setup.brideName} & {setup.groomName} — {setup.weddingDate}</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setTab("dashboard")} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Dashboard</button>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-6 space-y-6">
        {tab === "setup" && <SetupTab setup={setup} setSetup={setSetup} />}
        {tab === "vendors" && <VendorsTab setup={setup} vendors={vendors} setVendors={setVendors} />}
        {tab === "budget" && <BudgetTab setup={setup} budgetPlan={budgetPlan} setBudgetPlan={setBudgetPlan} expenses={expenses} setExpenses={setExpenses} />}
        {tab === "guests" && <GuestsTab setup={setup} guests={guests} setGuests={setGuests} />}
        {tab === "gifts" && <GiftsTab guests={guests} />}
        {tab === "timeline" && <TimelineTab tasks={tasks} setTasks={setTasks} />}
        {tab === "seating" && <SeatingTab tables={tables} setTables={setTables} seats={seats} setSeats={setSeats} guests={guests} />}
      </main>
    </div>
  );
}

// --- Example: SetupTab fixes ---
function SetupTab({ setup, setSetup }) {
  const update = (patch) => setSetup({ ...setup, ...patch });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <Card title="Event details">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Bride/Partner</Label><Input value={setup.brideName} onChange={e => update({ brideName: e.target.value })} /></div>
          <div><Label>Groom/Partner</Label><Input value={setup.groomName} onChange={e => update({ groomName: e.target.value })} /></div>
          <div><Label>Wedding date</Label><Input type="date" value={setup.weddingDate} onChange={e => update({ weddingDate: e.target.value })} /></div>
          <div><Label>Currency</Label><Input value={setup.currency} onChange={e => update({ currency: e.target.value })} /></div>
          <div className="col-span-2"><Label>Ceremony</Label><Input value={setup.ceremony} onChange={e => update({ ceremony: e.target.value })} /></div>
          <div className="col-span-2"><Label>Reception</Label><Input value={setup.reception} onChange={e => update({ reception: e.target.value })} /></div>
        </div>
      </Card>
      <Card title="Lists (edit options)">
        <div className="grid grid-cols-2 gap-3">
          {["roles", "guestTags", "rsvpOptions", "saveDateOptions", "inviteOptions", "accommodationOptions", "mealOptions", "vendorTypes"].map(list => (
            <div key={list}>
              <Label>{list.replace(/([A-Z])/g, ' $1')}</Label>
              <TextArea rows={6} value={setup[list].join("\n")} onChange={e => update({ [list]: e.target.value.split(/\n+/).map(s => s.trim()).filter(Boolean) })} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// --- Vendor page fix ---
function VendorsTab({ setup, vendors, setVendors }) {
  const addRow = (vt) => setVendors({ ...vendors, [vt]: [...(vendors[vt] || []), { final: false, name: "", email: "", contact: "", pkg: "", quoted: 0, contract: 0, notes: "" }] });
  const update = (vt, idx, patch) => setVendors({ ...vendors, [vt]: vendors[vt].map((v, i) => i === idx ? { ...v, ...patch } : v) });
  const remove = (vt, idx) => setVendors({ ...vendors, [vt]: vendors[vt].filter((_, i) => i !== idx) });

  return (
    <div className="flex flex-col gap-6 w-full">
      {setup.vendorTypes.map(vt => (
        <Card key={vt} title={<div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-600" />{vt}</div>}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                {["Final?", "Name", "Email", "Contact", "Package", "Quoted", "Contract", "Notes", ""].map(h => (
                  <th key={h} className="py-2 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(vendors[vt] || []).map((v, idx) => (
                <tr key={idx} className="border-t">
                  <td><Select options={["false", "true"]} value={String(v.final)} onChange={val => update(vt, idx, { final: val === "true" })} /></td>
                  <td><Input className="min-w-[160px]" value={v.name} onChange={e => update(vt, idx, { name: e.target.value })} /></td>
                  <td><Input className="min-w-[160px]" value={v.email} onChange={e => update(vt, idx, { email: e.target.value })} /></td>
                  <td><Input className="min-w-[160px]" value={v.contact} onChange={e => update(vt, idx, { contact: e.target.value })} /></td>
                  <td><Input className="min-w-[160px]" value={v.pkg} onChange={e => update(vt, idx, { pkg: e.target.value })} /></td>
                  <td><Input type="number" value={v.quoted} onChange={e => update(vt, idx, { quoted: Number(e.target.value) })} /></td>
                  <td><Input type="number" value={v.contract} onChange={e => update(vt, idx, { contract: Number(e.target.value) })} /></td>
                  <td><Input className="min-w-[200px]" value={v.notes} onChange={e => update(vt, idx, { notes: e.target.value })} /></td>
                  <td><button className="text-red-500" onClick={() => remove(vt, idx)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3"><button onClick={() => addRow(vt)} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Add {vt}</button></div>
        </Card>
      ))}
    </div>
  );
}
