import { readLines } from "https://deno.land/std/io/mod.ts";

for (let i = 1; i <= 3; i++) {
  let counter = 0;
  const fileReader = await Deno.open("src/" + i + ".xml");
  for await (const line of readLines(fileReader)) {
    if (line.includes("<problem>")) {
      counter += 1;
    }
  }
  console.log(i + ".xml: " + counter);
}
