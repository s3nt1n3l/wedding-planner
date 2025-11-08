// App.js — Full Wedding Planner (Responsive + Proper Spacing)
import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line,
  Legend, ResponsiveContainer
} from "recharts";
import {
  CalendarDays, Users, DollarSign, CheckSquare, Settings,
  Gift, UtensilsCrossed, LayoutGrid, TrendingUp,
  ClipboardList, Heart, Briefcase
} from "lucide-react";
import './index.css';

// --- Layout and UI helpers ---
const Card = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl shadow-sm border border-gray-200 bg-white p-4 md:p-6 my-3 ${className}`}>
    {title && (
      <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        {title}
      </div>
    )}
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">{children}</h2>
);

const Label = ({ children }) => (
  <label className="text-sm text-gray-600 font-medium">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className || ""}`}
  />
);

const Select = ({ options = [], value, onChange, className }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className || ""}`}
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

const TextArea = (props) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className || ""}`}
  />
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-300"} relative`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""
        }`}
    ></span>
  </button>
);

// --- Defaults ---
const DEFAULT_SETUP = {
  brideName: "Alex Example",
  groomName: "Sam Sample",
  weddingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120)
    .toISOString()
    .slice(0, 10),
  ceremony: "Example Chapel",
  reception: "Example Hall",
  currency: "£",
  roles: ["Bride", "Groom", "Bridesmaid", "Groomsman", "Parent", "MC", "Friend", "Family"],
  guestTags: [
    "Bride Family",
    "Groom Family",
    "Bride Friends",
    "Groom Friends",
    "Workmates",
    "Vendors",
    "Kids",
  ],
  rsvpOptions: ["Yes", "No", "Maybe", "No response"],
  saveDateOptions: ["Not sent", "Sent", "Delivered"],
  inviteOptions: ["Not sent", "Sent", "Delivered"],
  accommodationOptions: ["Not needed", "Required", "Booked", "N/A"],
  mealOptions: ["Beef", "Fish", "Vegetarian", "Vegan", "Kids", "Other"],
  vendorTypes: [
    "Photographer", "Caterer", "Band/DJ", "Florist", "Venue",
    "Transport", "Hair/Makeup", "Officiant", "Stationery",
    "Cake", "Decor", "Lighting", "AV", "Rentals", "Planner", "Misc",
  ],
};

const PHASES = ["12+ months", "6–12 months", "3–6 months", "2–3 months", "1 month", "2–3 weeks", "Week of"];
const STATUS = ["Not started", "In progress", "Complete"];
const PRIORITY = ["High", "Medium", "Low"];

const seedGuests = [
  {
    id: 1,
    firstName: "Jamie",
    lastName: "Lee",
    role: "Bride",
    tag: "Bride Friends",
    email: "jamie@example.com",
    saveDate: "Sent",
    invite: "Sent",
    rsvp: "Yes",
    plusOneAllowed: "No",
    plusOneName: "",
    meal: "Vegetarian",
    allergies: "Nuts",
    notes: "",
  },
  {
    id: 2,
    firstName: "Taylor",
    lastName: "Morgan",
    role: "Groom",
    tag: "Groom Friends",
    email: "taylor@example.com",
    saveDate: "Delivered",
    invite: "Delivered",
    rsvp: "No response",
    plusOneAllowed: "Yes",
    plusOneName: "Alex Guest",
    meal: "Beef",
    allergies: "",
    notes: "Wheelchair access",
  },
];

const seedVendors = (setup) =>
  setup.vendorTypes.reduce((acc, type) => {
    acc[type] = [
      {
        final: false,
        name: "",
        email: "",
        contact: "",
        pkg: "",
        quoted: 0,
        contract: 0,
        notes: "",
      },
    ];
    return acc;
  }, {});

const seedTasks = [];

const currency = (sym, v) => `${sym}${Number(v || 0).toLocaleString()}`;

// Persistent localStorage state
function usePersistentState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
      {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

// --- Navigation Tabs ---
const TABS = [
  { key: "dashboard", label: "Dashboard", icon: CalendarDays },
  { key: "setup", label: "Setup", icon: Settings },
  { key: "timeline", label: "Timeline", icon: ClipboardList },
  { key: "vendors", label: "Vendors", icon: Briefcase },
  { key: "budget", label: "Budget", icon: DollarSign },
  { key: "guests", label: "Guests", icon: Users },
  { key: "gifts", label: "Gifts & TY", icon: Gift },
  { key: "seating", label: "Seating", icon: LayoutGrid },
];

export default function App() {
  const [tab, setTab] = usePersistentState("wp_tab", "dashboard");
  const [setup, setSetup] = usePersistentState("wp_setup", DEFAULT_SETUP);
  const [guests, setGuests] = usePersistentState("wp_guests", seedGuests);
  const [vendors, setVendors] = usePersistentState("wp_vendors", seedVendors(DEFAULT_SETUP));
  const [tasks, setTasks] = usePersistentState("wp_tasks", seedTasks);
  const [budgetPlan, setBudgetPlan] = usePersistentState("wp_budgetPlan", [
    { category: "Venue", planned: 6000 },
    { category: "Caterer", planned: 4000 },
    { category: "Photographer", planned: 2000 },
    { category: "Band/DJ", planned: 1200 },
    { category: "Florist", planned: 800 },
    { category: "Misc", planned: 1000 },
  ]);
  const [expenses, setExpenses] = usePersistentState("wp_expenses", [
    {
      date: new Date().toISOString().slice(0, 10),
      payee: "Lens Co",
      type: "Photographer",
      desc: "Deposit",
      amount: 500,
      paid: true,
    },
    {
      date: new Date().toISOString().slice(0, 10),
      payee: "Tasty Foods",
      type: "Caterer",
      desc: "Deposit",
      amount: 1000,
      paid: false,
    },
  ]);
  const [tables, setTables] = usePersistentState("wp_tables", [
    { name: "A", capacity: 8, area: "Main" },
    { name: "B", capacity: 8, area: "Main" },
  ]);
  const [seats, setSeats] = usePersistentState("wp_seats", []);

  const weddingDate = new Date(setup.weddingDate);
  const daysLeft = Math.max(0, Math.ceil((weddingDate - new Date()) / (1000 * 60 * 60 * 24)));

  // Derived guest stats
  const totalGuests = guests.length;
  const invitesSent = guests.filter((g) => ["Sent", "Delivered"].includes(g.invite)).length;
  const confirmed = guests.filter((g) => g.rsvp === "Yes").length;

  // Budget derived
  const totalPlanned = budgetPlan.reduce((s, b) => s + Number(b.planned || 0), 0);
  const spent = expenses.filter((e) => e.paid).reduce((s, e) => s + Number(e.amount || 0), 0);
  const leftToPay = expenses.filter((e) => !e.paid).reduce((s, e) => s + Number(e.amount || 0), 0);

  // Charts data
  const rsvpBreakdown = setup.rsvpOptions.map((s) => ({
    name: s,
    value: guests.filter((g) => g.rsvp === s).length,
  }));
  const mealBreakdown = setup.mealOptions.map((m) => ({
    name: m,
    value: guests.filter((g) => g.meal === m).length,
  }));
  const vendorFinalByType = setup.vendorTypes.map((vt) => ({
    name: vt,
    value: (vendors[vt] || [])
      .filter((v) => v.final)
      .reduce((s, v) => s + Number(v.contract || 0), 0),
  }));
  const expenseByType = setup.vendorTypes.map((vt) => ({
    name: vt,
    value: expenses
      .filter((e) => e.type === vt && e.paid)
      .reduce((s, e) => s + Number(e.amount || 0), 0),
  }));

  // Import/Export
  const exportJson = () => {
    const data = { setup, guests, vendors, tasks, budgetPlan, expenses, tables, seats };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding_planner.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setSetup(data.setup || setup);
        setGuests(data.guests || guests);
        setVendors(data.vendors || vendors);
        setTasks(data.tasks || tasks);
        setBudgetPlan(data.budgetPlan || budgetPlan);
        setExpenses(data.expenses || expenses);
        setTables(data.tables || tables);
        setSeats(data.seats || seats);
      } catch (err) {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-3 md:px-8 lg:px-12 py-4 md:py-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 mb-4 rounded-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Heart className="w-6 h-6 text-indigo-600" />
            <div className="font-semibold">Wedding Planner</div>
            <div className="text-sm text-gray-500">
              {setup.brideName} & {setup.groomName} — {setup.weddingDate}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportJson}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-sm"
            >
              Export
            </button>
            <label className="px-3 py-1.5 rounded-xl bg-gray-100 text-sm cursor-pointer">
              Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
              />
            </label>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${tab === t.key
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto">
        {tab === "dashboard" && (
          <Dashboard
            setup={setup}
            daysLeft={daysLeft}
            totalGuests={totalGuests}
            invitesSent={invitesSent}
            confirmed={confirmed}
            totalPlanned={totalPlanned}
            spent={spent}
            leftToPay={leftToPay}
            rsvpBreakdown={rsvpBreakdown}
            vendorFinalByType={vendorFinalByType}
            expenseByType={expenseByType}
          />
        )}
        {tab === "setup" && <SetupTab setup={setup} setSetup={setSetup} />}
        {tab === "vendors" && (
          <VendorsTab setup={setup} vendors={vendors} setVendors={setVendors} />
        )}
        {tab === "budget" && (
          <BudgetTab
            setup={setup}
            budgetPlan={budgetPlan}
            setBudgetPlan={setBudgetPlan}
            expenses={expenses}
            setExpenses={setExpenses}
          />
        )}
        {tab === "guests" && (
          <GuestsTab
            setup={setup}
            guests={guests}
            setGuests={setGuests}
            rsvpBreakdown={rsvpBreakdown}
            mealBreakdown={mealBreakdown}
          />
        )}
        {tab === "gifts" && <GiftsTab guests={guests} />}
        {tab === "timeline" && <TimelineTab tasks={tasks} setTasks={setTasks} />}
        {tab === "seating" && (
          <SeatingTab
            tables={tables}
            setTables={setTables}
            seats={seats}
            setSeats={setSeats}
            guests={guests}
          />
        )}
      </main>
    </div>
  );
}

// Dashboard Section
function Dashboard({
  setup,
  daysLeft,
  totalGuests,
  invitesSent,
  confirmed,
  totalPlanned,
  spent,
  leftToPay,
  rsvpBreakdown,
  vendorFinalByType,
  expenseByType,
}) {
  const remaining = Math.max(0, totalPlanned - spent);
  const budgetPie = [
    { name: "Spent", value: spent },
    { name: "Remaining", value: remaining },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Overview
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Days left" value={daysLeft} icon={CalendarDays} />
          <Stat label="Guests" value={totalGuests} icon={Users} />
          <Stat label="Invites sent" value={invitesSent} icon={TrendingUp} />
          <Stat label="Confirmed" value={confirmed} icon={CheckSquare} />
          <Stat
            label="Planned budget"
            value={currency(setup.currency, totalPlanned)}
            icon={DollarSign}
          />
          <Stat
            label="Spent"
            value={currency(setup.currency, spent)}
            icon={DollarSign}
          />
        </div>
      </Card>

      <Card title="Budget: Spent vs Remaining">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={budgetPie} outerRadius={100} label>
                {budgetPie.map((e, i) => (
                  <Cell key={i} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="RSVP Distribution">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={rsvpBreakdown} outerRadius={100} label>
                {rsvpBreakdown.map((e, i) => (
                  <Cell key={i} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
// --- Setup Page ---
function SetupTab({ setup, setSetup }) {
  const update = (patch) => setSetup({ ...setup, ...patch });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" /> Event Details
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Bride/Partner</Label>
            <Input
              value={setup.brideName}
              onChange={(e) => update({ brideName: e.target.value })}
            />
          </div>
          <div>
            <Label>Groom/Partner</Label>
            <Input
              value={setup.groomName}
              onChange={(e) => update({ groomName: e.target.value })}
            />
          </div>
          <div>
            <Label>Wedding Date</Label>
            <Input
              type="date"
              value={setup.weddingDate}
              onChange={(e) => update({ weddingDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Currency</Label>
            <Input
              value={setup.currency}
              onChange={(e) => update({ currency: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label>Ceremony</Label>
            <Input
              value={setup.ceremony}
              onChange={(e) => update({ ceremony: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label>Reception</Label>
            <Input
              value={setup.reception}
              onChange={(e) => update({ reception: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card title="Lists (Edit Options)">
        <div className="grid grid-cols-2 gap-4">
          <ListEditor
            label="Roles"
            value={setup.roles}
            onChange={(v) => update({ roles: v })}
          />
          <ListEditor
            label="Guest Tags"
            value={setup.guestTags}
            onChange={(v) => update({ guestTags: v })}
          />
          <ListEditor
            label="RSVP Options"
            value={setup.rsvpOptions}
            onChange={(v) => update({ rsvpOptions: v })}
          />
          <ListEditor
            label="Save-the-Date"
            value={setup.saveDateOptions}
            onChange={(v) => update({ saveDateOptions: v })}
          />
          <ListEditor
            label="Invitations"
            value={setup.inviteOptions}
            onChange={(v) => update({ inviteOptions: v })}
          />
          <ListEditor
            label="Accommodation"
            value={setup.accommodationOptions}
            onChange={(v) => update({ accommodationOptions: v })}
          />
          <ListEditor
            label="Meal Options"
            value={setup.mealOptions}
            onChange={(v) => update({ mealOptions: v })}
          />
          <ListEditor
            label="Vendor Types"
            value={setup.vendorTypes}
            onChange={(v) => update({ vendorTypes: v })}
          />
        </div>
      </Card>
    </div>
  );
}

// --- Timeline Page ---
function TimelineTab({ tasks, setTasks }) {
  const PHASES = ["12+ months", "6–12 months", "3–6 months", "2–3 months", "1 month", "2–3 weeks", "Week of"];
  const PRIORITY = ["High", "Medium", "Low"];
  const STATUS = ["Not started", "In progress", "Complete"];

  const addTask = (phase) =>
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        task: "",
        phase,
        owner: "",
        priority: "Medium",
        deadline: "",
        description: "",
        status: "Not started",
        completedDate: "",
      },
    ]);

  const update = (id, patch) => setTasks(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const byPhase = PHASES.reduce((acc, p) => {
    acc[p] = tasks.filter((t) => t.phase === p);
    return acc;
  }, {});

  const completed = tasks.filter((t) => t.status === "Complete").length;
  const completionPct = tasks.length ? completed / tasks.length : 0;

  const ownerCounts = Object.entries(
    tasks.reduce((m, t) => {
      if (!t.owner) return m;
      m[t.owner] = (m[t.owner] || 0) + 1;
      return m;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const prCounts = PRIORITY.map((p) => ({ name: p, value: tasks.filter((t) => t.priority === p).length }));

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Progress">
          <div className="text-sm text-gray-600">Completed {completed}/{tasks.length}</div>
          <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
            <div
              className="h-3 bg-indigo-600 rounded-full"
              style={{ width: `${Math.round(completionPct * 100)}%` }}
            />
          </div>
        </Card>

        <Card title="Tasks by owner">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ownerCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Priority distribution">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {PHASES.map((phase) => (
        <div key={phase} className="mt-2">
          <SectionTitle>{phase}</SectionTitle>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Task</th>
                    <th className="py-2 pr-3">Owner</th>
                    <th className="py-2 pr-3">Priority</th>
                    <th className="py-2 pr-3">Deadline</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Completed</th>
                    <th className="py-2 pr-3">Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {byPhase[phase].map((t) => {
                    const overdue =
                      t.deadline &&
                      new Date(t.deadline) < new Date() &&
                      t.status !== "Complete";
                    return (
                      <tr key={t.id} className={`border-t ${overdue ? "bg-red-50" : ""}`}>
                        <td className="py-2 pr-3">
                          <Input value={t.task} onChange={(e) => update(t.id, { task: e.target.value })} />
                        </td>
                        <td className="py-2 pr-3">
                          <Input value={t.owner} onChange={(e) => update(t.id, { owner: e.target.value })} />
                        </td>
                        <td className="py-2 pr-3">
                          <Select
                            options={PRIORITY}
                            value={t.priority}
                            onChange={(v) => update(t.id, { priority: v })}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            type="date"
                            value={t.deadline || ""}
                            onChange={(e) => update(t.id, { deadline: e.target.value })}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <Select
                            options={STATUS}
                            value={t.status}
                            onChange={(v) => update(t.id, { status: v })}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            type="date"
                            value={t.completedDate || ""}
                            onChange={(e) => update(t.id, { completedDate: e.target.value })}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            value={t.description}
                            onChange={(e) => update(t.id, { description: e.target.value })}
                          />
                        </td>
                        <td className="py-2 pr-3 text-right">
                          <button className="text-red-500" onClick={() => remove(t.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <button
                onClick={() => addTask(phase)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white"
              >
                Add task
              </button>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}


function ListEditor({ label, value, onChange }) {
  const [text, setText] = useState(value.join("\n"));
  useEffect(() => setText(value.join("\n")), [value]);

  return (
    <div>
      <Label>{label}</Label>
      <TextArea
        rows={5}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split(/\n+/)
              .map((s) => s.trim())
              .filter(Boolean)
          );
        }}
      />
    </div>
  );
}

// --- Vendors Page ---
function VendorsTab({ setup, vendors, setVendors }) {
  const addRow = (vt) =>
    setVendors({
      ...vendors,
      [vt]: [
        ...(vendors[vt] || []),
        { final: false, name: "", email: "", contact: "", pkg: "", quoted: 0, contract: 0, notes: "" },
      ],
    });

  const update = (vt, idx, patch) =>
    setVendors({
      ...vendors,
      [vt]: vendors[vt].map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    });

  const remove = (vt, idx) =>
    setVendors({
      ...vendors,
      [vt]: vendors[vt].filter((_, i) => i !== idx),
    });

  return (
    <div className="flex flex-col space-y-6">
      {setup.vendorTypes.map((vt) => (
        <Card key={vt} title={<div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-600" />{vt}</div>}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Final?</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Package</th>
                  <th className="py-2 pr-3">Quoted</th>
                  <th className="py-2 pr-3">Contract</th>
                  <th className="py-2 pr-3">Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(vendors[vt] || []).map((v, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 pr-3">
                      <Select
                        options={["false", "true"]}
                        value={String(v.final)}
                        onChange={(val) => update(vt, idx, { final: val === "true" })}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Input value={v.name} onChange={(e) => update(vt, idx, { name: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <Input value={v.email} onChange={(e) => update(vt, idx, { email: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <Input value={v.contact} onChange={(e) => update(vt, idx, { contact: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <Input value={v.pkg} onChange={(e) => update(vt, idx, { pkg: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <Input type="number" value={v.quoted} onChange={(e) => update(vt, idx, { quoted: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 pr-3">
                      <Input type="number" value={v.contract} onChange={(e) => update(vt, idx, { contract: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 pr-3">
                      <Input value={v.notes} onChange={(e) => update(vt, idx, { notes: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <button className="text-red-500" onClick={() => remove(vt, idx)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between">
            <button onClick={() => addRow(vt)} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">
              Add {vt}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// --- Guests Page ---
function GuestsTab({ setup, guests, setGuests, rsvpBreakdown, mealBreakdown }) {
  const addGuest = () =>
    setGuests([
      ...guests,
      {
        id: Date.now(),
        firstName: "",
        lastName: "",
        role: "",
        tag: "",
        email: "",
        saveDate: "Not sent",
        invite: "Not sent",
        rsvp: "No response",
        plusOneAllowed: "No",
        plusOneName: "",
        meal: "",
        allergies: "",
        notes: "",
      },
    ]);
  const update = (id, patch) =>
    setGuests(guests.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const remove = (id) => setGuests(guests.filter((g) => g.id !== id));

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="RSVP Breakdown">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={rsvpBreakdown} outerRadius={90} label>
                  {rsvpBreakdown.map((e, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Meal Choices">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={mealBreakdown} outerRadius={90} label>
                  {mealBreakdown.map((e, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Guest List">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Tag</th>
                <th className="py-2 pr-3">Save-the-Date</th>
                <th className="py-2 pr-3">Invite</th>
                <th className="py-2 pr-3">RSVP</th>
                <th className="py-2 pr-3">+1 Allowed</th>
                <th className="py-2 pr-3">+1 Name</th>
                <th className="py-2 pr-3">Meal</th>
                <th className="py-2 pr-3">Allergies</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="py-2 pr-3 flex gap-2">
                    <Input
                      value={g.firstName}
                      onChange={(e) => update(g.id, { firstName: e.target.value })}
                      className="w-28"
                    />
                    <Input
                      value={g.lastName}
                      onChange={(e) => update(g.id, { lastName: e.target.value })}
                      className="w-28"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Select
                      options={["", ...setup.roles]}
                      value={g.role}
                      onChange={(v) => update(g.id, { role: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Select
                      options={["", ...setup.guestTags]}
                      value={g.tag}
                      onChange={(v) => update(g.id, { tag: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Select
                      options={setup.saveDateOptions}
                      value={g.saveDate}
                      onChange={(v) => update(g.id, { saveDate: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Select
                      options={setup.inviteOptions}
                      value={g.invite}
                      onChange={(v) => update(g.id, { invite: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Select
                      options={setup.rsvpOptions}
                      value={g.rsvp}
                      onChange={(v) => update(g.id, { rsvp: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Select
                      options={["Yes", "No"]}
                      value={g.plusOneAllowed}
                      onChange={(v) => update(g.id, { plusOneAllowed: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Input
                      value={g.plusOneName || ""}
                      onChange={(e) => update(g.id, { plusOneName: e.target.value })}
                      className="w-32"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Select
                      options={["", ...setup.mealOptions]}
                      value={g.meal}
                      onChange={(v) => update(g.id, { meal: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Input
                      value={g.allergies || ""}
                      onChange={(e) => update(g.id, { allergies: e.target.value })}
                      className="w-32"
                    />
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <button className="text-red-500" onClick={() => remove(g.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-between">
          <button
            onClick={addGuest}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white"
          >
            Add Guest
          </button>
          <div className="text-sm text-gray-500">Total: {guests.length}</div>
        </div>
      </Card>
    </div>
  );
}

// --- Budget, Gifts, and Seating Tabs follow ---
// (They preserve same layout logic and spacing adjustments)

function BudgetTab({setup, budgetPlan, setBudgetPlan, expenses, setExpenses}) {
  const addPlan = ()=> setBudgetPlan([...budgetPlan, {category:"", planned:0}]);
  const updPlan = (i, patch)=> setBudgetPlan(budgetPlan.map((b,idx)=> idx===i? {...b, ...patch} : b));
  const rmPlan = (i)=> setBudgetPlan(budgetPlan.filter((_,idx)=> idx!==i));

  const addExp = ()=> setExpenses([...expenses, { date:new Date().toISOString().slice(0,10), payee:"", type:"", desc:"", amount:0, paid:false }]);
  const updExp = (i, patch)=> setExpenses(expenses.map((e,idx)=> idx===i? {...e, ...patch} : e));
  const rmExp = (i)=> setExpenses(expenses.filter((_,idx)=> idx!==i));

  const totalPlanned = budgetPlan.reduce((s,b)=>s+Number(b.planned||0),0);
  const spent = expenses.filter(e=>e.paid).reduce((s,e)=>s+Number(e.amount||0),0);
  const remaining = Math.max(0, totalPlanned - spent);
  const paidVs = [{name:"Spent", value:spent}, {name:"Remaining", value:remaining}];
  const paidByType = budgetPlan.map(b=> ({ name:b.category || "(uncategorised)", value: expenses.filter(e=>e.type===b.category && e.paid).reduce((s,e)=>s+Number(e.amount||0),0) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
      {/* Left: planned and expenses (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        <Card title="Planned Budget">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Planned</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {budgetPlan.map((b,i)=>(
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3"><Input value={b.category} onChange={e=>updPlan(i,{category:e.target.value})}/></td>
                    <td className="py-2 pr-3"><Input type="number" value={b.planned} onChange={e=>updPlan(i,{planned:Number(e.target.value)})}/></td>
                    <td className="py-2 pr-3 text-right">
                      <button className="text-red-500" onClick={()=>rmPlan(i)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-between">
            <button onClick={addPlan} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Add category</button>
            <div className="text-sm text-gray-500">Total planned: {currency(setup.currency,totalPlanned)}</div>
          </div>
        </Card>

        <Card title="Expenses">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Payee</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Description</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Paid?</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e,i)=>(
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3"><Input type="date" value={e.date} onChange={ev=>updExp(i,{date:ev.target.value})}/></td>
                    <td className="py-2 pr-3"><Input value={e.payee} onChange={ev=>updExp(i,{payee:ev.target.value})}/></td>
                    <td className="py-2 pr-3">
                      <Input list="types" value={e.type} onChange={ev=>updExp(i,{type:ev.target.value})}/>
                    </td>
                    <td className="py-2 pr-3"><Input value={e.desc} onChange={ev=>updExp(i,{desc:ev.target.value})}/></td>
                    <td className="py-2 pr-3"><Input type="number" value={e.amount} onChange={ev=>updExp(i,{amount:Number(ev.target.value)})}/></td>
                    <td className="py-2 pr-3">
                      <Select options={["false","true"]} value={String(e.paid)} onChange={val=>updExp(i,{paid: val==="true"})}/>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <button className="text-red-500" onClick={()=>rmExp(i)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* datalist for "Type" to match budget categories */}
          <datalist id="types">
            {budgetPlan.map((b,i)=>(<option key={i} value={b.category} />))}
          </datalist>

          <div className="mt-3 flex justify-between">
            <button onClick={addExp} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Add expense</button>
            <div className="text-sm text-gray-500">
              Spent: {currency(setup.currency,spent)} | Remaining: {currency(setup.currency,remaining)}
            </div>
          </div>
        </Card>
      </div>

      {/* Right: charts */}
      <div className="space-y-6">
        <Card title="Paid vs Remaining">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={paidVs} outerRadius={90} label>
                  {paidVs.map((e,i)=><Cell key={i} />)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Paid by category">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paidByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}


function GiftsTab({guests}) {
  const [rows, setRows] = usePersistentState("wp_gifts", []);
  const add = ()=> setRows([...rows, { id:Date.now(), guestId:"", guestName:"", gift:"", category:"", value:0, thankyou:"Not Needed", address:"", notes:"" }]);
  const upd = (id, patch)=> setRows(rows.map(r=> r.id===id? {...r, ...patch} : r));
  const rm = (id)=> setRows(rows.filter(r=>r.id!==id));

  const counts = ["Not Needed","Drafted","Sent"].map(s=>({name:s, value: rows.filter(r=>r.thankyou===s).length}));
  const byCat = Object.entries(rows.reduce((m,r)=>{ if(!r.category) return m; m[r.category]=(m[r.category]||0)+1; return m; },{})).map(([name,value])=>({name,value}));

  return (
    <div className="flex flex-col space-y-6 w-full">
      {/* charts on top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Thank you status">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={counts} outerRadius={90} label>
                  {counts.map((e,i)=><Cell key={i} />)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Gift categories">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={byCat} outerRadius={90} label>
                  {byCat.map((e,i)=><Cell key={i} />)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* full-width table */}
      <Card title={<div className="flex items-center gap-2"><Gift className="w-5 h-5 text-indigo-600"/> Gifts & Thank Yous</div>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-3">Guest</th>
                <th className="py-2 pr-3">Gift</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2 pr-3">Thank you</th>
                <th className="py-2 pr-3">Address</th>
                <th className="py-2 pr-3">Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-3">
                    <Input list="guestnames" value={r.guestName} onChange={e=>upd(r.id,{guestName:e.target.value})}/>
                  </td>
                  <td className="py-2 pr-3"><Input value={r.gift} onChange={e=>upd(r.id,{gift:e.target.value})}/></td>
                  <td className="py-2 pr-3"><Input value={r.category} onChange={e=>upd(r.id,{category:e.target.value})}/></td>
                  <td className="py-2 pr-3"><Input type="number" value={r.value} onChange={e=>upd(r.id,{value:Number(e.target.value)})}/></td>
                  <td className="py-2 pr-3">
                    <Select options={["Not Needed","Drafted","Sent"]} value={r.thankyou} onChange={v=>upd(r.id,{thankyou:v})}/>
                  </td>
                  <td className="py-2 pr-3"><Input value={r.address} onChange={e=>upd(r.id,{address:e.target.value})}/></td>
                  <td className="py-2 pr-3"><Input value={r.notes} onChange={e=>upd(r.id,{notes:e.target.value})}/></td>
                  <td className="py-2 pr-3 text-right">
                    <button className="text-red-500" onClick={()=>rm(r.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* share datalist with Seating/Guests for names */}
          <datalist id="guestnames">{guests.map(g=> (<option key={g.id} value={`${g.firstName} ${g.lastName}`}/>))}</datalist>
        </div>
        <div className="mt-3">
          <button onClick={add} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Add gift</button>
        </div>
      </Card>
    </div>
  );
}


function SeatingTab({tables, setTables, seats, setSeats, guests}) {
  const addTable = ()=> setTables([...tables, {name:"", capacity:8, area:""}]);
  const updTable = (i, patch)=> setTables(tables.map((t,idx)=> idx===i? {...t, ...patch} : t));
  const rmTable = (i)=> setTables(tables.filter((_,idx)=> idx!==i));

  const addSeat = ()=> setSeats([...seats, { id:Date.now(), guestName:"", table:"", seatNo:"" }]);
  const updSeat = (id, patch)=> setSeats(seats.map(s=> s.id===id? {...s, ...patch} : s));
  const rmSeat = (id)=> setSeats(seats.filter(s=> s.id!==id));

  const assigned = tables.map(t=> ({ name:t.name, assigned: seats.filter(s=>s.table===t.name).length, capacity: Number(t.capacity||0) }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
      <div className="xl:col-span-2 space-y-6">
        <Card title="Tables">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Capacity</th>
                  <th className="py-2 pr-3">Area</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tables.map((t,i)=>(
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3"><Input value={t.name} onChange={e=>updTable(i,{name:e.target.value})}/></td>
                    <td className="py-2 pr-3"><Input type="number" value={t.capacity} onChange={e=>updTable(i,{capacity:Number(e.target.value)})}/></td>
                    <td className="py-2 pr-3"><Input value={t.area} onChange={e=>updTable(i,{area:e.target.value})}/></td>
                    <td className="py-2 pr-3 text-right">
                      <button className="text-red-500" onClick={()=>rmTable(i)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <button onClick={addTable} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Add table</button>
          </div>
        </Card>

        <Card title="Seating">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Guest</th>
                  <th className="py-2 pr-3">Table</th>
                  <th className="py-2 pr-3">Seat #</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {seats.map(s=> (
                  <tr key={s.id} className="border-t">
                    <td className="py-2 pr-3">
                      <Input list="guestnames" value={s.guestName} onChange={e=>updSeat(s.id,{guestName:e.target.value})}/>
                    </td>
                    <td className="py-2 pr-3">
                      <Input list="tablenames" value={s.table} onChange={e=>updSeat(s.id,{table:e.target.value})}/>
                    </td>
                    <td className="py-2 pr-3">
                      <Input value={s.seatNo} onChange={e=>updSeat(s.id,{seatNo:e.target.value})}/>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <button className="text-red-500" onClick={()=>rmSeat(s.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <datalist id="tablenames">{tables.map((t,i)=>(<option key={i} value={t.name}/>))}</datalist>
            <datalist id="guestnames">{guests.map(g=> (<option key={g.id} value={`${g.firstName} ${g.lastName}`}/>))}</datalist>
          </div>
          <div className="mt-3">
            <button onClick={addSeat} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Add seat</button>
          </div>
        </Card>
      </div>

      <div>
        <Card title="Capacity">
          <div className="space-y-3">
            {assigned.map(a=> (
              <div key={a.name}>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{a.name || "(unnamed table)"}</span>
                  <span>{a.assigned}/{a.capacity}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${a.assigned>a.capacity?"bg-red-500":"bg-indigo-600"}`}
                    style={{width:`${Math.min(100, (a.assigned/(a.capacity||1))*100)}%`}}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}