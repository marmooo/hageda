const fs = require('fs');
const readline = require('readline');

(async() => {
  for (var i=1; i<=3; i++) {
    let counter = 0;
    const stream = fs.createReadStream('src/' + i + '.xml');
    const reader = readline.createInterface({ input: stream });
    var lineno = 1;
    for await (const line of reader) {
      const str = line.replace(/<[a-z/]*>/g, '');
      if (str.match(/[<>]/) && lineno != 1) {
        console.log(i + '.xml: ' + lineno + ': ' + line);
      }
      lineno += 1;
    }
  }
})();

