# Architecture for res of livestream app

## Viewer side (what you already guessed, confirmed)

- Homepage fetches active streams from your DB (`GET /api/streams/live`) → renders cards
- Click card → `router.push('/live/[streamId]')`
- On that page: call your backend `POST /api/streams/:id/join-token` → backend generates a LiveKit JWT (subscribe-only grant, `roomJoin: true, canPublish: false, canSubscribe: true`) → frontend connects with `Room.connect(livekitUrl, token)` → renders remote video track

## Streamer side — this is the part you're missing

**1. `/dashboard` → "Go Live" button click:**

```
POST /api/streams/create
```

Backend does:

- Creates a DB record (streamId, sellerId, auctionId, status: 'pending')
- Calls LiveKit Server SDK: `roomService.createRoom({ name: streamId })` (or just let it auto-create on first join — LiveKit does this by default)
- Generates a **publish** token for this streamer: `canPublish: true, canSubscribe: true, roomJoin: true`, identity = sellerId
- Returns `{ streamId, token, livekitUrl }`

**2. Redirect to `/dashboard/live/[streamId]`** (your "studio" page)

- On mount: `navigator.mediaDevices.getUserMedia({ video: true, audio: true })` → preview locally
- User picks camera/mic from a device dropdown (`navigator.mediaDevices.enumerateDevices()`)
- "Start Streaming" button → `room.connect()` then `room.localParticipant.publishTrack()` for camera+mic
- Update DB status to `'live'` (either via API call here, or better: via LiveKit **webhook** `room_started`/`participant_joined` — more reliable since it fires even if client crashes-and-reconnects)

**3. On stream end:** unpublish tracks, `room.disconnect()`, `POST /api/streams/:id/end` → DB status `'ended'`, plus a `room_finished` webhook as backup source of truth.

## Webhooks — don't skip this

Set a webhook URL in LiveKit dashboard/config. Listen for `room_started`, `room_finished`, `participant_left`. This is how you handle the "streamer's laptop died" case without the viewer feed showing a zombie live card forever.

## iPhone for better quality (no OBS needed)

Two options, both skip OBS entirely:

1. **Just open the go-live page in Safari on the iPhone itself.** Simplest. iPhone camera + browser IS the publisher. No laptop involved.
2. **Use iPhone as a webcam for your laptop** via apps like **Camo, EpocCam, or iVCam** (USB or same-WiFi). These install a virtual camera driver — it then shows up as a normal option in `enumerateDevices()` on your laptop, and your existing `getUserMedia` code picks it up with zero changes. This is the bridge to "future OBS" since OBS also just treats it as a virtual camera source.

So: your existing `getUserMedia`-based publish flow already supports "high quality device" — you don't need OBS or RTMP ingest until you want scene composition, overlays, or multi-camera switching. That's a clean phase 2.
