import { expect, test } from "bun:test"
import { Option, Schema } from "effect"
import { frameHeight, HEIGHT_MESSAGE, HeightMessage, MAX_HEIGHT, MIN_HEIGHT, visualDocument } from "./document"

test("the policy comes right after the doctype, ahead of everything the source contains", () => {
  const source = '<meta http-equiv="Content-Security-Policy" content="connect-src *"><script>fetch("/")</script>'
  const lines = visualDocument({ source, mode: "dark", font: "Inter, sans-serif" }).split("\n")

  expect(lines[0]).toBe("<!doctype html>")
  expect(lines[1]).toStartWith('<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; ')
  expect(lines[1]).not.toContain("connect-src")
  expect(lines.indexOf(source)).toBe(lines.length - 1)
})

test("the document follows the app's color scheme and UI font", () => {
  const html = visualDocument({ source: "<p>Hi</p>", mode: "dark", font: "Inter, sans-serif" })

  expect(html).toContain('<meta name="color-scheme" content="dark">')
  expect(html).toContain("html{font-family:Inter, sans-serif}")
})

test("a font family cannot end the style element", () => {
  const html = visualDocument({ source: "", mode: "light", font: "x</style><script>alert(1)</script>" })

  expect(html).not.toContain("</style><script>alert(1)")
})

test("only a well-formed height report sizes the frame, clamped to the conversation's bounds", () => {
  const decode = Schema.decodeUnknownOption(HeightMessage)

  expect(Option.getOrUndefined(decode({ type: HEIGHT_MESSAGE, height: 312.4 }))?.height).toBe(312.4)
  expect(Option.isNone(decode({ type: "other", height: 300 }))).toBe(true)
  expect(Option.isNone(decode({ type: HEIGHT_MESSAGE, height: Number.NaN }))).toBe(true)
  expect(Option.isNone(decode({ type: HEIGHT_MESSAGE, height: "300" }))).toBe(true)
  expect(Option.isNone(decode("300"))).toBe(true)

  expect(frameHeight(312.4)).toBe(313)
  expect(frameHeight(0)).toBe(MIN_HEIGHT)
  expect(frameHeight(1_000_000)).toBe(MAX_HEIGHT)
})
