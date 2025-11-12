// ===== File: src/App.js =====
import React from "react";
import { Routes, Route, NavLink, useNavigate, useLocation, useParams, Link, Navigate } from "react-router-dom";
import { CalendarDays, UserRound, MapPin, Clock, ShieldCheck, Heart, Share2, ArrowLeft, Pencil } from "lucide-react";
import clsx from "clsx";

// ---------------- Auth + App Store (localStorage) ----------------
const StoreContext = React.createContext(null);
const useStore = () => React.useContext(StoreContext);

const LS_KEYS = {
  users: "buddyup_users",
  session: "buddyup_session",
  data: "buddyup_data_v1",
};

function load(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// All events now have descriptions (and some have requirements)
const initialEvents = [
  // --- Social / Cultural ---
  {
    id: "movie-night",
    title: "International Movie Night",
    org: "International Student Society",
    time: "Today, 7:00 PM",
    whenFull: "Today, 7:00 PM - 10:00 PM",
    place: "Student Union Cinema",
    placeFull: "Student Union Cinema, Building A",
    interested: 24,
    tags: ["Social", "Movies", "Cultural"],
    verified: true,
    description:
      "Weekly screening of a beloved international film with English subtitles. Snacks provided, friendly vibes, easy way to meet people who love movies.",
    requirements: ["Must be a registered student", "Bring student ID"]
  },
  {
    id: "board-games-cafe",
    title: "Board Games & Chill",
    org: "Social Club",
    time: "Thu, 6:30 PM",
    place: "Student Hub, Level 2",
    interested: 18,
    tags: ["Social", "Cultural"],
    description:
      "Casual evening of board and card games. Beginners welcome. Bring your favorite game or learn a new one at the shared tables."
  },
  {
    id: "lantern-festival",
    title: "Mini Lantern Festival",
    org: "Cultural Exchange",
    time: "Fri, 7:30 PM",
    place: "Main Lawn",
    interested: 42,
    tags: ["Cultural", "Social"],
    verified: true,
    description:
      "Celebrate light and culture with a mini lantern walk, music, and photo spots. Craft a small lantern on-site or bring one from home."
  },

  // --- Sports / Outdoor ---
  {
    id: "basketball",
    title: "Basketball Pickup Game",
    org: "Intramural Sports Club",
    time: "Tomorrow, 4:00 PM",
    place: "Recreation Center Court 2",
    interested: 12,
    tags: ["Sports", "Beginner-Friendly"],
    description:
      "Friendly pickup runs. No teams needed—just show up and rotate in. Mixed skill levels; bring water and non-marking shoes."
  },
  {
    id: "sunrise-hike",
    title: "Sunrise Mt Coot-tha Hike",
    org: "Outdoor Adventures",
    time: "Sat, 5:15 AM",
    place: "Mt Coot-tha Lookout (carpark)",
    interested: 27,
    tags: ["Outdoor", "Sports"],
    description:
      "Early-bird hike to catch the sunrise over Brisbane. Approx. 6 km return. Wear comfy shoes; optional coffee stop afterwards."
  },
  {
    id: "tennis-social",
    title: "Tennis Social Hit",
    org: "Tennis Society",
    time: "Sun, 3:00 PM",
    place: "Court 5 & 6",
    interested: 20,
    tags: ["Sports", "Beginner-Friendly"],
    description:
      "Rotating doubles and mini-drills for all levels. Racquets available to borrow. Perfect for practice and meeting playing partners."
  },

  // --- Academic / Tech / Career ---
  {
    id: "study-chem",
    title: "Study Group: Chemistry 101",
    org: "Chemistry Study Group",
    time: "Wed, 6:00 PM",
    place: "Library Study Room B",
    interested: 8,
    tags: ["Academic", "Study", "STEM"],
    description:
      "Peer-led session focusing on practice problems and exam tips for CHEM101. Bring notes and questions; whiteboard provided."
  },
  {
    id: "leetcode-night",
    title: "LeetCode Night (Pairs)",
    org: "Programming Society",
    time: "Mon, 6:00 PM",
    place: "CS Building Lab 3",
    interested: 31,
    tags: ["Tech", "Academic", "Study"],
    description:
      "Solve interview-style coding problems in pairs. Short intro, then 2–3 timed rounds with debrief. BYO laptop."
  },
  {
    id: "hack-night",
    title: "Mini Hack Night",
    org: "Developer Student Club",
    time: "Tue, 5:30 PM",
    place: "Innovation Hub",
    interested: 44,
    tags: ["Tech", "Career"],
    verified: true,
    description:
      "Form tiny teams, prototype an idea in 2 hours, and share quick demos. Great for networking and portfolio practice."
  },
  {
    id: "resume-clinic",
    title: "Resume & LinkedIn Clinic",
    org: "Careers & Employability",
    time: "Thu, 2:00 PM",
    place: "Careers Centre",
    interested: 36,
    tags: ["Career", "Academic"],
    description:
      "Drop-in format with short 1:1 feedback from career advisors. Get actionable tips to improve impact and clarity."
  },
  {
    id: "ai-seminar",
    title: "Seminar: Intro to LLMs",
    org: "Data Science Society",
    time: "Fri, 4:00 PM",
    place: "Eng Building 23, Room 201",
    interested: 52,
    tags: ["Tech", "Academic", "STEM"],
    verified: true,
    description:
      "Accessible overview of large language models: what they are, where they’re used, and current limitations. Q&A included."
  },

  // --- Music / Food ---
  {
    id: "open-mic",
    title: "Open-Mic Night",
    org: "Music Society",
    time: "Sat, 7:00 PM",
    place: "Student Bar Stage",
    interested: 29,
    tags: ["Music", "Social", "Cultural"],
    description:
      "Acoustic-friendly open stage. Sing, play, read poetry—or cheer others on. Sign-ups open 30 minutes before start."
  },
  {
    id: "taco-tuesday",
    title: "Taco Tuesday Meetup",
    org: "Foodies Club",
    time: "Tue, 6:30 PM",
    place: "Food Court (stall 4)",
    interested: 33,
    tags: ["Food", "Social"],
    description:
      "Budget tacos and social tables reserved for students. Meet folks from all faculties and trade sauce recommendations."
  },
  {
    id: "coffee-catchup",
    title: "Coffee & Co-working",
    org: "Productivity Circle",
    time: "Daily, 10:00 AM",
    place: "Library Café",
    interested: 11,
    tags: ["Food", "Academic", "Study"],
    description:
      "Low-pressure co-working. 45-minute focus blocks with short stretch breaks. Great for readings or light assignments."
  },

  // --- Volunteering / Community ---
  {
    id: "campus-cleanup",
    title: "Campus Clean-Up Hour",
    org: "Sustainability Club",
    time: "Sun, 10:00 AM",
    place: "Main Lawn Gazebo",
    interested: 22,
    tags: ["Volunteering", "Outdoor"],
    verified: true,
    description:
      "Make a difference with a quick tidy of high-traffic areas. Gloves and bags supplied.",
    requirements: ["Bring water bottle", "Wear closed shoes"]
  },
  {
    id: "charity-bake",
    title: "Charity Bake Sale Prep",
    org: "Community Club",
    time: "Fri, 3:00 PM",
    place: "Kitchen Lab 1",
    interested: 14,
    tags: ["Volunteering", "Food"],
    description:
      "Bake cookies and cupcakes to raise funds for local orgs. Ingredients provided; recipe cards available."
  },

  // --- Language / Study ---
  {
    id: "language-exchange",
    title: "Language Exchange (RU/EN)",
    org: "Language Society",
    time: "Wed, 5:30 PM",
    place: "Humanities Lounge",
    interested: 19,
    tags: ["Cultural", "Social"],
    description:
      "Casual language tables alternating English and Russian. Great for practice and new friends."
  },
  {
    id: "quiet-study",
    title: "Quiet Study + Accountability",
    org: "Study Buddies",
    time: "Weekdays, 4:00 PM",
    place: "Library Silent Area C",
    interested: 9,
    tags: ["Academic", "Study"],
    description:
      "Phones on silent, goals set at the start, quick check-out at the end. Perfect for getting through readings."
  },
];

function StoreProvider({ children }) {
  // Users and session
  const [users, setUsers] = React.useState(() => load(LS_KEYS.users, []));
  const [session, setSession] = React.useState(() => load(LS_KEYS.session, null));
  const currentUser = React.useMemo(
    () => users.find(u => u.id === session?.userId) || null,
    [users, session]
  );

  // Per-user app data (favorites + event posts)
  const [data, setData] = React.useState(() => load(LS_KEYS.data, {}));
  const ensureUserData = (userId) => data[userId] || { favorites: [], posts: {} };

  const events = initialEvents;

  // persist
  React.useEffect(() => save(LS_KEYS.users, users), [users]);
  React.useEffect(() => save(LS_KEYS.session, session), [session]);
  React.useEffect(() => save(LS_KEYS.data, data), [data]);

  // -------- auth actions --------
  const signUp = ({ firstName, lastName, email, password, year, degree }) => {
    if (!email || !password) throw new Error("Email and password required");
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("An account with this email already exists");
    const user = { id: crypto.randomUUID(), firstName, lastName, email, password, year, degree };
    setUsers(prev => [...prev, user]);
    setData(prev => ({ ...prev, [user.id]: ensureUserData(user.id) }));
    setSession({ userId: user.id });
    return user;
  };

  const logIn = (email, password) => {
    const user = users.find(
      u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Invalid email or password");
    setSession({ userId: user.id });
    return user;
  };

  const logOut = () => { setSession(null); };

  // -------- app data actions --------
  const toggleFavorite = (eventId) => {
    if (!currentUser) return;
    setData(prev => {
      const ud = ensureUserData(currentUser.id);
      const favorites = new Set(ud.favorites);
      favorites.has(eventId) ? favorites.delete(eventId) : favorites.add(eventId);
      return { ...prev, [currentUser.id]: { ...ud, favorites: Array.from(favorites) } };
    });
  };

  const addPost = (eventId, userName, text) => {
    if (!currentUser) return;
    setData(prev => {
      const ud = ensureUserData(currentUser.id);
      const posts = { ...ud.posts };
      posts[eventId] = [...(posts[eventId] || []), { id: crypto.randomUUID(), user: userName, text, ts: Date.now() }];
      return { ...prev, [currentUser.id]: { ...ud, posts } };
    });
  };

  // -------- derived --------
  const favorites = new Set(currentUser ? ensureUserData(currentUser.id).favorites : []);
  const posts = currentUser ? ensureUserData(currentUser.id).posts : {};

  const value = {
    events, users, currentUser,
    signUp, logIn, logOut,
    favorites, toggleFavorite,
    posts, addPost
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ----------------- UI Helpers -----------------
const Button = ({ children, className, ...props }) => (
  <button {...props} className={clsx("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-medium transition bg-indigo-600 hover:bg-indigo-500 text-white", className)}>
    {children}
  </button>
);

const Section = ({ title, children }) => (
  <section className="mt-6">{title && <h2 className="text-zinc-200 text-lg font-semibold mb-3">{title}</h2>}{children}</section>
);

const Tag = ({ children, tone = "slate" }) => (
  <span className={clsx(
    "inline-flex items-center rounded-full text-xs px-2.5 py-1 mr-2 mb-2",
    tone === "slate" && "bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700",
    tone === "indigo" && "bg-indigo-600/15 text-indigo-300 ring-1 ring-indigo-700/40",
    tone === "green" && "bg-emerald-600/15 text-emerald-300 ring-1 ring-emerald-700/40"
  )}>{children}</span>
);

const Card = ({ children, className, onClick }) => (
  <div onClick={onClick} className={clsx("rounded-2xl bg-zinc-900/70 shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)] ring-1 ring-zinc-800 p-5", className)}>{children}</div>
);

const Layout = ({ children, title }) => (
  <div className="min-h-screen bg-zinc-950 text-zinc-300">
    <div className="mx-auto max-w-md pb-24 px-4">
      {title && (<h1 className="pt-8 text-2xl font-semibold text-zinc-100">{title}</h1>)}
      {children}
    </div>
    <BottomNav />
  </div>
);

// ----------------- Components & Pages -----------------
const BottomNav = () => {
  const location = useLocation();
  const nav = [
    { to: "/", icon: CalendarDays, label: "Events" },
    { to: "/profile", icon: UserRound, label: "Profile" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
      <ul className="mx-auto max-w-md grid grid-cols-2">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <li key={to} className="text-center">
              <NavLink to={to} className="flex flex-col items-center py-3 text-sm">
                <Icon className={clsx("h-5 w-5", active ? "text-indigo-400" : "text-zinc-400")} />
                <span className={clsx("mt-1", active ? "text-indigo-400" : "text-zinc-400")}>{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const EventCard = ({ ev }) => {
  const navigate = useNavigate();
  return (
    <Card className="mb-4 cursor-pointer" onClick={() => navigate(`/event/${ev.id}`)}>
      <h3 className="text-zinc-100 text-lg font-medium">{ev.title}</h3>
      <p className="text-zinc-400 text-sm">{ev.org}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-zinc-300"><Clock className="h-4 w-4 text-indigo-400" /><span>{ev.time}</span></div>
        <div className="flex items-center gap-2 text-zinc-300"><MapPin className="h-4 w-4 text-indigo-400" /><span>{ev.place}</span></div>
      </div>
      <div className="mt-3">{ev.tags?.map((t) => (<Tag key={t} tone={t === "Social" || t === "Movies" ? "indigo" : "slate"}>{t}</Tag>))}</div>
      {ev.description && <p className="mt-3 text-sm text-zinc-400 line-clamp-2">{ev.description}</p>}
    </Card>
  );
};

function EventsPage() {
  const [tab, setTab] = React.useState("All");
  const { events } = useStore();
  const tabs = ["All", "Social", "Sports", "Academic", "Cultural", "Tech", "Music", "Food", "Volunteering", "Career", "Outdoor", "Movies", "STEM"];
  return (
    <Layout title="Upcoming Events">
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx("px-3 py-1.5 rounded-full text-sm border", tab === t ? "bg-indigo-600/20 text-indigo-300 border-indigo-600/40" : "bg-zinc-900 text-zinc-300 border-zinc-800")}>{t}</button>
        ))}
      </div>
      <div className="mt-4">
        {events.filter((e) => tab === "All" || e.tags?.includes(tab)).map((ev) => (<EventCard key={ev.id} ev={ev} />))}
      </div>
    </Layout>
  );
}

function EventDetailsPage({ id }) {
  const navigate = useNavigate();
  const { events, favorites, toggleFavorite } = useStore();
  const ev = events.find(e => e.id === id) || events[0];
  const isFav = favorites.has(ev.id);

  return (
    <Layout>
      <div className="flex items-center gap-3 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-zinc-900 ring-1 ring-zinc-800"><ArrowLeft className="h-5 w-5 text-zinc-300" /></button>
        <h1 className="text-xl font-semibold text-zinc-100">Event Details</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => toggleFavorite(ev.id)} className="p-2 rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
            <Heart className={clsx("h-5 w-5", isFav ? "text-red-500 fill-red-500" : "text-zinc-300")} />
          </button>
          <button className="p-2 rounded-xl bg-zinc-900 ring-1 ring-zinc-800"><Share2 className="h-5 w-5" /></button>
        </div>
      </div>

      <Card className="mt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-zinc-100">{ev.title}</h2>
          {ev.verified && (
            <Tag tone="green">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" />Verified</span>
            </Tag>
          )}
        </div>
        <p className="text-sm text-zinc-400">{ev.org}</p>
        <div className="mt-3 space-y-2 text-sm text-zinc-300">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-400" /><span>{ev.whenFull || ev.time}</span></div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-400" /><span>{ev.placeFull || ev.place}</span></div>
        </div>
        {ev.description && <p className="mt-4 text-sm text-zinc-300 leading-6">{ev.description}</p>}
        {ev.requirements?.length ? (
          <div className="mt-3">
            <p className="text-sm text-zinc-400 mb-1">Requirements:</p>
            <ul className="list-disc pl-5 text-sm text-zinc-300">
              {ev.requirements.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        ) : null}
      </Card>

      <Section title="Event Thread">
        <PostComposer eventId={ev.id} />
        <div className="mt-3"><PostList eventId={ev.id} /></div>
      </Section>
    </Layout>
  );
}

function PostComposer({ eventId }) {
  const { addPost, currentUser } = useStore();
  const [text, setText] = React.useState("");
  return (
    <Card>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
        placeholder="Ask a question, share info, or invite others to join…"
      />
      <div className="mt-2 text-right">
        <Button
          onClick={() => {
            if (!currentUser) { alert("Please log in to post."); return; }
            if (text.trim()) { addPost(eventId, currentUser ? `${currentUser.firstName}` : "You", text.trim()); setText(""); }
          }}
        >
          Post
        </Button>
      </div>
    </Card>
  );
}

function PostList({ eventId }) {
  const { posts } = useStore();
  const items = posts[eventId] || [];
  return (
    <div className="space-y-3">
      {items.map(p => (
        <Card key={p.id} className="text-sm">
          <div className="text-zinc-400 text-xs mb-1">{p.user}</div>
          <div className="text-zinc-200 leading-6">{p.text}</div>
        </Card>
      ))}
      {items.length === 0 && <Card className="text-sm text-zinc-400">No posts yet. Be the first to start the thread!</Card>}
    </div>
  );
}

function ProfilePage() {
  const { favorites, events, currentUser, logOut } = useStore();
  const saved = events.filter(e => favorites.has(e.id));
  const navigate = useNavigate();

  return (
    <Layout title="Profile">
      <Card className="mt-4">
        <div className="h-14 w-14 rounded-full bg-indigo-900/30 grid place-items-center text-indigo-300 font-semibold">
          {currentUser ? (currentUser.firstName?.[0] || "?") : "?"}
        </div>
        <div className="mt-3">
          <h3 className="text-zinc-100 font-semibold">{currentUser ? `${currentUser.firstName} ${currentUser.lastName || ""}` : "Guest"}</h3>
          <p className="text-zinc-400 text-sm">{currentUser?.email || "Not logged in"}</p>
        </div>
        <button onClick={() => navigate("/signup")} className="mt-3 inline-flex items-center gap-2 rounded-2xl ring-1 ring-indigo-700/40 text-indigo-300 px-3 py-1.5">
          <Pencil className="h-4 w-4" />Edit Profile
        </button>
      </Card>

      <Section title="Saved Events">
        {saved.length ? (
          <div className="space-y-3">
            {saved.map(ev => (
              <Card key={ev.id}>
                <div className="text-zinc-100 font-medium">{ev.title}</div>
                <div className="text-sm text-zinc-400">{ev.time} · {ev.place}</div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>No saved events yet. Tap the heart on an event to save it here.</Card>
        )}
      </Section>

      <Section title="Help & Support">
        <Card>
          <p className="text-sm text-zinc-300">Need help? Quick tips:</p>
          <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-zinc-300">
            <li>Meet in public campus locations.</li>
            <li>Use in-chat safety tools to flag concerns.</li>
            <li>Avoid sharing personal info until you’re comfortable.</li>
          </ul>
          <div className="mt-3 text-sm">Contact: <a className="text-indigo-300" href="mailto:support@buddyup.app">support@buddyup.app</a></div>
        </Card>
      </Section>

      <Section title=" ">
        <Button onClick={() => { logOut(); navigate("/login"); }} className="w-full bg-red-600 hover:bg-red-500 mt-6">Log Out</Button>
      </Section>
    </Layout>
  );
}

// ------------- Auth pages -------------
function SignUpPage() {
  const { signUp } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ firstName: "", lastName: "", email: "", password: "", year: "", degree: "" });
  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const onSubmit = (e) => {
    e.preventDefault();
    try { signUp(form); navigate("/"); } catch (err) { alert(err.message); }
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-md px-4 pb-24">
        <h1 className="text-center pt-10 text-3xl font-semibold text-indigo-300">Create your account</h1>
        <Card className="mt-8">
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm">First Name</label><input value={form.firstName} onChange={onChange("firstName")} className="mt-2 w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 outline-none" placeholder="Enter your first name" /></div>
              <div><label className="block text-sm">Surname</label><input value={form.lastName} onChange={onChange("lastName")} className="mt-2 w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 outline-none" placeholder="Enter your surname" /></div>
            </div>
            <label className="block text-sm mt-4">University Email</label>
            <input type="email" value={form.email} onChange={onChange("email")} className="mt-2 w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 outline-none" placeholder="you@uni.edu.au" />
            <label className="block text-sm mt-4">Password</label>
            <input type="password" value={form.password} onChange={onChange("password")} className="mt-2 w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 outline-none" placeholder="••••••••" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <input value={form.year} onChange={onChange("year")} className="rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2" placeholder="Year (e.g., 1st)" />
              <input value={form.degree} onChange={onChange("degree")} className="rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2" placeholder="Degree" />
            </div>
            <Button type="submit" className="w-full mt-5">Continue</Button>
          </form>
          <p className="text-sm text-zinc-400 mt-3">By continuing you agree to our campus safety guidelines.</p>
        </Card>
        <p className="text-center text-sm mt-4">Already have an account? <Link to="/login" className="text-indigo-300">Log in</Link></p>
      </div>
      <BottomNav />
    </div>
  );
}

function LoginPage() {
  const { logIn } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const onSubmit = (e) => { e.preventDefault(); try { logIn(email, password); navigate("/"); } catch (err) { alert(err.message); } };
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-md px-4 pb-24">
        <h1 className="text-center pt-10 text-3xl font-semibold text-indigo-300">Welcome back</h1>
        <Card className="mt-8">
          <form onSubmit={onSubmit}>
            <label className="block text-sm">University Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 outline-none" placeholder="you@uni.edu.au" />
            <label className="block text-sm mt-4">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 outline-none" placeholder="••••••••" />
            <Button type="submit" className="w-full mt-5">Log In</Button>
          </form>
          <p className="text-sm text-zinc-400 mt-3">Don’t have an account? <Link to="/signup" className="text-indigo-300">Sign up</Link></p>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}

// ------------- Router wrappers -------------
function EventDetailsWrapper() { const { id } = useParams(); return <EventDetailsPage id={id} /> }
function RequireAuth({ children }) { const { currentUser } = useStore(); return currentUser ? children : <Navigate to="/login" replace /> }

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<EventsPage />} />
        <Route path="/event/:id" element={<EventDetailsWrapper />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </StoreProvider>
  );
}