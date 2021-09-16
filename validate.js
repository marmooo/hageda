import { readLines } from "https://deno.land/std/io/mod.ts";

for (let i = 1; i <= 3; i++) {
  let lineno = 1;
  const fileReader = await Deno.open("src/" + i + ".xml");
  for await (const line of readLines(fileReader)) {
    const str = line.replace(/<[a-z/]*>/g, "");
    if (str.match(/[<>]/) && lineno != 1) {
      console.log(i + ".xml: " + lineno + ": " + line);
    }
    lineno += 1;
  }
}
