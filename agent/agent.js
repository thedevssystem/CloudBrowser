const { io } = require("socket.io-client");
const { launchBrowser } = require("./browserManager");

const socket = io("http://localhost:3000");

socket.on("connect", () => {

    console.log("✅ Connected to CloudBrowser");

    socket.emit("agent-online");

});

socket.on("start-session", () => {

    console.log("🖥️ Starting browser...");

    launchBrowser("Guest");

    socket.emit("session-started");

});

socket.on("disconnect", () => {

    console.log("❌ Disconnected");

});