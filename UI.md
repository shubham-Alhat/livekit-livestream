the third div in UI. inside <Main>

![alt text](image.png)

```jsx
{
  /* STAGE 5: External Setup Controls */
}
{
  !isMobile && (
    <div className="w-full max-w-sm grid grid-cols-2 gap-3 text-left bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80 shrink-0">
      <label className="flex flex-col gap-1 text-xs font-medium text-zinc-400">
        Camera
        <select
          onChange={onSelectVideo}
          value={selectedVideoId}
          className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {videoDevices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-zinc-400">
        Microphone
        <select
          value={selectedAudioId}
          onChange={onSelectAudio}
          className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {audioDevices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

<Button
  disabled={loading}
  onClick={handleGoLiveClick}
  className="w-full max-w-sm py-2.5 rounded-xl bg-yellow-500 text-zinc-950 font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
  type="button"
>
  Go Live
</Button>;
```

## Handling double scrollbars on mobile screens

Option 1: App-Like Layout (Recommended for this UI)
If you want the red background to stay perfectly fixed in place and only the inner content (video + shop) to scroll, you need to lock the outer containers to exactly the height of the screen and prevent them from overflowing.

Update your classes like this:

```jsx
{/* 1. Change min-h-dvh to h-dvh and add overflow-hidden to lock the page */}
<main className="h-dvh overflow-hidden lg:min-h-0 lg:h-[calc(100vh-62px)] bg-red-700 flex flex-col">

  {/* 2. Add flex-1 and min-h-0 so it perfectly fills the available space */}
  <div className="bg-neutral-25 px-4 pb-4 flex-1 flex flex-col min-h-0">

    {/* 3. Change h-screen to h-full, and drop mb-4 so it doesn't push past the bottom */}
    <div className="block lg:grid gap-4 lg:relative inset-0 lg:py-4 overflow-y-auto h-full lg:h-[calc(100vh-62px)] lg:min-h-0 items-start grid-rows-1 ...">
      {/* streamer section */}
```

Option 2: Native Web Layout (Better for Mobile Browsers)
When you lock scrolling to an inner div on mobile (Option 1), the mobile browser's URL bar (like Safari's bottom bar) usually won't hide automatically as the user scrolls down. If you want the URL bar to hide naturally to give the video more screen space, you should let the <main> handle all the scrolling.

To do this, simply remove the fixed height and overflow from the inner container on mobile:

```jsx
<main className="min-h-dvh lg:min-h-0 lg:h-[calc(100vh-62px)] bg-red-700">
  <div className="bg-neutral-25 px-4 pb-4">
    {/* 1. Removed h-screen and overflow-y-scroll for mobile. Kept them for lg screens */}
    <div className="block lg:grid gap-4 lg:relative inset-0 lg:py-4 lg:overflow-y-auto lg:h-[calc(100vh-62px)] lg:min-h-0 items-start mb-4 grid-rows-1 ...">
      {/* streamer section */}
```
