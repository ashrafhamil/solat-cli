#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const dir = path.join(os.homedir(), ".cache", "solat");
fs.mkdirSync(dir, { recursive: true });
const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const locFile = path.join(dir, "location");
const timingsFile = path.join(dir, `timings-${today}.json`);

const prayers = [
  ["Fajr", "Subuh"],
  ["Dhuhr", "Zohor"],
  ["Asr", "Asar"],
  ["Maghrib", "Maghrib"],
  ["Isha", "Isyak"],
];

function print(data) {
  const now = new Date().toTimeString().slice(0, 5);
  let marked = false;
  for (const [key, label] of prayers) {
    const t = data.timings[key];
    const mark = !marked && t > now ? (marked = true, " <-") : "";
    console.log(`\x1b[32m${label.padEnd(8)} ${t}${mark}\x1b[0m`);
  }
}

async function refresh() {
  const loc = await (await fetch("https://ipinfo.io/json")).json();
  const newLoc = `${loc.city} ${loc.country}`;
  const oldLoc = fs.existsSync(locFile) ? fs.readFileSync(locFile, "utf8") : "";
  if (newLoc !== oldLoc) {
    fs.writeFileSync(locFile, newLoc);
    if (fs.existsSync(timingsFile)) fs.unlinkSync(timingsFile);
  }
  if (!fs.existsSync(timingsFile)) {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(loc.city)}&country=${loc.country}&method=17`;
    const json = await (await fetch(url)).json();
    fs.writeFileSync(timingsFile, JSON.stringify(json));
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith("timings-") && f !== `timings-${today}.json`) fs.unlinkSync(path.join(dir, f));
    }
    return json.data;
  }
  return JSON.parse(fs.readFileSync(timingsFile, "utf8")).data;
}

if (process.argv[2] === "--refresh") {
  refresh();
} else if (fs.existsSync(timingsFile)) {
  print(JSON.parse(fs.readFileSync(timingsFile, "utf8")).data);
  spawn(process.execPath, [__filename, "--refresh"], { detached: true, stdio: "ignore" }).unref();
} else {
  refresh().then(print);
}
