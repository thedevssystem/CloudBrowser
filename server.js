require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let pcOnline = false;
let agentSocket = null;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: "replace-this-with-a-long-random-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

app.use(express.static(path.join(__dirname, "public")));

app.post("/login", (req, res) => {
    const { password } = req.body;

    if (password === process.env.APP_PASSWORD) {
        req.session.loggedIn = true;
        return res.json({ success: true });
    }

    res.status(401).json({
        success: false,
        message: "Wrong password"
    });
});

app.get("/dashboard", (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/health", (req, res) => {
    res.json({
        status: "online"
    });
});

io.on("connection", (socket) => {

    console.log("🔌 Socket connected");

    socket.emit("status", {
        online: pcOnline
    });

    socket.on("agent-online", () => {

        console.log("🟢 PC A Connected");

        agentSocket = socket;
        pcOnline = true;

        io.emit("status", {
            online: true
        });

    });

    socket.on("start-session", () => {

        console.log("🖥️ Remote session requested");

        if (agentSocket) {
            agentSocket.emit("start-session");
        }

    });

    socket.on("session-started", () => {

        console.log("✅ Session started");

        io.emit("session-started");

    });

    socket.on("disconnect", () => {

        if (socket === agentSocket) {

            console.log("🔴 PC A Disconnected");

            agentSocket = null;
            pcOnline = false;

            io.emit("status", {
                online: false
            });

        }

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`✅ CloudBrowser running on http://localhost:${PORT}`);
});