// ===== File: src/App.js =====
import React from "react";
import { Routes, Route, NavLink, useNavigate, useLocation, useParams, Link, Navigate } from "react-router-dom";
import { CalendarDays, Users2, UserRound, MapPin, Clock, ShieldCheck, Heart, Share2, ArrowLeft, ChevronRight, MessageCircle, Pencil } from "lucide-react";
import clsx from "clsx";

// ---------------- Auth + App Store (localStorage) ----------------
const StoreContext = React.createContext(null);
const useStore = () => React.useContext(StoreContext);

const LS_KEYS = {
  users: "buddyup_users",
  session: "buddyup_session",
  data: "buddyup_data_v1",
  queue: "buddyup_queue_v1",   // global queue (per browser)
};

const safeName = (u) => (u?.firstName || "You");

function load(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

const initialEvents = [
  // --- Social / Cultural ---
  {
    id: "movie-night", title: "International Movie Night", org: "International Student Society",
    time: "Today, 7:00 PM", whenFull: "Today, 7:00 PM - 10:00 PM",
    place: "Student Union Cinema", placeFull: "Student Union Cinema, Building A",
    interested: 24, tags: ["Social", "Movies", "Cultural"], verified: true,
    description: "Join us for a cozy movie night featuring films from around the world!"
  },

  {
    id: "board-games-cafe", title: "Board Games & Chill", org: "Social Club",
    time: "Thu, 6:30 PM", place: "Student Hub, Level 2",
    interested: 18, tags: ["Social", "Cultural"]
  },

  {
    id: "lantern-festival", title: "Mini Lantern Festival", org: "Cultural Exchange",
    time: "Fri, 7:30 PM", place: "Main Lawn",
    interested: 42, tags: ["Cultural", "Social"], verified: true
  },

  // --- Sports / Outdoor ---
  {
    id: "basketball", title: "Basketball Pickup Game", org: "Intramural Sports Club",
    time: "Tomorrow, 4:00 PM", place: "Recreation Center Court 2",
    interested: 12, tags: ["Sports", "Beginner-Friendly"]
  },

  {
    id: "sunrise-hike", title: "Sunrise Mt Coot-tha Hike", org: "Outdoor Adventures",
    time: "Sat, 5:15 AM", place: "Mt Coot-tha Lookout (carpark)",
    interested: 27, tags: ["Outdoor", "Sports"]
  },

  {
    id: "tennis-social", title: "Tennis Social Hit", org: "Tennis Society",
    time: "Sun, 3:00 PM", place: "Court 5 & 6",
    interested: 20, tags: ["Sports", "Beginner-Friendly"]
  },

  // --- Academic / Tech / Career ---
  {
    id: "study-chem", title: "Study Group: Chemistry 101", org: "Chemistry Study Group",
    time: "Wed, 6:00 PM", place: "Library Study Room B",
    interested: 8, tags: ["Academic", "Study", "STEM"]
  },

  {
    id: "leetcode-night", title: "LeetCode Night (Pairs)", org: "Programming Society",
    time: "Mon, 6:00 PM", place: "CS Building Lab 3",
    interested: 31, tags: ["Tech", "Academic", "Study"]
  },

  {
    id: "hack-night", title: "Mini Hack Night", org: "Developer Student Club",
    time: "Tue, 5:30 PM", place: "Innovation Hub",
    interested: 44, tags: ["Tech", "Career"], verified: true,
    description: "Form small teams and prototype ideas in 2 hours."
  },

  {
    id: "resume-clinic", title: "Resume & LinkedIn Clinic", org: "Careers & Employability",
    time: "Thu, 2:00 PM", place: "Careers Centre",
    interested: 36, tags: ["Career", "Academic"]
  },

  {
    id: "ai-seminar", title: "Seminar: Intro to LLMs", org: "Data Science Society",
    time: "Fri, 4:00 PM", place: "Eng Building 23, Room 201",
    interested: 52, tags: ["Tech", "Academic", "STEM"], verified: true
  },

  // --- Music / Food ---
  {
    id: "open-mic", title: "Open-Mic Night", org: "Music Society",
    time: "Sat, 7:00 PM", place: "Student Bar Stage",
    interested: 29, tags: ["Music", "Social", "Cultural"]
  },

  {
    id: "taco-tuesday", title: "Taco Tuesday Meetup", org: "Foodies Club",
    time: "Tue, 6:30 PM", place: "Food Court (stall 4)",
    interested: 33, tags: ["Food", "Social"]
  },

  {
    id: "coffee-catchup", title: "Coffee & Co-working", org: "Productivity Circle",
    time: "Daily, 10:00 AM", place: "Library Café",
    interested: 11, tags: ["Food", "Academic", "Study"]
  },

  // --- Volunteering / Community ---
  {
    id: "campus-cleanup", title: "Campus Clean-Up Hour", org: "Sustainability Club",
    time: "Sun, 10:00 AM", place: "Main Lawn Gazebo",
    interested: 22, tags: ["Volunteering", "Outdoor"], verified: true,
    requirements: ["Bring water bottle", "Wear closed shoes"]
  },

  {
    id: "charity-bake", title: "Charity Bake Sale Prep", org: "Community Club",
    time: "Fri, 3:00 PM", place: "Kitchen Lab 1",
    interested: 14, tags: ["Volunteering", "Food"]
  },

  // --- Language / Culture / Low-pressure study ---
  {
    id: "language-exchange", title: "Language Exchange (RU/EN)", org: "Language Society",
    time: "Wed, 5:30 PM", place: "Humanities Lounge",
    interested: 19, tags: ["Cultural", "Social"]
  },

  {
    id: "quiet-study", title: "Quiet Study + Accountability", org: "Study Buddies",
    time: "Weekdays, 4:00 PM", place: "Library Silent Area C",
    interested: 9, tags: ["Academic", "Study"]
  },
];

function StoreProvider({ children }) {
  // Users and session
  const [users, setUsers] = React.useState(() => load(LS_KEYS.users, []));
  const [session, setSession] = React.useState(() => load(LS_KEYS.session, null));
  const currentUser = React.useMemo(() => users.find(u => u.id === session?.userId) || null, [users, session]);

  // Per-user app data
  const [data, setData] = React.useState(() => load(LS_KEYS.data, {}));
  const ensureUserData = (userId) => data[userId] || { favorites: [], posts: {}, groups: [] };

  // Global per-browser matching queue
  const [queue, setQueue] = React.useState(() => load(LS_KEYS.queue, {
    /* shape: { [eventId]: [{ userId, name, requested:{min,max}, enqueuedAt }] } */
  }));

  const events = initialEvents;

  // persist
  React.useEffect(() => save(LS_KEYS.users, users), [users]);
  React.useEffect(() => save(LS_KEYS.session, session), [session]);
  React.useEffect(() => save(LS_KEYS.data, data), [data]);
  React.useEffect(() => save(LS_KEYS.queue, queue), [queue]);

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
    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
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

  const createGroupFromEvent = (eventId, sizeLabel = "3-4") => {
    if (!currentUser) return null;
    const newGroup = {
      id: crypto.randomUUID(),
      eventId,
      title: `Group (${sizeLabel}) – ${eventId}`,
      members: [currentUser.firstName || "You"],
      messages: [{ id: crypto.randomUUID(), user: "System", text: "Group created. Say hi!", ts: Date.now() }]
    };
    setData(prev => {
      const ud = ensureUserData(currentUser.id);
      return { ...prev, [currentUser.id]: { ...ud, groups: [newGroup, ...ud.groups] } };
    });
    return newGroup.id;
  };

  const addMessage = (groupId, userName, text) => {
    if (!currentUser) return;
    setData(prev => {
      const ud = ensureUserData(currentUser.id);
      const groups = ud.groups.map(g => g.id === groupId ? { ...g, messages: [...g.messages, { id: crypto.randomUUID(), user: userName, text, ts: Date.now() }] } : g);
      return { ...prev, [currentUser.id]: { ...ud, groups } };
    });
  };

  // --------- MATCHING (no-backend, localStorage) ---------
  const groupBounds = (sizeLabel) => sizeLabel === "2" ? { min: 2, max: 2 } : { min: 3, max: 4 };

  const enqueueForEvent = (eventId, sizeLabel) => {
    if (!currentUser) throw new Error("You must be logged in to find a buddy.");
    const { min, max } = groupBounds(sizeLabel);
    setQueue(prev => {
      const list = [...(prev[eventId] || [])];
      if (!list.some(q => q.userId === currentUser.id)) {
        list.push({ userId: currentUser.id, name: safeName(currentUser), requested: { min, max }, enqueuedAt: Date.now() });
      }
      return { ...prev, [eventId]: list.sort((a, b) => a.enqueuedAt - b.enqueuedAt) };
    });
  };

  const cancelQueue = (eventId) => {
    if (!currentUser) return;
    setQueue(prev => {
      const list = (prev[eventId] || []).filter(q => q.userId !== currentUser.id);
      const next = { ...prev, [eventId]: list };
      if (list.length === 0) delete next[eventId];
      return next;
    });
  };

  // Try to form a group for an event. Strategy: if any waiting user wants 3+, make a 3; else make a pair (2).
  const tryMatch = (eventId) => {
    const list = queue[eventId] || [];
    if (list.length === 0) return null;

    const anyWants3 = list.some(q => q.requested.min >= 3);
    const targetSize = anyWants3 ? 3 : 2;

    if (list.length < targetSize) return null;

    const selected = list.slice(0, targetSize);
    const memberIds = selected.map(s => s.userId);
    const memberNames = selected.map(s => s.name);

    const newGroup = {
      id: crypto.randomUUID(),
      eventId,
      title: `Group (${targetSize}) – ${eventId}`,
      members: memberNames,
      messages: [{ id: crypto.randomUUID(), user: "System", text: "Group created. Say hi!", ts: Date.now() }]
    };

    // write group into each selected user's "groups"
    setData(prev => {
      const next = { ...prev };
      for (const uid of memberIds) {
        const ud = (next[uid] || { favorites: [], posts: {}, groups: [] });
        next[uid] = { ...ud, groups: [newGroup, ...(ud.groups || [])] };
      }
      return next;
    });

    // remove matched users from queue
    setQueue(prev => {
      const remaining = (prev[eventId] || []).filter(q => !memberIds.includes(q.userId));
      const next = { ...prev, [eventId]: remaining };
      if (remaining.length === 0) delete next[eventId];
      return next;
    });

    return newGroup.id;
  };

  const isQueued = (eventId) =>
    currentUser ? (queue[eventId] || []).some(q => q.userId === currentUser.id) : false;

  // -------- derived --------
  const favorites = new Set(currentUser ? ensureUserData(currentUser.id).favorites : []);
  const posts = currentUser ? ensureUserData(currentUser.id).posts : {};
  const groups = currentUser ? ensureUserData(currentUser.id).groups : [];

  const value = {
    events, users, currentUser, signUp, logIn, logOut,
    favorites, toggleFavorite, posts, addPost, groups, addMessage, createGroupFromEvent,
    // matching
    queue, enqueueForEvent, cancelQueue, tryMatch, isQueued
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
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
  const nav = [{ to: "/", icon: CalendarDays, label: "Events" }, { to: "/matches", icon: Users2, label: "Matches" }, { to: "/profile", icon: UserRound, label: "Profile" }];
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
      <ul className="mx-auto max-w-md grid grid-cols-3">
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
  const { isQueued } = useStore();
  const queued = isQueued(ev.id);
  return (
    <Card className="mb-4 cursor-pointer" onClick={() => navigate(`/event/${ev.id}`)}>
      <h3 className="text-zinc-100 text-lg font-medium">{ev.title}</h3>
      <p className="text-zinc-400 text-sm">{ev.org}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-zinc-300"><Clock className="h-4 w-4 text-indigo-400" /><span>{ev.time}</span></div>
        <div className="flex items-center gap-2 text-zinc-300"><MapPin className="h-4 w-4 text-indigo-400" /><span>{ev.place}</span></div>
      </div>
      <div className="mt-3">{ev.tags?.map((t) => (<Tag key={t} tone={t === "Social" || t === "Movies" ? "indigo" : "slate"}>{t}</Tag>))}</div>
      {queued && <div className="mt-2 text-xs text-indigo-300">You’re waiting to be matched</div>}
    </Card>
  );
};

function EventsPage() {
  const [tab, setTab] = React.useState("All");
  const { events } = useStore();
  const tabs = ["All", "Social", "Sports", "Academic", "Cultural", "Tech", "Music", "Food", "Volunteering", "Career", "Outdoor"];
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
  const { events, favorites, toggleFavorite, currentUser,
    enqueueForEvent, cancelQueue, tryMatch, isQueued } = useStore();

  const ev = events.find(e => e.id === id) || events[0];
  const [groupSize, setGroupSize] = React.useState("3-4");
  const isFav = favorites.has(ev.id);
  const queued = isQueued(ev.id);

  // Optional: auto-check matching every 3s while queued
  React.useEffect(() => {
    if (!queued) return;
    const t = setInterval(() => {
      const gid = tryMatch(ev.id);
      if (gid) {
        clearInterval(t);
        navigate(`/matches#${gid}`);
      }
    }, 3000);
    return () => clearInterval(t);
  }, [queued, ev.id, tryMatch, navigate]);

  return (
    <Layout>
      <div className="flex items-center gap-3 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-zinc-900 ring-1 ring-zinc-800"><ArrowLeft className="h-5 w-5 text-zinc-300" /></button>
        <h1 className="text-xl font-semibold text-zinc-100">Event Details</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => toggleFavorite(ev.id)} className="p-2 rounded-xl bg-zinc-900 ring-1 ring-zinc-800"><Heart className={clsx("h-5 w-5", isFav ? "text-red-500 fill-red-500" : "text-zinc-300")} /></button>
          <button className="p-2 rounded-xl bg-zinc-900 ring-1 ring-zinc-800"><Share2 className="h-5 w-5" /></button>
        </div>
      </div>

      <Card className="mt-4">
        <div className="flex items-center gap-2"><h2 className="text-lg font-medium text-zinc-100">{ev.title}</h2>{ev.verified && (<Tag tone="green"><span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" />Verified</span></Tag>)}</div>
        <p className="text-sm text-zinc-400">{ev.org}</p>
        <div className="mt-3 space-y-2 text-sm text-zinc-300">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-400" /><span>{ev.whenFull || ev.time}</span></div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-400" /><span>{ev.placeFull || ev.place}</span></div>
        </div>
      </Card>

      <Section title="Find Your Buddy">
        <div className="space-y-3">
          <Card className={clsx("flex items-center justify-between", groupSize === "2" && "ring-indigo-600/50")}>
            <div>
              <p className="text-zinc-100 font-medium">Go as a Pair (2 people)</p>
              <p className="text-sm text-zinc-400">Find one buddy to attend with</p>
            </div>
            <input type="radio" name="g" checked={groupSize === "2"} onChange={() => setGroupSize("2")} />
          </Card>

          <Card className={clsx("flex items-center justify-between", groupSize === "3-4" && "ring-indigo-600/50")}>
            <div>
              <p className="text-zinc-100 font-medium">Join a Small Group (3-4 people)</p>
              <p className="text-sm text-zinc-400">Connect with a small group of students</p>
            </div>
            <input type="radio" name="g" checked={groupSize === "3-4"} onChange={() => setGroupSize("3-4")} />
          </Card>

          {!queued ? (
            <Button
              onClick={() => {
                if (!currentUser) { alert("Please log in first."); return; }
                enqueueForEvent(ev.id, groupSize);
                const gid = tryMatch(ev.id); // attempt immediate match
                if (gid) navigate(`/matches#${gid}`);
                else alert("You’re in the queue. We’ll match you when enough people join.");
              }}
              className="w-full mt-1"
            >
              Find a Buddy <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const gid = tryMatch(ev.id);
                  if (gid) navigate(`/matches#${gid}`);
                  else alert("Still waiting for more people…");
                }}
                className="flex-1 mt-1"
              >
                Check for Match
              </Button>
              <Button
                onClick={() => cancelQueue(ev.id)}
                className="flex-1 mt-1 bg-zinc-800 hover:bg-zinc-700"
              >
                Cancel Waiting
              </Button>
            </div>
          )}

          {!currentUser && <p className="text-xs text-zinc-400">Tip: Log in to queue and chat.</p>}
        </div>
      </Section>

      <Section title="Event Thread">
        <PostComposer eventId={ev.id} />
        <div className="mt-3"><PostList eventId={ev.id} /></div>
      </Section>
    </Layout>
  );
}

function Chat({ groupId }) {
  const { groups, addMessage, currentUser } = useStore();
  const group = groups.find(g => g.id === groupId);
  const [text, setText] = React.useState("");
  if (!group) return <Card>Group not found.</Card>;
  return (
    <Card className="mt-4">
      <div className="space-y-3 max-h-64 overflow-auto pr-1">
        {group.messages.map(m => (
          <div key={m.id} className={clsx("flex", m.user === (currentUser?.firstName || "You") ? "justify-end" : "justify-start")}>
            <div className={clsx("px-3 py-2 rounded-xl text-sm", m.user === (currentUser?.firstName || "You") ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-200")}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 text-sm outline-none placeholder:text-zinc-500" placeholder="Type a message…" />
        <button
          onClick={() => { if (text.trim()) { addMessage(groupId, currentUser?.firstName || "You", text.trim()); setText(""); } }}
          className="p-2 rounded-xl bg-indigo-600 text-white"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}

function PostComposer({ eventId }) {
  const { addPost, currentUser } = useStore();
  const [text, setText] = React.useState("");
  return (
    <Card>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full resize-none rounded-xl bg-zinc-900 ring-1 ring-zinc-800 px-3 py-2 text-sm outline-none placeholder:text-zinc-500" placeholder="Ask a question or invite others to join…" />
      <div className="mt-2 text-right">
        <Button onClick={() => { if (text.trim()) { addPost(eventId, currentUser ? `${currentUser.firstName}` : "You", text.trim()); setText(""); } }}>Post</Button>
      </div>
    </Card>
  );
}

function PostList({ eventId }) {
  const { posts } = useStore(); const items = posts[eventId] || [];
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

function MatchesPage() {
  const { groups } = useStore();
  return (
    <Layout title="Your Matches">
      <div className="space-y-4 mt-4">
        {groups.map(g => (
          <div key={g.id} id={g.id}>
            <Card className="mb-2">
              <div className="text-zinc-100 font-medium">{g.title}</div>
              <div className="text-sm text-zinc-400">Members: {g.members.join(", ")}</div>
            </Card>
            <Chat groupId={g.id} />
          </div>
        ))}
        {groups.length === 0 && (
          <Card className="text-center py-8">
            No matches yet. Join an event and tap <span className="font-medium">Find a Buddy</span>.
          </Card>
        )}
      </div>
    </Layout>
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
            <li>Toggle discovery in <span className="font-medium">Public Profile</span>.</li>
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

function OnboardingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-md px-4 pb-10">
        <h1 className="text-center pt-10 text-3xl font-semibold text-indigo-300">Welcome to BuddyUp!</h1>
        <p className="text-center text-zinc-400 mt-2">Quick preferences (you can change later)</p>
        <Card className="mt-10 p-6">
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl ring-1 ring-zinc-700 py-2">Movies</button>
            <button className="rounded-xl ring-1 ring-zinc-700 py-2">Sports</button>
            <button className="rounded-xl ring-1 ring-zinc-700 py-2">Study</button>
            <button className="rounded-xl ring-1 ring-zinc-700 py-2">Social</button>
          </div>
          <Button onClick={() => navigate("/")} className="w-full mt-6">Continue</Button>
        </Card>
      </div>
      <BottomNav />
    </div>
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
        <Route path="/matches" element={<RequireAuth><MatchesPage /></RequireAuth>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    </StoreProvider>
    
  );
}