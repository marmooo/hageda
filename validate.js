import { TextLineStream } from "jsr:@std/streams/text-line-stream";

for (let i = 1; i <= 3; i++) {
  let lineno = 1;
  const file = await Deno.open(`src/data/${i}.xml`);
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    const str = line.replace(/<[a-z/]*>/g, "");
    if (str.match(/[<>]/) && lineno != 1) {
      console.log(i + ".xml: " + lineno + ": " + line);
    }
    lineno += 1;
  }
}
