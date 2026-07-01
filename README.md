# solat-cli

Prayer times CLI. Auto-detects your location via IP, works worldwide.

Uses the correct calculation method per country (JAKIM for Malaysia, MUIS for Singapore, Kemenag for Indonesia, ISNA for US/Canada, Umm al-Qura for Saudi, etc.), falls back to Muslim World League (MWL) for anywhere else.

## Install

```
npm install -g solat-cli
```

## Usage

```
solat
```

```
Subuh    05:43
Zohor    13:19 <-
Asar     16:46
Maghrib  19:31
Isyak    20:47
```

`<-` marks the next upcoming prayer.
