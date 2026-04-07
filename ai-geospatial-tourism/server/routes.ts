import { Express } from "express";
import db from "./database";

// Helper function for geospatial distance (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function setupRoutes(app: Express) {

  // --- AUTH ROUTES ---
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password } = req.body;
    try {
      const result = db.prepare(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
      ).run(name, email, password);
      res.json({ id: result.lastInsertRowid, name, email });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare(
      "SELECT * FROM users WHERE email = ? AND password = ?"
    ).get(email, password) as any;

    if (user) {
      res.json({ id: user.id, name: user.name, email: user.email });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- HISTORY ROUTES ---
  app.get("/api/history/:userId", (req, res) => {
    const history = db.prepare(
      "SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC"
    ).all(req.params.userId);
    res.json(history);
  });

  app.post("/api/history", (req, res) => {
    const { user_id, month, interest, destination_name } = req.body;
    db.prepare(
      "INSERT INTO history (user_id, month, interest, destination_name) VALUES (?, ?, ?, ?)"
    ).run(user_id, month, interest, destination_name);
    res.json({ success: true });
  });

  // --- DESTINATION ROUTES ---
  app.get("/api/destinations", (req, res) => {
  const { month, preference, userId, lat, lon } = req.query;

  const destinations = db.prepare("SELECT * FROM destinations").all();

  const pref = String(preference || "").toLowerCase();

  // ✅ Build user preferences
  const userPreferences: any = {};

  if (userId) {
    const historyData = db.prepare(
      "SELECT interest FROM history WHERE user_id = ?"
    ).all(userId) as any[];

    historyData.forEach((h) => {
      const key = String(h.interest).toLowerCase();
      if (key !== "all") {
        userPreferences[key] = (userPreferences[key] || 0) + 1;
      }
    });
  }

  const scored = destinations.map((d: any) => {
    let score = 0;

    const category = String(d.category).toLowerCase();

    // Preference
    if (pref !== "all" && category === pref) {
      score += 10;
    }

    // Month
    if (month && d.best_months.toLowerCase().includes(String(month).toLowerCase())) {
      score += 6;
    }

    // History boost
    if (userPreferences[category]) {
      score += userPreferences[category] * 2;
    }

    // Nearby
    let distance = null;
    if (lat && lon) {
      distance = getDistance(
        Number(lat),
        Number(lon),
        d.latitude,
        d.longitude
      );
      score += Math.max(0, 5 - distance / 100);
    }

    return {
      ...d,
      score,
      distance,
      reason: {
        personalized: !!userPreferences[category],
        nearby: !!distance && distance < 300
      }
    };
  });

  const result = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  res.json(result);
});

  app.get("/api/destinations/:id", (req, res) => {
    const dest = db.prepare(
      "SELECT * FROM destinations WHERE id = ?"
    ).get(req.params.id);
    res.json(dest);
  });

  // --- NEARBY RECOMMENDATION LOGIC ---
  app.get("/api/nearby/:id", (req, res) => {
    const target = db.prepare(
      "SELECT latitude, longitude, state FROM destinations WHERE id = ?"
    ).get(req.params.id) as any;

    if (!target) return res.status(404).json({ error: "Not found" });

    const others = db.prepare(
      "SELECT * FROM destinations WHERE id != ?"
    ).all(req.params.id) as any[];

    const RADIUS_LIMIT = 200;

    const nearby = others.map(d => ({
      ...d,
      distance: getDistance(
        target.latitude,
        target.longitude,
        d.latitude,
        d.longitude
      )
    }))
    .filter(d => d.distance <= RADIUS_LIMIT)
    .sort((a, b) => {
      if (a.state === target.state && b.state !== target.state) return -1;
      if (a.state !== target.state && b.state === target.state) return 1;
      return a.distance - b.distance;
    })
    .slice(0, 10);

    res.json(nearby);
  });

  // --- ACCOMMODATION ROUTES ---
  app.get("/api/accommodations/:destId", (req, res) => {
    const accs = db.prepare(
      "SELECT * FROM accommodations WHERE destination_id = ?"
    ).all(req.params.destId);
    res.json(accs);
  });
}
