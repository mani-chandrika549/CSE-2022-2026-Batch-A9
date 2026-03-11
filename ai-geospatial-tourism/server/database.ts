import Database from "better-sqlite3";

const db = new Database("tourism.db");

export function initDatabase() {
  // Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    latitude REAL,
    longitude REAL,
    category TEXT,
    description TEXT,
    best_months TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    month TEXT,
    interest TEXT,
    destination_name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS accommodations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination_id INTEGER,
    name TEXT,
    type TEXT,
    price_range TEXT,
    distance REAL,
    image_url TEXT,
    booking_link TEXT
  );
`);

// Add booking_link column if database already existed
try {
  db.exec("ALTER TABLE accommodations ADD COLUMN booking_link TEXT");
} catch (e) {
  // column already exists
}

  seedData();
}

function seedData() {
  const destCount = db.prepare("SELECT COUNT(*) as count FROM destinations").get() as { count: number };
  if (destCount.count === 0) {
    const insertDest = db.prepare(`
      INSERT INTO destinations (name, city, state, country, latitude, longitude, category, description, best_months, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const destinations = [
      ["Baga Beach", "Baga", "Goa", "India", 15.5553, 73.7517, "Beaches", "Famous for its nightlife, beach shacks, and water sports.", "November,December,January,February", "https://images.unsplash.com/photo-1512757776214-26d36777b513?auto=format&fit=crop&w=800&q=80"],
      ["Calangute Beach", "Calangute", "Goa", "India", 15.5494, 73.7535, "Beaches", "The 'Queen of Beaches' in Goa, perfect for sunbathing.", "November,December,January,February", "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80"],
      ["Aguada Fort", "Candolim", "Goa", "India", 15.4920, 73.7731, "Heritage", "A well-preserved 17th-century Portuguese fort and lighthouse.", "October,November,December,January,February", "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80"],
      ["Dudhsagar Falls", "Sonaulim", "Goa", "India", 15.3144, 74.3143, "Nature", "A four-tiered waterfall located on the Mandovi River.", "June,July,August,September,October", "https://images.unsplash.com/photo-1590050752117-23a9d7fc9b5c?auto=format&fit=crop&w=800&q=80"],
      ["Amer Fort", "Jaipur", "Rajasthan", "India", 26.9855, 75.8513, "Heritage", "Majestic fort known for its artistic Hindu style elements.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1590075865003-e48277faf551?auto=format&fit=crop&w=800&q=80"],
      ["Hawa Mahal", "Jaipur", "Rajasthan", "India", 26.9239, 75.8267, "Heritage", "The 'Palace of Winds' with 953 small windows.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"],
      ["City Palace", "Jaipur", "Rajasthan", "India", 26.9258, 75.8237, "Heritage", "A complex of courtyards, gardens, and buildings.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=800&q=80"],
      ["Nahargarh Fort", "Jaipur", "Rajasthan", "India", 26.9374, 75.8156, "Heritage", "Stands on the edge of the Aravalli Hills, overlooking Jaipur.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1592345213144-173d9736f3e2?auto=format&fit=crop&w=800&q=80"],
      ["Pushkar Lake", "Pushkar", "Rajasthan", "India", 26.4884, 74.5509, "Heritage", "A sacred lake of the Hindus surrounded by 52 ghats.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1590593162211-f98f76d28ec5?auto=format&fit=crop&w=800&q=80"],
      ["Ajmer Sharif Dargah", "Ajmer", "Rajasthan", "India", 26.4561, 74.6282, "Heritage", "The tomb of Moinuddin Chishti, a famous Sufi saint.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=800&q=80"],
      ["Hadimba Devi Temple", "Manali", "Himachal Pradesh", "India", 32.2483, 77.1781, "Heritage", "An ancient cave temple dedicated to Hidimbi Devi.", "March,April,May,June,September,October,November", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"],
      ["Solang Valley", "Manali", "Himachal Pradesh", "India", 32.3166, 77.1578, "Adventure", "Known for its summer and winter adventure sports.", "December,January,February,May,June", "https://images.unsplash.com/photo-1596760407110-2f75d05b7187?auto=format&fit=crop&w=800&q=80"],
      ["Rohtang Pass", "Manali", "Himachal Pradesh", "India", 32.3716, 77.2466, "Adventure", "A high mountain pass on the eastern Pir Panjal Range.", "May,June,July,August,September,October", "https://images.unsplash.com/photo-1586311006430-804153549666?auto=format&fit=crop&w=800&q=80"],
      ["Kasol", "Kullu", "Himachal Pradesh", "India", 32.0100, 77.3150, "Nature", "A quaint little village on the banks of Parvati River.", "March,April,May,June,October,November", "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80"],
      ["Manikaran Sahib", "Kullu", "Himachal Pradesh", "India", 32.0274, 77.3463, "Heritage", "Famous for its hot springs and religious significance.", "March,April,May,June,October,November", "https://images.unsplash.com/photo-1615456244955-5f1680506041?auto=format&fit=crop&w=800&q=80"],
      ["Eravikulam National Park", "Munnar", "Kerala", "India", 10.1915, 77.0854, "Wildlife", "Home to the endangered Nilgiri Tahr.", "September,October,November,December,January,February", "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"],
      ["Mattupetty Dam", "Munnar", "Kerala", "India", 10.1055, 77.1235, "Nature", "A storage Concrete Gravity dam built in the mountains.", "September,October,November,December,January,February,March", "https://images.unsplash.com/photo-1590050752117-23a9d7fc9b5c?auto=format&fit=crop&w=800&q=80"],
      ["Tea Museum", "Munnar", "Kerala", "India", 10.0934, 77.0611, "Heritage", "Showcases the growth of Munnar's tea plantations.", "All year round", "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"],
      ["Thekkady (Periyar)", "Thekkady", "Kerala", "India", 9.6031, 77.1615, "Wildlife", "Famous for its elephant and tiger reserve.", "September,October,November,December,January,February,March", "https://images.unsplash.com/photo-1581009146145-b5ef03a7401b?auto=format&fit=crop&w=800&q=80"],
      ["Idukki Arch Dam", "Idukki", "Kerala", "India", 9.8447, 76.9734, "Nature", "One of the highest arch dams in Asia.", "September,October,November,December,January,February", "https://images.unsplash.com/photo-1593693414517-05906468876d?auto=format&fit=crop&w=800&q=80"],
      ["Dashashwamedh Ghat", "Varanasi", "Uttar Pradesh", "India", 25.3078, 83.0101, "Heritage", "The main ghat in Varanasi on the Ganges River.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"],
      ["Sarnath", "Varanasi", "Uttar Pradesh", "India", 25.3761, 83.0227, "Heritage", "Where Gautama Buddha first taught the Dharma.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1598977123418-4545450388fb?auto=format&fit=crop&w=800&q=80"],
      ["Kashi Vishwanath Temple", "Varanasi", "Uttar Pradesh", "India", 25.3109, 83.0107, "Heritage", "One of the most famous Hindu temples dedicated to Lord Shiva.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1624314138470-5a2f24623f10?auto=format&fit=crop&w=800&q=80"],
      ["Ramnagar Fort", "Varanasi", "Uttar Pradesh", "India", 25.2684, 83.0224, "Heritage", "A fortification in Ramnagar, Varanasi, India.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?auto=format&fit=crop&w=800&q=80"],
      ["Gateway of India", "Mumbai", "Maharashtra", "India", 18.9220, 72.8347, "Heritage", "An arch-monument built during the 20th century.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80"],
      ["Marine Drive", "Mumbai", "Maharashtra", "India", 18.9431, 72.8230, "Nature", "A 3.6-kilometre-long Promenade along the Netaji Subhash Chandra Bose Road.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1570160897040-30430ef2015a?auto=format&fit=crop&w=800&q=80"],
      ["Elephanta Caves", "Mumbai", "Maharashtra", "India", 18.9633, 72.9315, "Heritage", "A UNESCO World Heritage Site and a collection of cave temples.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1590733403303-346765271842?auto=format&fit=crop&w=800&q=80"],
      ["Lonavala", "Pune", "Maharashtra", "India", 18.7546, 73.4062, "Nature", "A hill station surrounded by green valleys.", "June,July,August,September", "https://images.unsplash.com/photo-1626551411044-594296076045?auto=format&fit=crop&w=800&q=80"],
      ["Khandala", "Pune", "Maharashtra", "India", 18.7602, 73.3761, "Nature", "A hill station in the Western Ghats mountain range.", "June,July,August,September", "https://images.unsplash.com/photo-1626551411044-594296076045?auto=format&fit=crop&w=800&q=80"],
      ["Marina Beach", "Chennai", "Tamil Nadu", "India", 13.0445, 80.2824, "Beaches", "A natural urban beach in Chennai, along the Bay of Bengal.", "November,December,January,February", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"],
      ["Mahabalipuram", "Chengalpattu", "Tamil Nadu", "India", 12.6269, 80.1927, "Heritage", "Known for its temples and monuments built by the Pallava dynasty.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&w=800&q=80"],
      ["Pondicherry", "Puducherry", "Puducherry", "India", 11.9416, 79.8083, "Heritage", "A French colonial settlement in India.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1589793463357-5fb813435467?auto=format&fit=crop&w=800&q=80"],
      ["Lalbagh Botanical Garden", "Bengaluru", "Karnataka", "India", 12.9507, 77.5848, "Nature", "An old botanical garden in Bengaluru, India.", "All year round", "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80"],
      ["Mysore Palace", "Mysore", "Karnataka", "India", 12.3051, 76.6551, "Heritage", "A historical palace and a royal residence at Mysore.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1580315673010-820120286847?auto=format&fit=crop&w=800&q=80"],
      ["Coorg", "Kodagu", "Karnataka", "India", 12.3375, 75.8069, "Nature", "Known for its coffee plantations and lush greenery.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1590050752117-23a9d7fc9b5c?auto=format&fit=crop&w=800&q=80"],
      ["Nandi Hills", "Chikkaballapur", "Karnataka", "India", 13.3702, 77.6835, "Nature", "An ancient hill fortress in southern India.", "All year round", "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80"],
      ["Red Fort", "Delhi", "Delhi", "India", 28.6562, 77.2410, "Heritage", "A historic fort in the city of Delhi in India.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&w=800&q=80"],
      ["Qutub Minar", "Delhi", "Delhi", "India", 28.5245, 77.1855, "Heritage", "A UNESCO World Heritage Site in Delhi.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1523544261025-3159599b1fc3?auto=format&fit=crop&w=800&q=80"],
      ["India Gate", "Delhi", "Delhi", "India", 28.6129, 77.2295, "Heritage", "A war memorial in New Delhi.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80"],
      ["Taj Mahal", "Agra", "Uttar Pradesh", "India", 27.1751, 78.0421, "Heritage", "An ivory-white marble mausoleum.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?auto=format&fit=crop&w=800&q=80"],
      ["Agra Fort", "Agra", "Uttar Pradesh", "India", 27.1795, 78.0211, "Heritage", "A historical fort in Agra.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80"],
      ["Fatehpur Sikri", "Agra", "Uttar Pradesh", "India", 27.0945, 77.6677, "Heritage", "A city in the Agra District.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&w=800&q=80"],
      ["Konark Sun Temple", "Konark", "Odisha", "India", 19.8876, 86.0945, "Heritage", "A 13th-century CE Sun temple.", "September,October,November,December,January,February,March", "https://images.unsplash.com/photo-1623943912163-441697669830?auto=format&fit=crop&w=800&q=80"],
      ["Puri Beach", "Puri", "Odisha", "India", 19.7983, 85.8245, "Beaches", "A beach in the city of Puri.", "October,November,December,January,February", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"],
      ["Chilika Lake", "Puri", "Odisha", "India", 19.6700, 85.3300, "Nature", "A brackish water lagoon.", "November,December,January,February", "https://images.unsplash.com/photo-1590050752117-23a9d7fc9b5c?auto=format&fit=crop&w=800&q=80"],
      ["Victoria Memorial", "Kolkata", "West Bengal", "India", 22.5448, 88.3426, "Heritage", "A large marble building in Kolkata.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80"],
      ["Darjeeling Himalayan Railway", "Darjeeling", "West Bengal", "India", 27.0423, 88.2649, "Heritage", "A 2 ft narrow-gauge railway.", "March,April,May,June,September,October,November", "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80"],
      ["Tiger Hill", "Darjeeling", "West Bengal", "India", 27.0000, 88.2833, "Nature", "The summit of Ghoom.", "March,April,May,June,September,October,November", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"],
      ["Khajuraho Group of Monuments", "Khajuraho", "Madhya Pradesh", "India", 24.8318, 79.9199, "Heritage", "A group of Hindu and Jain temples.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&w=800&q=80"],
      ["Kanha National Park", "Mandla", "Madhya Pradesh", "India", 22.3345, 80.6115, "Wildlife", "One of the largest national parks.", "October,November,December,January,February,March,April,May,June", "https://images.unsplash.com/photo-1581009146145-b5ef03a7401b?auto=format&fit=crop&w=800&q=80"],
      ["Statue of Unity", "Kevadia", "Gujarat", "India", 21.8380, 73.7191, "Heritage", "The world's tallest statue.", "October,November,December,January,February,March", "https://images.unsplash.com/photo-1590075865003-e48277faf551?auto=format&fit=crop&w=800&q=80"],
      ["Rann of Kutch", "Kutch", "Gujarat", "India", 23.8000, 70.0000, "Nature", "A salt marsh in the Thar Desert.", "November,December,January,February", "https://images.unsplash.com/photo-1590593162211-f98f76d28ec5?auto=format&fit=crop&w=800&q=80"]
    ];

    for (const dest of destinations) {
      insertDest.run(...dest);
    }
  }

  // Ensure all accommodations have booking links
  const allDestsForUpdate = db.prepare("SELECT id, name FROM destinations").all() as { id: number, name: string }[];
  for (const d of allDestsForUpdate) {
    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(d.name)}`;
    db.prepare("UPDATE accommodations SET booking_link = ? WHERE destination_id = ? AND booking_link IS NULL").run(bookingUrl, d.id);
  }

  // Seed Accommodations
  const accCount = db.prepare("SELECT COUNT(*) as count FROM accommodations").get() as { count: number };
  if (accCount.count === 0) {
    const insertAcc = db.prepare(`
      INSERT INTO accommodations (destination_id, name, type, price_range, distance, image_url, booking_link)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const allDests = db.prepare("SELECT id, name, category FROM destinations").all() as { id: number, name: string, category: string }[];
    for (const d of allDests) {
      const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(d.name)}`;
      if (d.category === "Beaches") {
        insertAcc.run(d.id, "Ocean View Resort", "Resort", "$$$", 0.5, "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80", bookingUrl);
        insertAcc.run(d.id, "Backpacker Hostel", "Hostel", "$", 2.0, "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80", bookingUrl);
      } else if (d.category === "Mountains") {
        insertAcc.run(d.id, "Mountain Lodge", "Cottage", "$$$", 1.5, "https://images.unsplash.com/photo-1551882547-ff43c61f3c33?auto=format&fit=crop&w=400&q=80", bookingUrl);
        insertAcc.run(d.id, "Hilltop Guesthouse", "Guesthouse", "$$", 0.8, "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80", bookingUrl);
      } else {
        insertAcc.run(d.id, "Grand Heritage Hotel", "Hotel", "$$$", 1.0, "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80", bookingUrl);
        insertAcc.run(d.id, "City Center Inn", "Hotel", "$$", 0.5, "https://images.unsplash.com/photo-1551882547-ff43c61f3c33?auto=format&fit=crop&w=400&q=80", bookingUrl);
      }
    }
  }
}

export default db;
