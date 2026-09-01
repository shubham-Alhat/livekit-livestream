# Livekit livestream app

understanding preview/go live flow and handling alledge cases with livekit sdk

### Understand livekit and how to implement it in app

The three possible ways the seller will stream -
[google AI](https://share.google/aimode/v71SEIBmelP4ov0ug)

[ingress and streaming with other devices](https://claude.ai/share/d51ce954-5b0c-4850-99a4-78fcabcde33d)

[managing tracks in livekit](https://claude.ai/share/d93f26fe-d23a-46e9-b6cd-bd6b408f44a4)

# LiveKit in BidHub — Host Broadcast + Viewer Subscribe Flow

Mental model before the code: LiveKit is an SFU. Your Node.js backend never touches
media — it only issues signed JWTs ("access tokens") that say _who this user is_ and
_what they're allowed to do in a given room_. Your Next.js frontend uses that token to
connect directly to LiveKit's servers over WebRTC. So the flow is:

```
Browser (host)  →  BidHub backend: "give me a token for auction #123, I'm the seller"
Browser (host)  →  LiveKit Cloud: connect with token, publish camera track
Browser (viewer) →  BidHub backend: "give me a token for auction #123, I'm a bidder"
Browser (viewer) →  LiveKit Cloud: connect with token, subscribe to seller's track
```

Room name = your `auctionId`. Identity = your `userId`. This piggybacks naturally on
your existing JWT auth — you already know who's making the request.

---

## 1. Install

Backend (Node/TS):

```bash
npm install livekit-server-sdk
```

Frontend (Next.js):

```bash
npm install livekit-client @livekit/components-react @livekit/components-styles
```

Env vars (both sides need the URL, only backend needs the secret):

```
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=xxxx
LIVEKIT_API_SECRET=xxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

---

## 2. Backend: token endpoint

This is the piece that encodes your auction's permission model. The seller gets
`canPublish`, everyone else gets subscribe-only. This is where you plug into your
existing JWT middleware to get `req.user`.

```ts
// src/routes/livekit.ts
import { Router } from "express";
import { AccessToken } from "livekit-server-sdk";
import { requireAuth } from "../middleware/auth"; // your existing JWT middleware

const router = Router();

router.post("/livekit/token", requireAuth, async (req, res) => {
  const { auctionId } = req.body;
  const userId = req.user.id;

  // Look up the auction, confirm this user is the seller for this room
  const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
  if (!auction) return res.status(404).json({ error: "Auction not found" });

  const isHost = auction.sellerId === userId;

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: userId, // must be unique per participant in the room
      name: req.user.displayName,
      ttl: "2h",
    },
  );

  at.addGrant({
    room: auctionId, // room name == your auction id
    roomJoin: true,
    canPublish: isHost, // only the seller can publish camera/mic
    canPublishData: true, // let everyone send data messages (e.g. reactions)
    canSubscribe: true, // everyone can watch
  });

  const token = await at.toJwt();
  res.json({ token, url: process.env.LIVEKIT_URL });
});

export default router;
```

Key thing to internalize: `canPublish` is enforced server-side by LiveKit itself, not
just hidden in the UI. Even if a bidder's client tried to call `publishTrack()`, LiveKit
would reject it because their token doesn't have the grant. That's your security
boundary — same spirit as your Redis Lua atomic bid validation: don't trust the client,
enforce state transitions at the source of truth.

---

## 3. Frontend: host page (publishes video)

```tsx
// app/auction/[id]/host/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  useLocalParticipant,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

export default function HostPage({ params }: { params: { id: string } }) {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    fetch("/api/livekit/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // sends your existing auth cookies/JWT
      body: JSON.stringify({ auctionId: params.id }),
    })
      .then((r) => r.json())
      .then((data) => setToken(data.token));
  }, [params.id]);

  if (!token) return <div>Loading stream...</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
      connect={true}
      video={true} // auto-publish camera on join
      audio={true} // auto-publish mic on join
    >
      <HostVideoView />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function HostVideoView() {
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera]).filter(
    (t) => t.participant.identity === localParticipant.identity,
  );

  return (
    <div>
      {tracks.map((t) => (
        <VideoTrack key={t.publication.trackSid} trackRef={t} />
      ))}
    </div>
  );
}
```

The `video={true} audio={true}` props on `<LiveKitRoom>` do the `getUserMedia()` +
`publishTrack()` dance for you — this is the part you built by hand for your Omegle
clone. `useTracks` is a hook that gives you reactive `TrackReference` objects (this is
the `Track`/`TrackPublication` pairing from the docs page you just read).

---

## 4. Frontend: viewer page (subscribes only)

```tsx
// app/auction/[id]/watch/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

export default function WatchPage({ params }: { params: { id: string } }) {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    fetch("/api/livekit/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ auctionId: params.id }),
    })
      .then((r) => r.json())
      .then((data) => setToken(data.token));
  }, [params.id]);

  if (!token) return <div>Connecting...</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
      connect={true}
      video={false} // viewer doesn't publish anything
      audio={false}
    >
      <SellerStreamView />
      <RoomAudioRenderer />
      {/* Your existing bid panel / WebSocket bid feed sits alongside this */}
    </LiveKitRoom>
  );
}

function SellerStreamView() {
  // Grabs whatever camera track is published in the room — the seller's
  const tracks = useTracks([Track.Source.Camera]);

  if (tracks.length === 0) return <div>Waiting for seller to go live...</div>;

  return <VideoTrack trackRef={tracks[0]} />;
}
```

Because the token has `canPublish: false`, this client never sends media — it's a
pure subscriber. `autoSubscribe` defaults to `true` on room join, so as soon as the
seller's track is published, `useTracks` picks it up reactively without any manual
subscribe call.

---

## How this sits next to your existing stack

- **Room name = auctionId** ties LiveKit's session directly to your Postgres auction
  record — no separate mapping table needed.
- **Bidding stays on your existing WebSocket/Redis pipeline.** LiveKit only carries
  video/audio. Don't try to send bid data over LiveKit's data channel unless you
  want to migrate that too — keep it separate for now, less to debug.
- **Auction end → tear down the room.** When your BullMQ auction-end job fires, call
  the server SDK's `RoomServiceClient.deleteRoom(auctionId)` to force-disconnect
  everyone and free resources.
