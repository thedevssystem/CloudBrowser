const { spawn } = require("child_process");
const path = require("path");

let chromeProcess = null;

function getChromePath() {

    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

}

function launchBrowser(profile = "Guest") {

    if (chromeProcess) {

        console.log("⚠️ Chrome is already running.");

        return;

    }

    const userDataDir = path.join(__dirname, "profiles", profile);

    chromeProcess = spawn(getChromePath(), [
        `--user-data-dir=${userDataDir}`,
        "--new-window",
        "https://www.google.com"
    ], {

        detached: false

    });

    console.log(`🚀 Chrome launched (${profile})`);

    chromeProcess.on("exit", () => {

        console.log("❌ Chrome closed.");

        chromeProcess = null;

    });

}

module.exports = {

    launchBrowser

};