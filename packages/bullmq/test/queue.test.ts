import assert from "node:assert/strict";
import test from "node:test";
import { jobIdForAsset } from "../src/index.js";

test("creates stable BullMQ-safe IDs from arbitrary asset IDs", () => {
  const first = jobIdForAsset("tenant:album/photo 1");
  assert.equal(first, jobIdForAsset("tenant:album/photo 1"));
  assert.notEqual(first, jobIdForAsset("tenant:album/photo 2"));
  assert.match(first, /^asset-[a-f0-9]{64}$/);
  assert.equal(first.includes(":"), false);
});
