import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('gym_saas.db');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS gyms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    whatsapp_number TEXT,
    sms_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('super_admin', 'gym_owner')) NOT NULL,
    FOREIGN KEY(gym_id) REFERENCES gyms(id)
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    join_date DATE NOT NULL,
    membership_type TEXT,
    expiry_date DATE NOT NULL,
    payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
    FOREIGN KEY(gym_id) REFERENCES gyms(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY(gym_id) REFERENCES gyms(id),
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'reminder' or 'due'
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    method TEXT,
    notes TEXT,
    FOREIGN KEY(gym_id) REFERENCES gyms(id),
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS membership_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    FOREIGN KEY(gym_id) REFERENCES gyms(id)
  );

  CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN ('Floor Trainer', 'Personal Trainer', 'Coach')) NOT NULL,
    salary REAL NOT NULL,
    join_date DATE NOT NULL,
    status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
    FOREIGN KEY(gym_id) REFERENCES gyms(id)
  );

  CREATE TABLE IF NOT EXISTS trainer_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER NOT NULL,
    trainer_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT CHECK(status IN ('Present', 'Absent')) NOT NULL,
    notes TEXT,
    FOREIGN KEY(gym_id) REFERENCES gyms(id),
    FOREIGN KEY(trainer_id) REFERENCES trainers(id)
  );

  CREATE TABLE IF NOT EXISTS trainer_salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id INTEGER NOT NULL,
    trainer_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    status TEXT CHECK(status IN ('Paid', 'Pending')) DEFAULT 'Pending',
    notes TEXT,
    FOREIGN KEY(gym_id) REFERENCES gyms(id),
    FOREIGN KEY(trainer_id) REFERENCES trainers(id)
  );
`);

// Migration: Add whatsapp_number and sms_number if they don't exist
try {
  db.prepare('ALTER TABLE gyms ADD COLUMN whatsapp_number TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE gyms ADD COLUMN sms_number TEXT').run();
} catch (e) {}

// --- Automatic WhatsApp Notification Service (Simulated) ---
const checkExpiringMemberships = () => {
  console.log('Checking for expiring memberships to send WhatsApp notifications...');
  
  // 1. Alert 3 days before expiry
  const reminderMembers = db.prepare(`
    SELECT m.*, g.name as gym_name 
    FROM members m 
    JOIN gyms g ON m.gym_id = g.id
    WHERE m.expiry_date = date('now', '+3 days')
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.member_id = m.id AND n.type = 'reminder' AND n.sent_at > date('now', '-1 day')
    )
  `).all() as any[];

  reminderMembers.forEach(member => {
    const message = `Hi ${member.name}, your membership at ${member.gym_name} is expiring in 3 days (${member.expiry_date}). Please renew to continue your workouts!`;
    console.log(`[WhatsApp Auto-Sender] To: ${member.phone} | Message: ${message}`);
    db.prepare('INSERT INTO notifications (member_id, type) VALUES (?, ?)').run(member.id, 'reminder');
  });

  // 2. Alert on the due date
  const dueMembers = db.prepare(`
    SELECT m.*, g.name as gym_name 
    FROM members m 
    JOIN gyms g ON m.gym_id = g.id
    WHERE m.expiry_date = date('now')
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.member_id = m.id AND n.type = 'due' AND n.sent_at > date('now', '-1 day')
    )
  `).all() as any[];

  dueMembers.forEach(member => {
    const message = `Hi ${member.name}, your membership at ${member.gym_name} expires TODAY. Don't miss your session, renew now!`;
    console.log(`[WhatsApp Auto-Sender] To: ${member.phone} | Message: ${message}`);
    db.prepare('INSERT INTO notifications (member_id, type) VALUES (?, ?)').run(member.id, 'due');
  });
};

// Run check every 12 hours
setInterval(checkExpiringMemberships, 12 * 60 * 60 * 1000);
// Run once on startup after a short delay
setTimeout(checkExpiringMemberships, 5000);

