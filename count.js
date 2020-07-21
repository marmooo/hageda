const fs = require('fs');
const readline = require('readline');

(async() => {
  for (var i=1; i<=3; i++) {
    let counter = 0;
    const stream = fs.createReadStream('src/' + i + '.xml');
    const reader = readline.createInterface({ input: stream });
    for await (const line of reader) {
      if (line.includes('<problem>')) {
        counter += 1;
      }
    }
    console.log(i + '.xml: ' + counter);
  }
})();

