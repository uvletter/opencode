import { Schema } from "effect"

/**
 * The fence language a model writes for generated UI. A name of its own, so the ```` ```html ```` samples in ordinary
 * answers keep showing as code.
 */
export const VISUAL_LANGUAGE = "visual-html"

/** The type of the message the frame's own script posts with its document's height. */
export const HEIGHT_MESSAGE = "opencode.visual.height"

/** The bounds of a frame's height, so an empty document stays visible and a runaway one cannot fill the timeline. */
export const MIN_HEIGHT = 32

export const MAX_HEIGHT = 1200

/** The height a frame reserves until its document first reports one. */
export const INITIAL_HEIGHT = 240

// Everything the document may load is inline or a data or blob URL: no request leaves the frame, and no form posts.
// With `sandbox="allow-scripts"` the frame is also an opaque origin: no storage, cookies, popups or access to the app.
const POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ")

// Posts the height of the root element's box, not its scrollHeight, which never drops below the frame's own height and
// so would only ever let the frame grow. The host clamps whatever arrives.
const REPORTER = `new ResizeObserver(() => parent.postMessage({ type: "${HEIGHT_MESSAGE}", height: document.documentElement.getBoundingClientRect().height }, "*")).observe(document.documentElement)`

/**
 * The `srcdoc` for a block's source, a fragment or a whole document. The policy comes first, so it governs everything
 * the source contains; a policy the source adds can only narrow it. A doctype, `<html>` or `<head>` in the source is
 * ignored or merged by the parser, so the document stays in standards mode.
 *
 * @param input.mode - The app's color scheme, so default text, canvas and form controls match the conversation.
 * @param input.font - The app's UI font family, as the CSS `font-family` value.
 */
export function visualDocument(input: { source: string; mode: "light" | "dark"; font: string }) {
  return [
    "<!doctype html>",
    `<meta http-equiv="Content-Security-Policy" content="${POLICY}">`,
    '<meta charset="utf-8">',
    `<meta name="color-scheme" content="${input.mode}">`,
    // `<` would let a family end the style element early.
    `<style>html{font-family:${input.font.replaceAll("<", "")}}body{margin:0}</style>`,
    `<script>${REPORTER}</script>`,
    input.source,
  ].join("\n")
}

/** A height report from a frame's own script. */
export const HeightMessage = Schema.Struct({ type: Schema.Literal(HEIGHT_MESSAGE), height: Schema.Finite })

/** The frame height for a reported document height: whole pixels, within the bounds a conversation can hold. */
export function frameHeight(height: number) {
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(height)))
}
