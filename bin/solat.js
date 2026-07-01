#!/usr/bin/env node
(async () => {
  const loc = await (await fetch("https://ipinfo.io/json")).json();
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(loc.city)}&country=${loc.country}&method=17`;
  const { data } = await (await fetch(url)).json();

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
