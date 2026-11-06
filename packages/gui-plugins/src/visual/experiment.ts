import { motionTuning } from "@opencode/ui/motion-tuning"

/** Experiment: ```` ```visual-html ```` blocks in the conversation run as sandboxed generated UI. Off by default. */
export const visualExperiment = motionTuning.toggle("visual.html", {
  label: "Enabled",
  group: "Experiments",
  subsection: "Generated visuals",
  description: "visual-html code blocks run as sandboxed UI in place of their code",
  target: '[data-component="visual-frame"]',
  experiment: true,
  value: false,
})
