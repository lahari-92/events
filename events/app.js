
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public folder path
const publicPath = path.join(__dirname, "public");

// Home page and static HTML files
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "lahari",
    database: "college"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to MySQL");
});

// READ: Get all events
app.get("/events", (req, res) => {
    const sql = "SELECT * FROM events ORDER BY event_id";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// READ: Get one event
app.get("/events/:id", (req, res) => {
    const sql = "SELECT * FROM events WHERE event_id = ?";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(results[0]);
    });
});

// CREATE: Insert an event
app.post("/events", (req, res) => {
    const {
        event_name,
        event_time,
        event_day,
        event_venue,
        event_description
    } = req.body;

    if (!event_name || !event_time || !event_day || !event_venue) {
        return res.status(400).json({
            message: "Please fill in all required fields"
        });
    }

    const sql = `
        INSERT INTO events
        (event_name, event_time, event_day,
         event_venue, event_description)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        event_name,
        event_time,
        event_day,
        event_venue,
        event_description || ""
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Event added successfully",
            event_id: result.insertId
        });
    });
});

// UPDATE: Modify an event
app.put("/events/:id", (req, res) => {
    const {
        event_name,
        event_time,
        event_day,
        event_venue,
        event_description
    } = req.body;

    if (!event_name || !event_time || !event_day || !event_venue) {
        return res.status(400).json({
            message: "Please fill in all required fields"
        });
    }

    const sql = `
        UPDATE events SET
        event_name = ?,
        event_time = ?,
        event_day = ?,
        event_venue = ?,
        event_description = ?
        WHERE event_id = ?
    `;

    const values = [
        event_name,
        event_time,
        event_day,
        event_venue,
        event_description || "",
        req.params.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            message: "Event updated successfully"
        });
    });
});

// DELETE: Remove an event
app.delete("/events/:id", (req, res) => {
    const sql = "DELETE FROM events WHERE event_id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            message: "Event deleted successfully"
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
