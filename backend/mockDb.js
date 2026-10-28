import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'demo_data.json');

// Default initial dataset
const hash = (pw) => bcrypt.hashSync(pw, 10);

const defaultData = {
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@test.com",
      password: hash("password123"),
      role: "admin",
      is_verified: true,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 2,
      name: "John Doe",
      email: "user@test.com",
      password: hash("password123"),
      role: "user",
      is_verified: true,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 3,
      name: "Alice Smith",
      email: "alice@test.com",
      password: hash("password123"),
      role: "user",
      is_verified: true,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 4,
      name: "Bob Johnson",
      email: "bob@test.com",
      password: hash("password123"),
      role: "user",
      is_verified: true,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  clubs: [
    {
      id: 1,
      name: "Coding & Algorithms Club",
      description: "Competitive coding, hackathons, open source, and software engineering workshops.",
      password: hash("club123"),
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 2,
      name: "Robotics & AI Club",
      description: "Autonomous robotics, hardware prototyping, drones, and machine learning research.",
      password: hash("club123"),
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: 3,
      name: "Design & Arts Society",
      description: "UI/UX design, visual branding, creative writing, animation, and photography.",
      password: hash("club123"),
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    }
  ],
  events: [
    {
      id: 1,
      club_id: 1,
      title: "National Hackathon 2026",
      description: "24-hour innovation hackathon to build intelligent AI solutions for campus productivity.",
      date: "2026-11-20",
      time: "10:00 AM",
      venue: "Main Auditorium",
      event_type: "Hackathon",
      coordinator_name: "Dr. Sarah Rao",
      sponsors: "Google Cloud, GitHub",
      fee: 0,
      status: "upcoming",
      is_competition: 1,
      registration_count: 3,
      created_by: 1,
      results_declared: 0,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 2,
      club_id: 2,
      title: "RoboWars & Drone Race",
      description: "Battle of custom autonomous bots and high-speed precision obstacle drone racing.",
      date: "2026-12-05",
      time: "02:00 PM",
      venue: "Indoor Sports Arena",
      event_type: "Competition",
      coordinator_name: "Prof. Arvind K",
      sponsors: "RoboLabs India",
      fee: 150,
      status: "upcoming",
      is_competition: 1,
      registration_count: 2,
      created_by: 1,
      results_declared: 0,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 3,
      club_id: 3,
      title: "UI/UX Design Sprint",
      description: "Hands-on product design workshop with Figma, design systems, and rapid prototyping.",
      date: "2026-12-15",
      time: "11:00 AM",
      venue: "Design Studio 3",
      event_type: "Workshop",
      coordinator_name: "Priya Nair",
      sponsors: "DesignHub",
      fee: 0,
      status: "upcoming",
      is_competition: 0,
      registration_count: 4,
      created_by: 1,
      results_declared: 0,
      created_at: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 4,
      club_id: 1,
      title: "CodeMaster Cup 2025",
      description: "Annual algorithmic contest testing data structures, dynamic programming, and speed.",
      date: "2025-10-10",
      time: "09:00 AM",
      venue: "CS Lab 101",
      event_type: "Contest",
      coordinator_name: "Dr. Sarah Rao",
      sponsors: "CodeArena",
      fee: 0,
      status: "past",
      is_competition: 1,
      registration_count: 3,
      created_by: 1,
      results_declared: 1,
      created_at: new Date(Date.now() - 90 * 86400000).toISOString()
    }
  ],
  registrations: [
    {
      id: 1,
      event_id: 1,
      user_id: 2,
      student_id: "CS2026-001",
      payment_id: "PAY_FREE_01",
      payment_status: "paid",
      status: "registered",
      position: "participant",
      certificate_sent: 0,
      certificate_path: null,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 2,
      event_id: 4,
      user_id: 2,
      student_id: "CS2026-001",
      payment_id: "PAY_FREE_02",
      payment_status: "paid",
      status: "attended",
      position: "winner",
      certificate_sent: 1,
      certificate_path: null,
      created_at: new Date(Date.now() - 85 * 86400000).toISOString()
    },
    {
      id: 3,
      event_id: 4,
      user_id: 3,
      student_id: "CS2026-015",
      payment_id: "PAY_FREE_03",
      payment_status: "paid",
      status: "attended",
      position: "runner",
      certificate_sent: 1,
      certificate_path: null,
      created_at: new Date(Date.now() - 85 * 86400000).toISOString()
    },
    {
      id: 4,
      event_id: 4,
      user_id: 4,
      student_id: "CS2026-042",
      payment_id: "PAY_FREE_04",
      payment_status: "paid",
      status: "attended",
      position: "participant",
      certificate_sent: 1,
      certificate_path: null,
      created_at: new Date(Date.now() - 85 * 86400000).toISOString()
    }
  ],
  event_registrations: []
};

