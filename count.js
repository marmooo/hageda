import { TextLineStream } from "jsr:@std/streams/text-line-stream";

for (let i = 1; i <= 3; i++) {
  let counter = 0;
  const file = await Deno.open(`src/data/${i}.xml`);
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    if (line.includes("<problem>")) {
      counter += 1;
    }
  }
  console.log(i + ".xml: " + counter);
}
