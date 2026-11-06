import { createSignal, onCleanup } from "solid-js"
import { motionTuning } from "@opencode/ui/motion-tuning"
import { CodeBlock, createKeyed, type Plugin } from "@opencode/plugin/gui"
import type Visual from "./index"
import { VISUAL_LANGUAGE } from "./document"
import { visualExperiment } from "./experiment"
import { VisualFrame } from "./frame"

/**
 * Generated UI in the conversation: a ```` ```visual-html ```` block shows its HTML, CSS and scripts running in a
 * sandboxed frame in place of the code, which stays a click away through Copy. Only while the experiment is on: the
 * contribution comes and goes with it, so blocks already on screen switch as the user toggles it.
 *
 * Desktop only: the web app's Content Security Policy allows no inline script, and a `srcdoc` frame inherits it, so
 * there the block keeps its code.
 */
const setup: Plugin.Setup<typeof Visual> = (ctx) => {
  if (!ctx.desktop) return
  const [enabled, setEnabled] = createSignal(visualExperiment())
  onCleanup(motionTuning.subscribe(() => setEnabled(visualExperiment())))

  createKeyed(enabled, () => {
    ctx.add(CodeBlock, {
      languages: [VISUAL_LANGUAGE],
      render: (props) => <VisualFrame source={props.code} title={ctx.t("title")} mode={ctx.appearance.mode()} />,
    })
  })
}

export default setup