// Load or initialize data
let dbState = null;

function loadData() {
  if (dbState) return dbState;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      dbState = JSON.parse(raw);
    } else {
      dbState = JSON.parse(JSON.stringify(defaultData));
      saveData();
    }
  } catch (err) {
    dbState = JSON.parse(JSON.stringify(defaultData));
  }
  return dbState;
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save demo_data.json:', err);
  }
}

// Next ID helper
function nextId(collection) {
  if (!collection.length) return 1;
  return Math.max(...collection.map(item => item.id || 0)) + 1;
}

export async function executeQuery(sql, params = []) {
  const data = loadData();
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const lowerSql = cleanSql.toLowerCase();

  // Helper: enrich registration
  const enrichReg = (r) => {
    const user = data.users.find(u => u.id === r.user_id) || {};
    const event = data.events.find(e => e.id === r.event_id) || {};
    return {
      ...r,
      name: user.name || 'Unknown',
      user_name: user.name || 'Unknown',
      user_email: user.email || '',
      event_title: event.title || ''
    };
  };

  // 1. Health check: SELECT 1
  if (lowerSql === 'select 1') {
    return [[{ '1': 1 }], []];
  }

  // 2. Dashboard Counts
  if (lowerSql.includes('select count(*) as count from events')) {
    return [[{ count: data.events.length }], []];
  }
  if (lowerSql.includes('select count(*) as count from users where role = "user"')) {
    const count = data.users.filter(u => u.role === 'user').length;
    return [[{ count }], []];
  }
  if (lowerSql.includes('select count(*) as count from registrations where user_id = ?')) {
    const userId = Number(params[0]);
    const count = data.registrations.filter(r => r.user_id === userId).length;
    return [[{ count }], []];
  }
  if (lowerSql.includes('select count(*) as count from registrations')) {
    return [[{ count: data.registrations.length }], []];
  }

  // 3. User Queries
  if (lowerSql.includes('select id from users where email = ?')) {
    const email = params[0];
    const match = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return [match ? [{ id: match.id }] : [], []];
  }
  if (lowerSql.includes('select * from users where email = ?')) {
    const email = params[0];
    const match = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return [match ? [{ ...match }] : [], []];
  }
  if (lowerSql.startsWith('insert into users')) {
    const [name, email, password, role] = params;
    const id = nextId(data.users);
    const newUser = {
      id,
      name,
      email,
      password,
      role: role || 'user',
      is_verified: true,
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    saveData();
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  // 4. Clubs Queries
  if (lowerSql.includes('select id from clubs where name = ?')) {
    const name = params[0];
    const match = data.clubs.find(c => c.name.toLowerCase() === name.toLowerCase());
    return [match ? [{ id: match.id }] : [], []];
  }
  if (lowerSql.includes('select password from clubs where id = ?')) {
    const id = Number(params[0]);
    const match = data.clubs.find(c => c.id === id);
    return [match ? [{ password: match.password }] : [], []];
  }
  if (lowerSql.includes('select id, name, description from clubs where id = ?')) {
    const id = Number(params[0]);
    const match = data.clubs.find(c => c.id === id);
    return [match ? [{ id: match.id, name: match.name, description: match.description }] : [], []];
  }
  if (lowerSql.includes('from clubs')) {
    const clubs = data.clubs.map(c => ({ id: c.id, name: c.name, description: c.description }));
    clubs.sort((a, b) => a.name.localeCompare(b.name));
    return [clubs, []];
  }
  if (lowerSql.startsWith('insert into clubs')) {
    const [name, description, password] = params;
    const id = nextId(data.clubs);
    data.clubs.push({
      id,
      name,
      description,
      password,
      created_at: new Date().toISOString()
    });
    saveData();
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 5. Events Queries
  if (lowerSql.includes('select fee from events where id = ?')) {
    const id = Number(params[0]);
    const ev = data.events.find(e => e.id === id);
    return [ev ? [{ fee: ev.fee || 0 }] : [], []];
  }
  if (lowerSql.includes('select title from events where id=?') || lowerSql.includes('select title from events where id = ?')) {
    const id = Number(params[0]);
    const ev = data.events.find(e => e.id === id);
    return [ev ? [{ title: ev.title }] : [], []];
  }
  if (lowerSql.includes('select id from events where id = ? and club_id = ?')) {
    const [id, clubId] = params.map(Number);
    const ev = data.events.find(e => e.id === id && e.club_id === clubId);
    return [ev ? [{ id: ev.id }] : [], []];
  }
  if (lowerSql.includes('select id from events where venue = ? and date = ? and time = ?')) {
    const [venue, date, time] = params;
    const conflict = data.events.filter(e => e.venue === venue && e.date === date && e.time === time);
    return [conflict.map(c => ({ id: c.id })), []];
  }
  if (lowerSql.includes('from events where club_id = ? and is_competition = true')) {
    const clubId = Number(params[0]);
    const evs = data.events.filter(e => e.club_id === clubId && (e.is_competition == 1 || e.is_competition === true));
    return [evs, []];
  }
  if (lowerSql.includes('from events') && lowerSql.includes('where e.club_id = ?')) {
    const clubId = Number(params[0]);
    const evs = data.events.filter(e => e.club_id === clubId).map(e => ({
      ...e,
      registration_count: data.registrations.filter(r => r.event_id === e.id).length
    }));
    return [evs, []];
  }
  if (lowerSql.includes('from events where club_id = ?')) {
    const clubId = Number(params[0]);
    const evs = data.events.filter(e => e.club_id === clubId);
    return [evs, []];
  }
  if (lowerSql.includes('from events e left join registrations r on e.id = r.event_id where e.status = \'past\' or e.date < curdate()') ||
      lowerSql.includes('where e.status = \'past\'')) {
    const nowStr = new Date().toISOString().split('T')[0];
    const past = data.events.filter(e => e.status === 'past' || e.date < nowStr).map(e => ({
      ...e,
      registration_count: data.registrations.filter(r => r.event_id === e.id).length
    }));
    return [past, []];
  }
  if (lowerSql.includes('select * from events where date >= curdate() order by date asc')) {
    const nowStr = new Date().toISOString().split('T')[0];
    const upcoming = data.events.filter(e => e.date >= nowStr && e.status !== 'past');
    upcoming.sort((a, b) => a.date.localeCompare(b.date));
    return [upcoming, []];
  }
  if (lowerSql.includes('where r.user_id = ? and e.date >= curdate()')) {
    const userId = Number(params[0]);
    const nowStr = new Date().toISOString().split('T')[0];
    const userRegEventIds = data.registrations.filter(r => r.user_id === userId).map(r => r.event_id);
    const evs = data.events.filter(e => userRegEventIds.includes(e.id) && e.date >= nowStr);
    return [evs.slice(0, 5), []];
  }
  if (lowerSql.includes('where r.user_id = ? and e.date < curdate()')) {
    const userId = Number(params[0]);
    const nowStr = new Date().toISOString().split('T')[0];
    const userRegEventIds = data.registrations.filter(r => r.user_id === userId).map(r => r.event_id);
    const evs = data.events.filter(e => userRegEventIds.includes(e.id) && (e.date < nowStr || e.status === 'past'));
    return [evs.slice(0, 5), []];
  }
  if (lowerSql.includes('where e.date >= curdate() and e.id not in')) {
    const userId = Number(params[0]);
    const nowStr = new Date().toISOString().split('T')[0];
    const userRegEventIds = data.registrations.filter(r => r.user_id === userId).map(r => r.event_id);
    const evs = data.events.filter(e => !userRegEventIds.includes(e.id) && e.date >= nowStr);
    return [evs.slice(0, 5), []];
  }
  if (lowerSql.includes('select * from events order by date desc limit 5')) {
    const copy = [...data.events].sort((a, b) => b.date.localeCompare(a.date));
    return [copy.slice(0, 5), []];
  }
  if (lowerSql.includes('select * from events where id = ?')) {
    const id = Number(params[0]);
    const ev = data.events.find(e => e.id === id);
    return [ev ? [{ ...ev }] : [], []];
  }
  if (lowerSql.startsWith('insert into events')) {
    const id = nextId(data.events);
    let newEvent = {};
    if (lowerSql.includes('club_id')) {
      const [title, description, date, venue, time, status, clubId, createdBy, isCompetition, eventType, coordinator, sponsors, fee] = params;
      newEvent = {
        id,
        title,
        description,
        date,
        venue,
        time,
        status: status || 'upcoming',
        club_id: Number(clubId),
        created_by: createdBy,
        is_competition: Boolean(isCompetition) ? 1 : 0,
        event_type: eventType,
        coordinator_name: coordinator,
        sponsors,
        registration_count: 0,
        results_declared: 0,
        fee: Number(fee),
        created_at: new Date().toISOString()
      };
    } else {
      const [title, description, date, type, venue, time, coordinator, sponsors, status, createdBy] = params;
      newEvent = {
        id,
        title,
        description,
        date,
        event_type: type,
        venue,
        time,
        coordinator_name: coordinator,
        sponsors,
        status: status || 'upcoming',
        created_by: createdBy,
        registration_count: 0,
        results_declared: 0,
        fee: 0,
        created_at: new Date().toISOString()
      };
    }
    data.events.push(newEvent);
    saveData();
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  if (lowerSql.startsWith('update events set status = ? where id = ? and club_id = ?')) {
    const [status, eventId, clubId] = params;
    const event = data.events.find(item => item.id === Number(eventId) && item.club_id === Number(clubId));
    if (event) {
      event.status = status;
      saveData();
    }
    return [{ affectedRows: event ? 1 : 0 }, []];
  }
  if (lowerSql.includes('update events set registration_count = registration_count + 1 where id = ?')) {
    const id = Number(params[0]);
    const ev = data.events.find(e => e.id === id);
    if (ev) ev.registration_count = (ev.registration_count || 0) + 1;
    saveData();
    return [{ affectedRows: 1 }, []];
  }
  if (lowerSql.includes('update events set results_declared=true where id=?') || lowerSql.includes('results_declared = true')) {
    const id = Number(params[0]);
    const ev = data.events.find(e => e.id === id);
    if (ev) ev.results_declared = 1;
    saveData();
    return [{ affectedRows: 1 }, []];
  }
  if (lowerSql.startsWith('delete from events')) {
    const id = Number(params[0]);
    data.events = data.events.filter(e => e.id !== id);
    saveData();
    return [{ affectedRows: 1 }, []];
  }

  // 6. Registrations Queries
  if (lowerSql.includes('select event_id from registrations where id=?') || lowerSql.includes('where id = ?')) {
    const id = Number(params[0]);
    const reg = data.registrations.find(r => r.id === id);
    return [reg ? [{ event_id: reg.event_id }] : [], []];
  }
  if (lowerSql.includes('from registrations r join users u on r.user_id = u.id where r.event_id = ?') ||
      lowerSql.includes('where r.event_id=?') || lowerSql.includes('where r.event_id = ?')) {
    const eventId = Number(params[0]);
    if (lowerSql.includes("in ('winner','runner')")) {
      const winners = data.registrations
        .filter(r => r.event_id === eventId && (r.position === 'winner' || r.position === 'runner'))
        .map(enrichReg);
      return [winners, []];
    }
    const regs = data.registrations.filter(r => r.event_id === eventId).map(enrichReg);
    return [regs, []];
  }
  if (lowerSql.includes('select id from registrations where event_id = ? and user_id = ?') ||
      lowerSql.includes('select * from registrations where event_id = ? and user_id = ?')) {
    const [eventId, userId] = params.map(Number);
    const match = data.registrations.find(r => r.event_id === eventId && r.user_id === userId);
    return [match ? [{ ...match }] : [], []];
  }
  if (lowerSql.includes('select * from event_registrations where event_id = ? and user_id = ?')) {
    const [eventId, userId] = params.map(Number);
    const match = (data.event_registrations || []).find(r => r.event_id === eventId && r.user_id === userId);
    return [match ? [{ ...match }] : [], []];
  }
  if (lowerSql.startsWith('insert into registrations')) {
    const id = nextId(data.registrations);
    let eventId, userId, paymentId, paymentStatus, status;
    if (params.length === 2) {
      [eventId, userId] = params.map(Number);
      paymentStatus = 'paid';
      status = 'registered';
    } else if (params.length === 3) {
      if (typeof params[2] === 'string' && (params[2] === 'paid' || params[2] === 'unpaid')) {
        [eventId, userId] = params.slice(0, 2).map(Number);
        paymentStatus = params[2];
        status = 'registered';
      } else {
        [eventId, userId] = params.slice(0, 2).map(Number);
        status = params[2];
        paymentStatus = 'paid';
      }
    } else if (params.length >= 4) {
      [eventId, userId] = params.slice(0, 2).map(Number);
      paymentId = params[2];
      paymentStatus = params[3];
      status = 'registered';
    }

    const newReg = {
      id,
      event_id: eventId,
      user_id: userId,
      student_id: `STU-${id}`,
      payment_id: paymentId || `PAY-${Date.now()}`,
      payment_status: paymentStatus || 'paid',
      status: status || 'registered',
      position: 'participant',
      certificate_sent: 0,
      certificate_path: null,
      created_at: new Date().toISOString()
    };
    data.registrations.push(newReg);

    // Increment event registration count
    const ev = data.events.find(e => e.id === eventId);
    if (ev) ev.registration_count = (ev.registration_count || 0) + 1;

    saveData();
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  if (lowerSql.startsWith('insert into event_registrations')) {
    const [eventId, userId, studentId] = params;
    if (!data.event_registrations) data.event_registrations = [];
    const id = nextId(data.event_registrations);
    data.event_registrations.push({
      id,
      event_id: Number(eventId),
      user_id: Number(userId),
      student_id: studentId,
      created_at: new Date().toISOString()
    });
    saveData();
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  if (lowerSql.includes('update registrations set position=\'participant\' where event_id=? and position=?')) {
    const [eventId, pos] = params;
    data.registrations.forEach(r => {
      if (r.event_id === Number(eventId) && r.position === pos) {
        r.position = 'participant';
      }
    });
    saveData();
    return [{ affectedRows: 1 }, []];
  }
  if (lowerSql.includes('update registrations set position=? where id=?')) {
    const [pos, id] = params;
    const reg = data.registrations.find(r => r.id === Number(id));
    if (reg) reg.position = pos;
    saveData();
    return [{ affectedRows: 1 }, []];
  }
  if (lowerSql.includes('update registrations set certificate_sent=true')) {
    const [certPath, id] = params;
    const reg = data.registrations.find(r => r.id === Number(id));
    if (reg) {
      reg.certificate_sent = 1;
      reg.certificate_path = certPath;
    }
    saveData();
    return [{ affectedRows: 1 }, []];
  }
  if (lowerSql.startsWith('delete from registrations')) {
    const eventId = Number(params[0]);
    data.registrations = data.registrations.filter(r => r.event_id !== eventId);
    saveData();
    return [{ affectedRows: 1 }, []];
  }
  if (lowerSql.includes('from registrations r join events e on r.event_id = e.id join users u on r.user_id = u.id')) {
    let regs = data.registrations.map(enrichReg);
    if (lowerSql.includes('where r.user_id = ?')) {
      const userId = Number(params[0]);
      regs = regs.filter(r => r.user_id === userId);
    }
    regs.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    if (lowerSql.includes('limit 5')) {
      regs = regs.slice(0, 5);
    }
    return [regs, []];
  }

  console.warn('[MockDB Unhandled Query]', cleanSql, params);
  return [[], []];
}

// Connection object for transactions
class MockConnection {
  async beginTransaction() {}
  async commit() {}
  async rollback() {}
  async query(sql, params) {
    return executeQuery(sql, params);
  }
  release() {}
}

export const mockDb = {
  query: executeQuery,
  execute: executeQuery,
  getConnection: async () => new MockConnection()
};

export default mockDb;
