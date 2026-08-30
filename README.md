# MPD Downloader

A lightweight, single-file browser app for downloading DASH (MPD) audio/video streams — no build step, no dependencies.

## What it does

Paste an MPD URL, paste raw MPD XML, or drop a local `.mpd` file, and the app:

- Parses the manifest and lists available video qualities, audio languages, and subtitle tracks
- Lets you pick which streams to download (defaults to best video quality and Czech/English/original audio)
- Fetches every segment and saves each stream as a separate file (`name_video.mp4`, `name_audio.m4a`, subtitles)
- Shows the `ffmpeg` command to mux video + audio into a single file afterward (run locally — ffmpeg is not part of the app)

## Usage

Just open [index.html](index.html) directly in a browser. No server required.

### More options

Click **More options** to reveal:

- **Stream selection** — quality/language dropdowns, populated after parsing
- **Subtitle URL** — for an external subtitle file not referenced by the MPD
- **CORS proxy prefix** — see below
- **Request headers** — JSON or curl (`-H "..."`) format, needed if the source requires auth headers or cookies

## CORS errors

Browsers block cross-origin requests unless the remote server explicitly allows them. If downloads fail with a CORS error, you have two options:

### Option 1 — local proxy

```bash
node proxy.js
```

Leave it running, then set the CORS proxy prefix in the app to:

```
http://localhost:8079/
```

No dependencies — just Node.js.

### Option 2 — deployed proxy (Vercel)

Deploy this project to [Vercel](https://vercel.com) (free Hobby tier is enough):

```bash
npm install -g vercel
vercel
```

This serves `index.html` as a static site and `api/proxy.js` as a serverless function on the same domain. Once deployed, set the CORS proxy prefix to:

```
https://your-app.vercel.app/api/proxy?url=
```

This works from any device without needing a terminal running locally.

### Option 3 — browser extension

Install a CORS-disabling extension (e.g. *CORS Everywhere* for Firefox, *Allow CORS* for Chrome). No proxy field needed.

## Files

| File | Purpose |
|---|---|
| `index.html` | The app — parsing, stream selection, and download logic |
| `proxy.js` | Standalone Node CORS proxy for local use |
| `api/proxy.js` | Same proxy, packaged as a Vercel serverless function |

## Limitations

- No download resumption — a failed attempt restarts from scratch
- Video and audio are downloaded as separate files; muxing into one file requires running `ffmpeg` yourself
- Large streams are held in memory during download before being saved, so very large files may be slow on low-memory machines
