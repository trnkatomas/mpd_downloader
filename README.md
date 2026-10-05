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

## Batch download

Open the collapsible **Batch download** card below the main form to queue several MPDs:

- Paste one MPD URL per line (`# comment` lines are ignored). Add `| custom name` after a URL to override its name.
- Or import a **HAR file** (browser dev tools → Network → *Save all as HAR*): every request URL is read from `log.entries[].request.url` (the same as `jq -r ".log.entries[].request.url"`) and added to the list. By default only `.mpd` links are kept; untick the filter to import everything. Duplicates are skipped.
- Output names are generated as **prefix + number** (e.g. `show_e01`, `show_e02`), with a configurable start number and digit count.
- The queue shows each item's status (pending / running / done / failed). Items download one after another using the default selection (best video, Czech/English/first audio, all MPD subtitles).
- **Stop** halts after the current segment; pressing **Download all** again only retries items that aren't done. The CORS proxy and request headers from *More options* are reused.

## CORS errors

Browsers block cross-origin requests unless the remote server explicitly allows them. If downloads fail with a CORS error, you have two options:

### Option 1 — deployed proxy (Vercel)

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

### Option 2 — browser extension

Install a CORS-disabling extension (e.g. *CORS Everywhere* for Firefox, *Allow CORS* for Chrome). No proxy field needed.

## Files

| File | Purpose |
|---|---|
| `index.html` | The app — parsing, stream selection, and download logic |
| `api/proxy.js` | CORS proxy, packaged as a Vercel serverless function |

## Limitations

- No download resumption — a failed attempt restarts from scratch
- Video and audio are downloaded as separate files; muxing into one file requires running `ffmpeg` yourself
- Large streams are held in memory during download before being saved, so very large files may be slow on low-memory machines
