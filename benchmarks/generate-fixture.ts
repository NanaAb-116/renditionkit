import { resolve } from "node:path";
import sharp from "sharp";

const arguments_ = process.argv
  .slice(2)
  .filter((argument) => argument !== "--");
const output = resolve(arguments_[0] ?? "benchmarks/fixture.jpg");
const width = Number(arguments_[1] ?? 6000);
const height = Number(arguments_[2] ?? 4000);

if (
  !Number.isInteger(width) ||
  width < 1 ||
  !Number.isInteger(height) ||
  height < 1
) {
  throw new Error("Width and height must be positive integers.");
}

await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: { r: 63, g: 81, b: 181 },
  },
})
  .jpeg({ quality: 92 })
  .toFile(output);

console.log(JSON.stringify({ output, width, height }));
