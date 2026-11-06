import { createSignal, onCleanup } from "solid-js"
import { Option, Schema } from "effect"
import { frameHeight, HeightMessage, INITIAL_HEIGHT, visualDocument } from "./document"

const decodeHeight = Schema.decodeUnknownOption(HeightMessage)

/**
 * A block's generated UI in an opaque-origin frame: its scripts run, but it reaches neither the app, its storage nor the
 * network. The frame's height follows its document, which the frame's own script reports. A new color scheme rebuilds
 * the document, which restarts it.
 */
export function VisualFrame(props: { source: string; title: string; mode: "light" | "dark" }) {
  const [height, setHeight] = createSignal(INITIAL_HEIGHT)
  // The UI font as the app's own CSS uses it; the frame cannot see the app's variables.
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-family-sans").trim() || "inherit"
  let frame: HTMLIFrameElement | undefined

  // Only this frame's reports size it; any other window's, another block's included, are ignored.
  const onMessage = (event: MessageEvent) => {
    if (!frame || event.source !== frame.contentWindow) return

    Option.map(decodeHeight(event.data), (message) => setHeight(frameHeight(message.height)))
  }

  window.addEventListener("message", onMessage)
  onCleanup(() => window.removeEventListener("message", onMessage))

  return (
    <iframe
      ref={frame}
      data-component="visual-frame"
      class="block w-full border-0"
      style={{ height: `${height()}px` }}
      title={props.title}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      srcdoc={visualDocument({ source: props.source, mode: props.mode, font })}
    />
  )
}
