const playPanel = document.getElementById('playPanel');
const countPanel = document.getElementById('countPanel');
const scorePanel = document.getElementById('scorePanel');
const startButton = document.getElementById('startButton');
const roma = document.getElementById('roma');
const japanese = document.getElementById('japanese');
const timeOption = document.getElementById('timeOption');
const infoPanel = document.getElementById('infoPanel');
const aa = document.getElementById('aa');
const timeArr = [180, 180, 300];
const tmpCanvas = document.createElement('canvas');
let typeTimer;
const bgm = new Audio('bgm.mp3');
bgm.volume = 0.3;
bgm.loop = true;
let typeIndex = 0;
let errorCount = 0;
let normalCount = 0;
let solveCount = 0;
let problems = [];

function clearConfig() {
  localStorage.clear();
}

function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.body.dataset.theme = 'dark';
  }
  if (localStorage.getItem('bgm') == 1) {
    var bgmButton = document.getElementById('bgmButton');
    bgmButton.classList.remove('close');
    bgmButton.dataset.enabled = 'true';
  }
}
loadConfig();

function toggleBGM() {
  var bgmButton = document.getElementById('bgmButton');
  if (bgmButton.dataset && bgmButton.dataset.enabled == 'true') {
    bgmButton.classList.add('close');
    bgmButton.dataset.enabled = 'false';
    localStorage.setItem('bgm', 0);
    bgm.pause();
  } else {
    bgmButton.classList.remove('close');
    bgmButton.dataset.enabled = 'true';
    localStorage.setItem('bgm', 1);
    bgm.play();
  }
}

function toggleDarkMode() {
  if (localStorage.getItem('darkMode') == 1) {
    localStorage.setItem('darkMode', 0);
    delete document.body.dataset.theme;
  } else {
    localStorage.setItem('darkMode', 1);
    document.body.dataset.theme = 'dark';
  }
}

function toggleOverview() {
  var overview = document.getElementById('overview');
  if (overview.dataset && overview.dataset.collapse == 'true') {
    overview.dataset.collapse = 'false';
    overview.classList.add('d-none');
    overview.classList.add('d-sm-block');
  } else {
    overview.dataset.collapse = 'true';
    overview.classList.remove('d-none');
    overview.classList.remove('d-sm-block');
  }
}

// https://stackoverflow.com/questions/41847901/ie11-element-children-polyfill
//make sure we have Node.children and Element.children available
(function (constructor) {
  if (constructor &&
    constructor.prototype &&
    constructor.prototype.children == null) {
    Object.defineProperty(constructor.prototype, 'children', {
      get: function () {
        var i = 0, node, nodes = this.childNodes, children = [];
        //iterate all childNodes
        while (node = nodes[i++]) {
          //remenber those, that are Node.ELEMENT_NODE (1)
          if (node.nodeType === 1) { children.push(node); }
        }
        return children;
      }
    });
  }
  //apply the fix to all HTMLElements (window.Element) and to SVG/XML (window.Node)
})(window.Node || window.Element);

function loadProblems() {
  var level = timeOption.selectedIndex + 1;
  if (level > 0) {
    fetch(level + '.xml').then(function(response) {
      return response.text();
    }).then(function(str) {
      const parser = new DOMParser();
      return parser.parseFromString(str, 'text/xml');
    }).then(function(xml) {
      problems = xml.documentElement.children;  // IE11 required polyfill (above)
    }).catch(function(err) {
      console.error(err);
    });
  }
}

function fixTypeStyle(currNode, word) {
  currNode.textContent = word;
  typeNormal(currNode);
}

function appendWord(nextNode, word) {
  const span = document.createElement('span');
  span.textContent = word;
  nextNode.parentNode.insertBefore(span, nextNode);
}

