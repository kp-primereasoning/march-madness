// 2026 NCAA Tournament Teams
// UPDATE these with the actual 2026 bracket after Selection Sunday.
// bracket_position: 1–64 used for Monte Carlo bracket simulation order
// Positions follow standard bracket: each region has 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15

const TEAMS_2026 = [
  // ── EAST REGION ──
  { name: 'Duke',              seed: 1,  region: 'East',    bracket_position: 1 },
  { name: 'Alabama',           seed: 2,  region: 'East',    bracket_position: 32 },
  { name: 'Wisconsin',         seed: 3,  region: 'East',    bracket_position: 16 },
  { name: 'Arizona',           seed: 4,  region: 'East',    bracket_position: 17 },
  { name: 'Memphis',           seed: 5,  region: 'East',    bracket_position: 8 },
  { name: 'Clemson',           seed: 6,  region: 'East',    bracket_position: 25 },
  { name: 'Missouri',          seed: 7,  region: 'East',    bracket_position: 24 },
  { name: 'Mississippi St.',   seed: 8,  region: 'East',    bracket_position: 9 },
  { name: 'Boise St.',         seed: 9,  region: 'East',    bracket_position: 24 },
  { name: 'Vanderbilt',        seed: 10, region: 'East',    bracket_position: 23 },
  { name: 'NC State',          seed: 11, region: 'East',    bracket_position: 26 },
  { name: 'Colorado',          seed: 12, region: 'East',    bracket_position: 7 },
  { name: 'High Point',        seed: 13, region: 'East',    bracket_position: 20 },
  { name: 'Rider',             seed: 14, region: 'East',    bracket_position: 19 },
  { name: 'Norfolk St.',       seed: 15, region: 'East',    bracket_position: 30 },
  { name: 'Mount St. Marys',   seed: 16, region: 'East',    bracket_position: 2 },

  // ── WEST REGION ──
  { name: 'Kansas',            seed: 1,  region: 'West',    bracket_position: 33 },
  { name: 'Tennessee',         seed: 2,  region: 'West',    bracket_position: 64 },
  { name: 'Purdue',            seed: 3,  region: 'West',    bracket_position: 48 },
  { name: 'Kentucky',          seed: 4,  region: 'West',    bracket_position: 49 },
  { name: 'Utah St.',          seed: 5,  region: 'West',    bracket_position: 40 },
  { name: 'Iowa St.',          seed: 6,  region: 'West',    bracket_position: 57 },
  { name: 'Dayton',            seed: 7,  region: 'West',    bracket_position: 56 },
  { name: 'Oklahoma',          seed: 8,  region: 'West',    bracket_position: 41 },
  { name: 'Georgetown',        seed: 9,  region: 'West',    bracket_position: 56 },
  { name: 'Wake Forest',       seed: 10, region: 'West',    bracket_position: 55 },
  { name: 'Drake',             seed: 11, region: 'West',    bracket_position: 58 },
  { name: 'UAB',               seed: 12, region: 'West',    bracket_position: 39 },
  { name: 'Furman',            seed: 13, region: 'West',    bracket_position: 52 },
  { name: 'S.F. Austin',       seed: 14, region: 'West',    bracket_position: 51 },
  { name: 'Colgate',           seed: 15, region: 'West',    bracket_position: 62 },
  { name: 'Texas Southern',    seed: 16, region: 'West',    bracket_position: 34 },

  // ── SOUTH REGION ──
  { name: 'Auburn',            seed: 1,  region: 'South',   bracket_position: 65 },
  { name: 'Michigan St.',      seed: 2,  region: 'South',   bracket_position: 96 },
  { name: 'Texas A&M',         seed: 3,  region: 'South',   bracket_position: 80 },
  { name: 'Maryland',          seed: 4,  region: 'South',   bracket_position: 81 },
  { name: 'Gonzaga',           seed: 5,  region: 'South',   bracket_position: 72 },
  { name: 'USC',               seed: 6,  region: 'South',   bracket_position: 89 },
  { name: 'Oklahoma St.',      seed: 7,  region: 'South',   bracket_position: 88 },
  { name: 'Syracuse',          seed: 8,  region: 'South',   bracket_position: 73 },
  { name: 'Villanova',         seed: 9,  region: 'South',   bracket_position: 88 },
  { name: 'Virginia',          seed: 10, region: 'South',   bracket_position: 87 },
  { name: 'Pittsburgh',        seed: 11, region: 'South',   bracket_position: 90 },
  { name: 'James Madison',     seed: 12, region: 'South',   bracket_position: 71 },
  { name: 'Samford',           seed: 13, region: 'South',   bracket_position: 84 },
  { name: 'Morehead St.',      seed: 14, region: 'South',   bracket_position: 83 },
  { name: 'Stetson',           seed: 15, region: 'South',   bracket_position: 94 },
  { name: 'Alabama St.',       seed: 16, region: 'South',   bracket_position: 66 },

  // ── MIDWEST REGION ──
  { name: 'UConn',             seed: 1,  region: 'Midwest', bracket_position: 97 },
  { name: 'Marquette',         seed: 2,  region: 'Midwest', bracket_position: 128 },
  { name: 'Baylor',            seed: 3,  region: 'Midwest', bracket_position: 112 },
  { name: 'Florida',           seed: 4,  region: 'Midwest', bracket_position: 113 },
  { name: 'Saint Marys',       seed: 5,  region: 'Midwest', bracket_position: 104 },
  { name: 'BYU',               seed: 6,  region: 'Midwest', bracket_position: 121 },
  { name: 'Mich. (Michigan)',   seed: 7,  region: 'Midwest', bracket_position: 120 },
  { name: 'Northwestern',      seed: 8,  region: 'Midwest', bracket_position: 105 },
  { name: 'Florida St.',       seed: 9,  region: 'Midwest', bracket_position: 120 },
  { name: 'New Mexico',        seed: 10, region: 'Midwest', bracket_position: 119 },
  { name: 'Duquesne',          seed: 11, region: 'Midwest', bracket_position: 122 },
  { name: 'Grand Canyon',      seed: 12, region: 'Midwest', bracket_position: 103 },
  { name: 'Vermont',           seed: 13, region: 'Midwest', bracket_position: 116 },
  { name: 'Akron',             seed: 14, region: 'Midwest', bracket_position: 115 },
  { name: 'Long Beach St.',    seed: 15, region: 'Midwest', bracket_position: 126 },
  { name: 'Holy Cross',        seed: 16, region: 'Midwest', bracket_position: 98 },
];

module.exports = TEAMS_2026;