// Seed Super Admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE role = ?').get('super_admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run('admin@flexigym.com', hashedPassword, 'super_admin');
  console.log('Super Admin seeded: admin@flexigym.com / admin123');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // --- Auth Routes ---
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let gymName = 'Super Admin';
    if (user.gym_id) {
      const gym: any = db.prepare('SELECT * FROM gyms WHERE id = ?').get(user.gym_id);
      if (!gym.active) return res.status(403).json({ error: 'Gym account is deactivated' });
      gymName = gym.name;
    }

    const token = jwt.sign({ id: user.id, gym_id: user.gym_id, role: user.role, email: user.email, gymName }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, gym_id: user.gym_id, gymName } });
  });

  // --- Super Admin Routes ---
  app.get('/api/admin/stats', authenticate, isSuperAdmin, (req, res) => {
    const totalGyms = db.prepare('SELECT COUNT(*) as count FROM gyms').get() as any;
    const activeGyms = db.prepare('SELECT COUNT(*) as count FROM gyms WHERE active = 1').get() as any;
    res.json({ totalGyms: totalGyms.count, activeGyms: activeGyms.count });
  });

  app.get('/api/admin/gyms', authenticate, isSuperAdmin, (req, res) => {
    const gyms = db.prepare(`
      SELECT g.*, u.email as owner_email 
      FROM gyms g 
      LEFT JOIN users u ON g.id = u.gym_id 
      WHERE u.role = 'gym_owner' OR u.role IS NULL
    `).all();
    res.json(gyms);
  });

  app.post('/api/admin/gyms', authenticate, isSuperAdmin, (req, res) => {
    const { name, email, password } = req.body;
    const insertGym = db.prepare('INSERT INTO gyms (name) VALUES (?)');
    const insertUser = db.prepare('INSERT INTO users (gym_id, email, password, role) VALUES (?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      const gymResult = insertGym.run(name);
      const gymId = gymResult.lastInsertRowid;
      const hashedPassword = bcrypt.hashSync(password, 10);
      insertUser.run(gymId, email, hashedPassword, 'gym_owner');
      return gymId;
    });

    try {
      const gymId = transaction();
      res.json({ id: gymId, name, email });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/admin/gyms/:id/status', authenticate, isSuperAdmin, (req, res) => {
    const { active } = req.body;
    db.prepare('UPDATE gyms SET active = ? WHERE id = ?').run(active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.post('/api/admin/gyms/:id/reset-password', authenticate, isSuperAdmin, (req, res) => {
    const { password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password = ? WHERE gym_id = ?').run(hashedPassword, req.params.id);
    res.json({ success: true });
  });

  // --- Gym Owner Routes ---
  app.get('/api/gym/stats', authenticate, (req: any, res) => {
    const gymId = req.user.gym_id;
    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members WHERE gym_id = ?').get(gymId) as any;
    const activeMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE gym_id = ? AND expiry_date >= date('now')").get(gymId) as any;
    const expiringSoon = db.prepare("SELECT COUNT(*) as count FROM members WHERE gym_id = ? AND expiry_date BETWEEN date('now') AND date('now', '+7 days')").get(gymId) as any;
    const todayAttendance = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE gym_id = ? AND date = date('now')").get(gymId) as any;
    const totalTrainers = db.prepare("SELECT COUNT(*) as count FROM trainers WHERE gym_id = ? AND status = 'Active'").get(gymId) as any;
    
    const expiringMembersList = db.prepare(`
      SELECT id, name, phone, expiry_date 
      FROM members 
      WHERE gym_id = ? AND expiry_date BETWEEN date('now') AND date('now', '+7 days')
      ORDER BY expiry_date ASC
    `).all(gymId);

    const recentNotifications = db.prepare(`
      SELECT n.*, m.name as member_name 
      FROM notifications n 
      JOIN members m ON n.member_id = m.id 
      WHERE m.gym_id = ? 
      ORDER BY n.sent_at DESC 
      LIMIT 5
    `).all(gymId);

    res.json({
      totalMembers: totalMembers.count,
      activeMembers: activeMembers.count,
      expiringSoon: expiringSoon.count,
      todayAttendance: todayAttendance.count,
      totalTrainers: totalTrainers.count,
      expiringMembersList,
      recentNotifications
    });
  });

  app.get('/api/gym/members', authenticate, (req: any, res) => {
    const members = db.prepare('SELECT * FROM members WHERE gym_id = ? ORDER BY name ASC').all(req.user.gym_id);
    res.json(members);
  });

  app.post('/api/gym/members', authenticate, (req: any, res) => {
    const { name, phone, join_date, membership_type, expiry_date, payment_status } = req.body;
    const result = db.prepare(`
      INSERT INTO members (gym_id, name, phone, join_date, membership_type, expiry_date, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.gym_id, name, phone, join_date, membership_type, expiry_date, payment_status);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/gym/members/:id', authenticate, (req: any, res) => {
    const { name, phone, join_date, membership_type, expiry_date, payment_status } = req.body;
    db.prepare(`
      UPDATE members 
      SET name = ?, phone = ?, join_date = ?, membership_type = ?, expiry_date = ?, payment_status = ?
      WHERE id = ? AND gym_id = ?
    `).run(name, phone, join_date, membership_type, expiry_date, payment_status, req.params.id, req.user.gym_id);
    res.json({ success: true });
  });

  app.delete('/api/gym/members/:id', authenticate, (req: any, res) => {
    const memberId = req.params.id;
    const gymId = req.user.gym_id;
    
    const transaction = db.transaction(() => {
      // Delete related records first
      db.prepare('DELETE FROM attendance WHERE member_id = ? AND gym_id = ?').run(memberId, gymId);
      db.prepare('DELETE FROM notifications WHERE member_id = ?').run(memberId);
      db.prepare('DELETE FROM payments WHERE member_id = ? AND gym_id = ?').run(memberId, gymId);
      
      // Finally delete the member
      return db.prepare('DELETE FROM members WHERE id = ? AND gym_id = ?').run(memberId, gymId);
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/gym/attendance', authenticate, (req: any, res) => {
    const { member_id, date } = req.body;
    // Check if already marked
    const exists = db.prepare('SELECT id FROM attendance WHERE gym_id = ? AND member_id = ? AND date = ?').get(req.user.gym_id, member_id, date);
    if (exists) return res.status(400).json({ error: 'Attendance already marked for today' });

    db.prepare('INSERT INTO attendance (gym_id, member_id, date) VALUES (?, ?, ?)').run(req.user.gym_id, member_id, date);
    res.json({ success: true });
  });

  app.get('/api/gym/attendance', authenticate, (req: any, res) => {
    const attendance = db.prepare(`
      SELECT a.*, m.name as member_name 
      FROM attendance a 
      JOIN members m ON a.member_id = m.id 
      WHERE a.gym_id = ? 
      ORDER BY a.date DESC, m.name ASC
    `).all(req.user.gym_id);
    res.json(attendance);
  });

  app.get('/api/gym/settings', authenticate, (req: any, res) => {
    const gym = db.prepare('SELECT name, whatsapp_number FROM gyms WHERE id = ?').get(req.user.gym_id) as any;
    res.json(gym);
  });

  app.patch('/api/gym/settings', authenticate, (req: any, res) => {
    const { name, whatsapp_number } = req.body;
    db.prepare('UPDATE gyms SET name = ?, whatsapp_number = ? WHERE id = ?')
      .run(name, whatsapp_number, req.user.gym_id);
    res.json({ success: true });
  });

  app.post('/api/gym/members/:id/send-reminder', authenticate, async (req: any, res) => {
    const { type } = req.body; // 'whatsapp'
    const memberId = req.params.id;
    
    const member = db.prepare(`
      SELECT m.*, g.name as gym_name 
      FROM members m 
      JOIN gyms g ON m.gym_id = g.id 
      WHERE m.id = ? AND m.gym_id = ?
    `).get(memberId, req.user.gym_id) as any;

    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Log the notification in the dashboard
    db.prepare('INSERT INTO notifications (member_id, type) VALUES (?, ?)').run(memberId, type);

    console.log(`[Dashboard Notification] Type: ${type.toUpperCase()} recorded for ${member.name}`);

    res.json({ 
      success: true, 
      message: `${type.toUpperCase()} reminder recorded in dashboard.` 
    });
  });

  app.delete('/api/gym/notifications', authenticate, (req: any, res) => {
    console.log(`[Dashboard] Clearing notifications for Gym ID: ${req.user.gym_id}`);
    const result = db.prepare(`
      DELETE FROM notifications 
      WHERE member_id IN (SELECT id FROM members WHERE gym_id = ?)
    `).run(req.user.gym_id);
    console.log(`[Dashboard] Deleted ${result.changes} notifications.`);
    res.json({ success: true, changes: result.changes });
  });

  // --- Membership Plan Routes ---
  app.get('/api/gym/plans', authenticate, (req: any, res) => {
    const plans = db.prepare('SELECT * FROM membership_plans WHERE gym_id = ? ORDER BY duration_days ASC').all(req.user.gym_id);
    res.json(plans);
  });

  app.post('/api/gym/plans', authenticate, (req: any, res) => {
    const { name, price, duration_days } = req.body;
    const result = db.prepare(`
      INSERT INTO membership_plans (gym_id, name, price, duration_days)
      VALUES (?, ?, ?, ?)
    `).run(req.user.gym_id, name, price, duration_days);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/gym/plans/:id', authenticate, (req: any, res) => {
    const { name, price, duration_days } = req.body;
    db.prepare(`
      UPDATE membership_plans 
      SET name = ?, price = ?, duration_days = ?
      WHERE id = ? AND gym_id = ?
    `).run(name, price, duration_days, req.params.id, req.user.gym_id);
    res.json({ success: true });
  });

  app.delete('/api/gym/plans/:id', authenticate, (req: any, res) => {
    db.prepare('DELETE FROM membership_plans WHERE id = ? AND gym_id = ?').run(req.params.id, req.user.gym_id);
    res.json({ success: true });
  });

  // --- Payment Routes ---
  app.get('/api/gym/members/:id/payments', authenticate, (req: any, res) => {
    const payments = db.prepare('SELECT * FROM payments WHERE member_id = ? AND gym_id = ? ORDER BY date DESC').all(req.params.id, req.user.gym_id);
    res.json(payments);
  });

  app.post('/api/gym/members/:id/payments', authenticate, (req: any, res) => {
    const { amount, date, method, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO payments (gym_id, member_id, amount, date, method, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.gym_id, req.params.id, amount, date, method, notes);
    
    // Update member payment status if needed (optional logic)
    db.prepare("UPDATE members SET payment_status = 'paid' WHERE id = ?").run(req.params.id);
    
    res.json({ id: result.lastInsertRowid });
  });

  app.delete('/api/gym/payments/:id', authenticate, (req: any, res) => {
    db.prepare('DELETE FROM payments WHERE id = ? AND gym_id = ?').run(req.params.id, req.user.gym_id);
    res.json({ success: true });
  });

  // --- Trainer Routes ---
  app.get('/api/gym/trainers', authenticate, (req: any, res) => {
    const trainers = db.prepare('SELECT * FROM trainers WHERE gym_id = ? ORDER BY name ASC').all(req.user.gym_id);
    res.json(trainers);
  });

  app.post('/api/gym/trainers', authenticate, (req: any, res) => {
    const { name, phone, role, salary, join_date, status } = req.body;
    const result = db.prepare(`
      INSERT INTO trainers (gym_id, name, phone, role, salary, join_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.gym_id, name, phone, role, salary, join_date, status || 'Active');
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/gym/trainers/:id', authenticate, (req: any, res) => {
    const { name, phone, role, salary, join_date, status } = req.body;
    db.prepare(`
      UPDATE trainers 
      SET name = ?, phone = ?, role = ?, salary = ?, join_date = ?, status = ?
      WHERE id = ? AND gym_id = ?
    `).run(name, phone, role, salary, join_date, status, req.params.id, req.user.gym_id);
    res.json({ success: true });
  });

  app.delete('/api/gym/trainers/:id', authenticate, (req: any, res) => {
    const trainerId = req.params.id;
    const gymId = req.user.gym_id;

    const transaction = db.transaction(() => {
      // Delete related records first
      db.prepare('DELETE FROM trainer_attendance WHERE trainer_id = ? AND gym_id = ?').run(trainerId, gymId);
      db.prepare('DELETE FROM trainer_salaries WHERE trainer_id = ? AND gym_id = ?').run(trainerId, gymId);
      
      // Finally delete the trainer
      return db.prepare('DELETE FROM trainers WHERE id = ? AND gym_id = ?').run(trainerId, gymId);
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/gym/trainers/attendance', authenticate, (req: any, res) => {
    const { trainer_id, date, status, notes } = req.body;
    // Check if already marked
    const exists = db.prepare('SELECT id FROM trainer_attendance WHERE gym_id = ? AND trainer_id = ? AND date = ?').get(req.user.gym_id, trainer_id, date);
    if (exists) {
      db.prepare('UPDATE trainer_attendance SET status = ?, notes = ? WHERE id = ?').run(status, notes, (exists as any).id);
    } else {
      db.prepare('INSERT INTO trainer_attendance (gym_id, trainer_id, date, status, notes) VALUES (?, ?, ?, ?, ?)').run(req.user.gym_id, trainer_id, date, status, notes);
    }
    res.json({ success: true });
  });

  app.get('/api/gym/trainers/attendance', authenticate, (req: any, res) => {
    const { date, trainer_id } = req.query;
    let query = `
      SELECT ta.*, t.name as trainer_name 
      FROM trainer_attendance ta 
      JOIN trainers t ON ta.trainer_id = t.id 
      WHERE ta.gym_id = ?
    `;
    const params: any[] = [req.user.gym_id];

    if (date) {
      query += ' AND ta.date = ?';
      params.push(date);
    }
    if (trainer_id) {
      query += ' AND ta.trainer_id = ?';
      params.push(trainer_id);
    }

    query += ' ORDER BY ta.date DESC, t.name ASC';
    const attendance = db.prepare(query).all(...params);
    res.json(attendance);
  });

  app.post('/api/gym/trainers/:id/salaries', authenticate, (req: any, res) => {
    const { amount, date, status, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO trainer_salaries (gym_id, trainer_id, amount, date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.gym_id, req.params.id, amount, date, status, notes);
    res.json({ id: result.lastInsertRowid });
  });

  app.get('/api/gym/trainers/:id/salaries', authenticate, (req: any, res) => {
    const salaries = db.prepare('SELECT * FROM trainer_salaries WHERE trainer_id = ? AND gym_id = ? ORDER BY date DESC').all(req.params.id, req.user.gym_id);
    res.json(salaries);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
