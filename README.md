# JSON Visualiser Extension

This is a very small Chrome extension.

It looks for pages that are basically just raw JSON. When it finds one, it replaces that page with an iframe that loads `https://jsonvisualiser.com/extension`, then sends the JSON into that app so the user sees a nicer UI instead of plain text.

## Simple flow

1. The content script runs on normal `http` and `https` pages.
2. It checks whether the current page looks like raw JSON.
3. If it is JSON, it reads the page text.
4. It clears the page and mounts an iframe that points to the JSON Visualiser web app.
5. It streams the JSON text into the iframe.

## Files

- `manifest.json` registers the extension and injects `content.js` on pages.
- `content.js` detects raw JSON pages, swaps the page for the iframe, and streams the JSON payload.

## Streaming logic

The extension does not send the full JSON in one big `postMessage`.

Instead it:

1. Waits for the iframe app to say it is ready with `JSON_VISUALISER_READY`.
2. Opens a `MessageChannel`.
3. Sends metadata first with `JSON_VISUALISER_PORT`.
4. Splits the JSON into chunks of `256 KB`.
5. Sends one chunk at a time as `JSON_VISUALISER_CHUNK`.
6. Waits for `JSON_VISUALISER_ACK` before sending the next chunk.
7. Sends `JSON_VISUALISER_COMPLETE` after the last chunk.

The streaming logic was updated to be a bit safer:

- It keeps `version: 1` in the stream metadata.
- It generates a transfer id for each stream.
- It times out if the iframe never becomes ready.
- It times out if a chunk ack never comes back.
- It aborts the transfer if chunk acknowledgements arrive out of order.
- It closes the message channel cleanly on completion, abort, or page unload.

## Local loading

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click **Load unpacked**.
4. Select this folder.

If you want `file://` JSON support later, add `file://*/*` to the match list and enable file URL access for the extension in Chrome.