// http://typingx0.net/key_l.html
function checkTypeStyle(currNode, word, key) {
  const nodes = roma.childNodes;
  const nextNode = nodes[typeIndex+1];
  const nextWord = nextNode.textContent;
  let prevWord;
  if (typeIndex != 0) {
    prevWord = nodes[typeIndex-1].textContent;
  }
  let secondWord;
  if (nodes[typeIndex+2]) {
    secondWord = nodes[typeIndex+2].textContent;
  }
  if (word == 'c' && key == 'k' &&  // ca, cu, co --< ka, ku, ko
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'o')) {
    fixTypeStyle(currNode, key);
  } else if (word == 'k' && key == 'c' &&  // ka, ku, ko --< ca, cu, co
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'o')) {
    fixTypeStyle(currNode, key);
  } else if (word == 'i' && key == 'h' && prevWord == 's') {  // si --> shi
    fixTypeStyle(currNode, key);
    appendWord(nextNode, 'i');
  } else if (word == 'h' && key == 'i' && prevWord == 's') {  // shi --> si
    fixTypeStyle(currNode, key);
    nextNode.remove();
  } else if (word == 's' && key == 'c' && (nextWord == 'i' || nextWord == 'e')) {  // si, se --> ci, ce
    fixTypeStyle(currNode, key);
  } else if (word == 'c' && key == 's' && (nextWord == 'i' || nextWord == 'e')) {  // ci, ce --> si, se
    fixTypeStyle(currNode, key);
  } else if (word == 'z' && key == 'j' && nextWord == 'i') {  // zi --> ji
    fixTypeStyle(currNode, key);
  } else if (word == 'j' && key == 'z' && nextWord == 'i') {  // ji --> zi
    fixTypeStyle(currNode, key);
  } else if (word == 't' && key == 'c' && nextWord == 'i') {  // ti --> chi
    fixTypeStyle(currNode, key);
    appendWord(nextNode, 'h');
  } else if (word == 'c' && key == 't' && nextWord == 'h' && secondWord == 'i') {  // chi --> ti
    fixTypeStyle(currNode, key);
    nextNode.remove();
  } else if (word == 'u' && key == 's' && prevWord == 't') {  // tu --> tsu
    fixTypeStyle(currNode, key);
    appendWord(nextNode, 'u');
  } else if (word == 's' && key == 'u' && prevWord == 't') {  // tsu --> tu
    fixTypeStyle(currNode, key);
    nextNode.remove();
  } else if (word == 'h' && key == 'f' && nextWord == 'u') {  // hu --> fu
    fixTypeStyle(currNode, key);
  } else if (word == 'f' && key == 'h' && nextWord == 'u') {  // fu --> hu
    fixTypeStyle(currNode, key);
  } else if (word == 'n' && key == 'x' && nextWord == 'n') {  // nn --> xn
    fixTypeStyle(currNode, key);
  } else if (word == 'x' && key == 'n' && nextWord == 'n') {  // xn --> nn
    fixTypeStyle(currNode, key);
  } else if (word == 'x' && key == 'l' &&  // xa, xi, xu, xe, xo --> la, li, lu, le, lo
    (nextWord == 'a' || nextWord == 'i' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {
    fixTypeStyle(currNode, key);
  } else if (word == 'l' && key == 'x' &&  // la, li, lu, le, lo --> xa, xi, xu, xe, xo
    (nextWord == 'a' || nextWord == 'i' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {
    fixTypeStyle(currNode, key);
  } else if (word == 'l' && key == 'x' &&  nextWord == 'y' && // lya, lyu, lyo --> xya, xyu, xyo
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'o')) {  // TODO: lyi, lye
    fixTypeStyle(currNode, key);
  } else if (word == 'i' && key == 'h' && prevWord == 'w') { // wi, we --> whi, whe
    fixTypeStyle(currNode, key);
    appendWord(nextNode, 'i');
  } else if (word == 'h' && prevWord == 'w' && (key == 'i' || key == 'e')) { // whi, whe --> wi, we
    fixTypeStyle(currNode, key);
    nextWord.remove();
  } else if (word == 'y' && key == 'h' && prevWord == 's' &&
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {  // sya, syu, sye, syo --> sha, shu, she, sho
    fixTypeStyle(currNode, key);
  } else if (word == 'h' && key == 'y' && prevWord == 's' &&
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {  // sha, shu, she, sho --> sya, syu, sye, syo
    fixTypeStyle(currNode, key);
  } else if (word == 'z' && key == 'j' && nextWord == 'y' &&
    (secondWord == 'a' || secondWord == 'u' || secondWord == 'o')) {  // zya, zyu, zyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    nextNode.remove();
  } else if (word == 'j' && key == 'z' &&
    (nextWord == 'a' || netxWord == 'u' || nextword == 'o')) {  // ja, ju, jo --> zya, zyu, zyo
    fixTypeStyle(currNode, key);
    appendWord(nextNode, 'y');
  } else if (word == 'z' && key == 'j' && nextWord == 'y') {  // zya, zyi, zyu, zye, zyo --> jya, jyi, jyu, jye, jyo
    fixTypeStyle(currNode, key);
  } else if (prevWord == 'j' && word == 'y'
    && (key == 'a' || key == 'u' || key == 'o')) {  // jya, jyu, jyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    nextNode.remove();
  } else if (word == 'j' && key == 'y'
    && (nextWord == 'a' || nextWord == 'u' || nextWord == 'o')) {  // ja, ju, jo --> jya, jyu, jyo
    fixTypeStyle(currNode, key);
    fixTypeStyle(currNode, nextWord);
  } else if (word == 'j' && key == 'z' && nextWord == 'y') {  // jya, jyi, jyu, jye, jyo --> zya, zyi, zyu, zye, zyo
    fixTypeStyle(currNode, key);
  } else if (word == 't' && key == 'c' && nextWord == 'y') {  // tya, tyi, tyu, tye, tyo --> cya, cyi, cyu, cye, cyo
    fixTypeStyle(currNode, key);
  } else if (word == 'c' && key == 't' && nextWord == 'y') {  // cya, cyi, cyu, cye, cyo --> tya, tyi, tyu, tye, tyo
    fixTypeStyle(currNode, key);
  } else if (word == 't' && key == 'c' && nextWord == 'y' &&  // tya, tyu, tye, tyo --> cha, chu, che, cho
    (secondWord == 'a' || secondWord == 'u' || secondWord == 'e' || secondWord == 'o')) {
    fixTypeStyle(currNode, key);
    nextNode.textContent = 'h';
  } else if (word == 'c' && key == 't' && nextWord == 'h' &&  // cha, chu, che, cho --> tya, tyu, tye, tyo
    (secondWord == 'a' || secondWord == 'u' || secondWord == 'e' || secondWord == 'o')) {
    fixTypeStyle(currNode, key);
    nextNode.textContent = 'y';
  } else {
    new Audio('cat.mp3').play();
    errorCount += 1;
  }
}

function typeNormal(currNode) {
  new Audio('keyboard.mp3').play();
  currNode.style.color = 'silver';
  typeIndex += 1;
  normalCount += 1;
}

function nextProblem() {
  new Audio('correct.mp3').play();
  typeIndex = 0;
  solveCount += 1;
  typable(roma.textContent);
}

function typeEvent(event) {
  const currNode = roma.childNodes[typeIndex];
  if (event.key.length == 1) {
    if (event.key == currNode.textContent) {
      typeNormal(currNode);
      if (typeIndex == roma.childNodes.length) {
        nextProblem();
      }
    } else {
      checkTypeStyle(currNode, currNode.textContent, event.key);
      if (typeIndex == roma.childNodes.length) {  // tsu --> tu などの変換後に終端に到着したとき
        nextProblem();
      }
    }
  } else {
    if (event.key == 'Escape' || event.key == 'Esc') {  // ESC
      clearInterval(typeTimer);
      document.body.removeEventListener('keydown', typeEvent);
      initTime();
      loadProblems();
      countdown();
      typeIndex = normalCount = errorCount = solveCount = 0;
      countPanel.hidden = false;
      scorePanel.hidden = true;
    }
  }
}

// https://stackoverflow.com/questions/118241/
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    // var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = tmpCanvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

function calcAAOuterSize() {
  var headerHeight = document.getElementById('header').offsetHeight;
  var typePanelHeight = document.getElementById('typePanel').offsetHeight;
  return document.documentElement.clientHeight - headerHeight - infoPanel.offsetHeight - typePanelHeight;
}

function resizeFontSize(node) {
  var lines = aa.innerText.split('\n');
  var maxRowLength = 0;
  for (var i=0; i<lines.length; i++) {
    var length = getTextWidth(lines[i], '16px textar-light');
    if (maxRowLength < length) {
      maxRowLength = length;
    }
  }
  var maxHeight = calcAAOuterSize();
  var rowFontSize = 16 * infoPanel.clientWidth / maxRowLength;
  var colFontSize = maxHeight / lines.length / 1.1;
  if (colFontSize < rowFontSize) {
    node.style.fontSize = colFontSize + 'px';
  } else {
    node.style.fontSize = rowFontSize + 'px';
  }
}

function getRandomInt(min, max) {
  var min = Math.ceil(min);
  var max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function textToRuby(problem) {
  console.log(problem);
  var root = document.createElement('span');
  var ja = problem.querySelector('ja').childNodes[0].nodeValue;
  var yomiNode = problem.querySelector('yomi');
  if (!yomiNode) {
    root.innerText = ja;
    return root;
  }
  var yomi = yomiNode.childNodes[0].nodeValue.split('|');
  var y = 0;
  for (var i=0; i<ja.length; i++) {
    var span = document.createElement('span');
    if (ja[i].match(/[\u4E00-\u9FFF]/) && yomi[y]) {  // 漢字かつyomiがある
      var ruby = document.createElement('ruby');
      var rp1 = document.createElement('rp');
      var a = document.createElement('a');
      var rt = document.createElement('rt');
      var rp2 = document.createElement('rp');
      span.appendChild(ruby);
      ruby.appendChild(document.createTextNode(ja[i]));
      ruby.appendChild(rp1);
      rp1.appendChild(document.createTextNode('('));
      ruby.appendChild(rt);
      rt.appendChild(document.createTextNode(yomi[y]));
      ruby.appendChild(rp2);
      rp2.appendChild(document.createTextNode(')'));
      y += 1;
    } else {
      span.innerText = ja[i];
    }
    root.appendChild(span);
  }
  return root;
}

function typable(typeText) {
  var problem = problems[getRandomInt(0, problems.length)];
  while(japanese.firstChild) {
    japanese.removeChild(japanese.firstChild);
  }
  japanese.appendChild(textToRuby(problem));
  aa.innerText = problem.querySelector('aa').childNodes[0].nodeValue;
  var typeText = problem.querySelector('roma').childNodes[0].nodeValue;
  while(roma.firstChild) {
    roma.removeChild(roma.firstChild);
  }
  for (var i=0; i<typeText.length; i++) {
    var span = document.createElement('span');
    span.textContent = typeText[i];
    roma.appendChild(span);
  }
  resizeFontSize(aa);
}

function countdown() {
  typeIndex = normalCount = errorCount = solveCount = 0;
  playPanel.classList.add('d-none');
  countPanel.hidden = false;
  scorePanel.hidden = true;
  counter.innerText = 3;
  var timer = setInterval(function(){
    var counter = document.getElementById('counter');
    var colors = ['skyblue', 'greenyellow', 'violet', 'tomato'];
    if (parseInt(counter.innerText) > 1) {
      var t = parseInt(counter.innerText) - 1;
      counter.style.backgroundColor = colors[t];
      counter.innerText = t;
    } else {
      clearInterval(timer);
      countPanel.hidden = true;
      scorePanel.hidden = true;
      playPanel.classList.remove('d-none');
      typable(roma.textContent);
      startTypeTimer();
      var bgmButton = document.getElementById('bgmButton');
      if (bgmButton.dataset && bgmButton.dataset.enabled == 'true') {
        bgm.play();
      }
      document.body.addEventListener('keydown', typeEvent);
      startButton.addEventListener('click', startGame);
    }
  }, 1000);
}

function startGame() {
  clearInterval(typeTimer);
  startButton.removeEventListener('click', startGame);
  document.removeEventListener('keydown', startKeyEvent);
  initTime();
  loadProblems();
  countdown();
}

function startKeyEvent(event) {
  if (event.key == ' ' || event.key == 'Spacebar') {
    startGame();
  }
}
document.addEventListener('keydown', startKeyEvent);
startButton.addEventListener('click', startGame);

function startTypeTimer() {
  var timeNode = document.getElementById('time');
  typeTimer = setInterval(function() {
    var arr = timeNode.innerText.split('秒 /');
    var t = parseInt(arr[0]);
    if (t > 0) {
      timeNode.innerText = (t-1) + '秒 /' + arr[1];
    } else {
      clearInterval(typeTimer);
      bgm.pause();
      new Audio('end.mp3').play();
      playPanel.classList.add('d-none');
      countPanel.hidden = true;
      scorePanel.hidden = false;
      scoring();
    }
  }, 1000);
}

function initTime() {
  var sec = timeArr[timeOption.selectedIndex];
  document.getElementById('time').innerText = sec + '秒 / ' + sec + '秒';
}

timeOption.addEventListener('change', function() {
  initTime();
  document.addEventListener('keydown', startKeyEvent);
  clearInterval(typeTimer);
});

function scoring() {
  document.body.removeEventListener('keydown', typeEvent);
  var t = timeArr[timeOption.selectedIndex];
  var mode = timeOption.options[timeOption.selectedIndex].value;
  var typeSpeed = (normalCount / t).toFixed(2);
  document.getElementById('totalType').innerText = normalCount + errorCount;
  document.getElementById('typeSpeed').innerText = typeSpeed;
  document.getElementById('errorType').innerText = errorCount;
  document.getElementById('twitter').href = 'https://twitter.com/intent/tweet?text=ハゲ打の' + mode +
    'をプレイしたよ! (速度: ' + typeSpeed + '回/秒) ' +
    '&url=https%3a%2f%2fmarmooo.github.com/hageda%2f&hashtags=ハゲ打';
  document.addEventListener('keydown', startKeyEvent);
}

aa.parentNode.style.height = calcAAOuterSize() + 'px';
resizeFontSize(aa);
window.addEventListener('resize', function() {
  aa.parentNode.style.height = calcAAOuterSize() + 'px';
  resizeFontSize(aa);
});

