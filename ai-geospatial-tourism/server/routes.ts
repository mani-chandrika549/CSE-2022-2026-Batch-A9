import { Express } from "express";
import db from "./database";

// Helper function for geospatial distance (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

export default function setupRoutes(app: Express) {
  // --- AUTH ROUTES ---
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, password);
      res.json({ id: result.lastInsertRowid, name, email });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ id: user.id, name: user.name, email: user.email });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- HISTORY ROUTES ---
  app.get("/api/history/:userId", (req, res) => {
    const history = db.prepare("SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC").all(req.params.userId);
    res.json(history);
  });

  app.post("/api/history", (req, res) => {
    const { user_id, month, interest, destination_name } = req.body;
    db.prepare("INSERT INTO history (user_id, month, interest, destination_name) VALUES (?, ?, ?, ?)").run(user_id, month, interest, destination_name);
    res.json({ success: true });
  });

  // --- DESTINATION ROUTES ---
  app.get("/api/destinations", (req, res) => {
    const { month, preference } = req.query;
    let query = "SELECT * FROM destinations WHERE 1=1";
    const params: any[] = [];

    if (month) {
      query += " AND best_months LIKE ?";
      params.push(`%${month}%`);
    }

    if (preference && preference !== "all") {
      query += " AND category = ?";
      params.push(preference);
    }

    const destinations = db.prepare(query).all(...params);
    res.json(destinations);
  });

  app.get("/api/destinations/:id", (req, res) => {
    const dest = db.prepare("SELECT * FROM destinations WHERE id = ?").get(req.params.id);
    res.json(dest);
  });

  // --- NEARBY RECOMMENDATION LOGIC ---
  app.get("/api/nearby/:id", (req, res) => {
    const target = db.prepare("SELECT latitude, longitude, state FROM destinations WHERE id = ?").get(req.params.id) as any;
    if (!target) return res.status(404).json({ error: "Not found" });

    const others = db.prepare("SELECT * FROM destinations WHERE id != ?").all(req.params.id) as any[];
    
    const RADIUS_LIMIT = 200; // 200 km limit

    const nearby = others.map(d => ({
      ...d,
      distance: getDistance(target.latitude, target.longitude, d.latitude, d.longitude)
    }))
    .filter(d => d.distance <= RADIUS_LIMIT)
    .sort((a, b) => {
      // Prefer same state
      if (a.state === target.state && b.state !== target.state) return -1;
      if (a.state !== target.state && b.state === target.state) return 1;
      return a.distance - b.distance;
    })
    .slice(0, 10);

    res.json(nearby);
  });

  // --- ACCOMMODATION ROUTES ---
  app.get("/api/accommodations/:destId", (req, res) => {
    const accs = db.prepare("SELECT * FROM accommodations WHERE destination_id = ?").all(req.params.destId);
    res.json(accs);
  });
}
