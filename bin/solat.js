#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");

(async () => {
  const dir = path.join(os.homedir(), ".cache", "solat");
  fs.mkdirSync(dir, { recursive: true });
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const locFile = path.join(dir, "location");
  const timingsFile = path.join(dir, `timings-${today}.json`);

  const loc = await (await fetch("https://ipinfo.io/json")).json();
  const newLoc = `${loc.city} ${loc.country}`;
  const oldLoc = fs.existsSync(locFile) ? fs.readFileSync(locFile, "utf8") : "";

  if (newLoc !== oldLoc) {
    fs.writeFileSync(locFile, newLoc);
    if (fs.existsSync(timingsFile)) fs.unlinkSync(timingsFile);
  }

  let data;
  if (fs.existsSync(timingsFile)) {
    data = JSON.parse(fs.readFileSync(timingsFile, "utf8")).data;
  } else {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(loc.city)}&country=${loc.country}&method=17`;
    const json = await (await fetch(url)).json();
    fs.writeFileSync(timingsFile, JSON.stringify(json));
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith("timings-") && f !== `timings-${today}.json`) fs.unlinkSync(path.join(dir, f));
    }
    data = json.data;
  }

  const prayers = [
    ["Fajr", "Subuh"],
    ["Dhuhr", "Zohor"],
    ["Asr", "Asar"],
    ["Maghrib", "Maghrib"],
    ["Isha", "Isyak"],
  ];

  const now = new Date().toTimeString().slice(0, 5);
  let marked = false;

  for (const [key, label] of prayers) {
    const t = data.timings[key];
    const mark = !marked && t > now ? (marked = true, " <-") : "";
    console.log(`\x1b[32m${label.padEnd(8)} ${t}${mark}\x1b[0m`);
  }
})();
