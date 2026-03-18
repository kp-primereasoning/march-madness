// seed.js — run once to initialize users and teams
// Usage: node seed.js
// Add --reset flag to clear existing data: node seed.js --reset

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');
const TEAMS = require('./data/teams-2026');

const SALT_ROUNDS = 10;
const reset = process.argv.includes('--reset');

if (reset) {
  console.log('Resetting database...');
  db.exec('DELETE FROM entries; DELETE FROM participants; DELETE FROM users; DELETE FROM teams;');
}

// ── USERS ──────────────────────────────────────────────────────────────────
// Edit this list to match your group's usernames and passwords.
// is_admin: 1 = can record auction entries, eliminate teams, manage participants
const USERS = [
  { username: 'admin',   password: 'changeme123', display_name: 'Admin',       is_admin: 1 },
  { username: 'player1', password: 'password1',   display_name: 'Player One',  is_admin: 0 },
  { username: 'player2', password: 'password2',   display_name: 'Player Two',  is_admin: 0 },
  { username: 'player3', password: 'password3',   display_name: 'Player Three',is_admin: 0 },
  { username: 'player4', password: 'password4',   display_name: 'Player Four', is_admin: 0 },
  { username: 'player5', password: 'password5',   display_name: 'Player Five', is_admin: 0 },
  { username: 'player6', password: 'password6',   display_name: 'Player Six',  is_admin: 0 },
  { username: 'player7', password: 'password7',   display_name: 'Player Seven',is_admin: 0 },
  { username: 'player8', password: 'password8',   display_name: 'Player Eight',is_admin: 0 },
];

// ── PARTICIPANTS ────────────────────────────────────────────────────────────
// Participants are the Calcutta auction owners. They can be linked to user accounts
// by matching display_name, or leave user_id null for unlinked participants.
const PARTICIPANTS = [
  'Player One', 'Player Two', 'Player Three', 'Player Four',
  'Player Five', 'Player Six', 'Player Seven', 'Player Eight',
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password_hash, display_name, is_admin)
  VALUES (?, ?, ?, ?)
`);

const insertParticipant = db.prepare(`
  INSERT OR IGNORE INTO participants (name) VALUES (?)
`);

const insertTeam = db.prepare(`
  INSERT OR IGNORE INTO teams (name, seed, region, bracket_position)
  VALUES (@name, @seed, @region, @bracket_position)
`);

const linkParticipant = db.prepare(`
  UPDATE participants SET user_id = (SELECT id FROM users WHERE display_name = ?)
  WHERE name = ?
`);

async function seed() {
  console.log('Seeding users...');
  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    insertUser.run(u.username, hash, u.display_name, u.is_admin ? 1 : 0);
    console.log(`  ✓ ${u.username} (${u.is_admin ? 'admin' : 'user'})`);
  }

  console.log('\nSeeding participants...');
  for (const name of PARTICIPANTS) {
    insertParticipant.run(name);
    linkParticipant.run(name, name);
    console.log(`  ✓ ${name}`);
  }

  console.log('\nSeeding teams...');
  for (const team of TEAMS) {
    insertTeam.run(team);
    console.log(`  ✓ ${team.region} ${team.seed}-seed: ${team.name}`);
  }

  console.log('\nDone! Database seeded successfully.');
  console.log('\nDefault credentials (CHANGE THESE IN PRODUCTION):');
  console.log('  Admin:    admin / changeme123');
  console.log('  Players:  player1..player8 / password1..password8');
}

seed().catch(console.error);
