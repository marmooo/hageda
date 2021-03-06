const playPanel = document.getElementById('playPanel');
const countPanel = document.getElementById('countPanel');
const scorePanel = document.getElementById('scorePanel');
const startButton = document.getElementById('startButton');
const romaNode = document.getElementById('roma');
const japanese = document.getElementById('japanese');
const gradeOption = document.getElementById('gradeOption');
const infoPanel = document.getElementById('infoPanel');
const aa = document.getElementById('aa');
const gameTime = 180;
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
let guide = false;
let keyboardAudio, correctAudio, incorrectAudio, endAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const layout104 = {
  'default': [
    '{esc} ` 1 2 3 4 5 6 7 8 9 0 - =',
    '{tab} q w e r t y u i o p [ ] \\',
    '{lock} a s d f g h j k l ; \'',
    '{shift} z x c v b n m , . /',
    '🌏 無変換 {space} 変換',
  ],
  'shift': [
    '{esc} ~ ! @ # $ % ^ & * ( ) _ +',
    '{tab} Q W E R T Y U I O P { } |',
    '{lock} A S D F G H J K L : "',
    '{shift} Z X C V B N M < > ?',
    '🌏 無変換 {space} 変換',
  ]
};
const layout109 = {
  'default': [
    '{esc} 1 2 3 4 5 6 7 8 9 0 - ^ \\',
    '{tab} q w e r t y u i o p @ [',
    '{lock} a s d f g h j k l ; : ]',
    '{shift} z x c v b n m , . / \\',
    '🌏 無変換 {space} 変換',
  ],
  'shift': [
    '{esc} ! " # $ % & \' ( ) = ~ |',
    '{tab} Q W E R T Y U I O P ` {',
    '{lock} A S D F G H J K L + * ]',
    '{shift} Z X C V B N M < > ? _',
    '🌏 無変換 {space} 変換',
  ],
};
const keyboardDisplay = {
  "{esc}": "Esc",
  "{tab}": "Tab",
  "{lock}": "Caps",
  "{shift}": "Shift",
  "{space}": " ",
  "🌏": "日本語",
};
const simpleKeyboard = new SimpleKeyboard.default({
  layout: layout109,
  display: keyboardDisplay,
  onInit: function(keyboard) {
    document.getElementById('keyboard').classList.add('d-none');
  },
  onKeyPress: function(input) {
    switch (input) {
      case '{esc}': return typeEventKey('Esc');
      case '{space}': return typeEventKey(' ');
      case '無変換': return typeEventKey('NoConvert');
      case '変換': return typeEventKey('Convert');
      case '🌏':
        const button = simpleKeyboard.getButtonElement('🌏');
        if (simpleKeyboard.options.layout == layout109) {
          keyboardDisplay['🌏'] = "英語";
          simpleKeyboard.setOptions({ layout:layout104, display:keyboardDisplay });
        } else {
          keyboardDisplay['🌏'] = "日本語";
          simpleKeyboard.setOptions({ layout:layout109, display:keyboardDisplay });
        }
        break;
      case '{shift}': case '{lock}':
        const shiftToggle = (simpleKeyboard.options.layoutName == "default") ? "shift" : "default";
        simpleKeyboard.setOptions({ layoutName:shiftToggle });
        break;
      default: return typeEventKey(input);
    }
  }
});


function clearConfig() {
  localStorage.clear();
}

function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.documentElement.dataset.theme = 'dark';
  }
  if (localStorage.getItem('bgm') != 1) {
    document.getElementById('bgmOn').classList.add('d-none');
    document.getElementById('bgmOff').classList.remove('d-none');
  }
}
loadConfig();

function toggleBGM() {
  if (localStorage.getItem('bgm') == 1) {
    document.getElementById('bgmOn').classList.add('d-none');
    document.getElementById('bgmOff').classList.remove('d-none');
    localStorage.setItem('bgm', 0);
    bgm.pause();
  } else {
    document.getElementById('bgmOn').classList.remove('d-none');
    document.getElementById('bgmOff').classList.add('d-none');
    localStorage.setItem('bgm', 1);
    bgm.play();
  }
}

function toggleKeyboard() {
  const virtualKeyboardOn = document.getElementById('virtualKeyboardOn');
  const virtualKeyboardOff = document.getElementById('virtualKeyboardOff');
  if (virtualKeyboardOn.classList.contains('d-none')) {
    virtualKeyboardOn.classList.remove('d-none');
    virtualKeyboardOff.classList.add('d-none');
    document.getElementById('keyboard').classList.remove('d-none');
    aa.parentNode.style.height = calcAAOuterSize() + 'px';
    resizeFontSize(aa);
  } else {
    virtualKeyboardOn.classList.add('d-none');
    virtualKeyboardOff.classList.remove('d-none');
    document.getElementById('keyboard').classList.add('d-none');
    document.getElementById('guideSwitch').checked = false;
    guide = false;
    aa.parentNode.style.height = calcAAOuterSize() + 'px';
    resizeFontSize(aa);
  }
}

function toggleGuide() {
  const virtualKeyboardOn = document.getElementById('virtualKeyboardOn');
  const virtualKeyboardOff = document.getElementById('virtualKeyboardOff');
  if (this.checked) {
    virtualKeyboardOn.classList.remove('d-none');
    virtualKeyboardOff.classList.add('d-none');
    document.getElementById('keyboard').classList.remove('d-none');
    aa.parentNode.style.height = calcAAOuterSize() + 'px';
    resizeFontSize(aa);
    guide = true;
  } else {
    virtualKeyboardOn.classList.add('d-none');
    virtualKeyboardOff.classList.remove('d-none');
    document.getElementById('keyboard').classList.add('d-none');
    aa.parentNode.style.height = calcAAOuterSize() + 'px';
    resizeFontSize(aa);
    guide = false;
  }
}

function toggleDarkMode() {
  if (localStorage.getItem('darkMode') == 1) {
    localStorage.setItem('darkMode', 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem('darkMode', 1);
    document.documentElement.dataset.theme = 'dark';
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio('keyboard.mp3'),
    loadAudio('correct.mp3'),
    loadAudio('cat.mp3'),
    loadAudio('end.mp3'),
  ];
  Promise.all(promises).then(audioBuffers => {
    keyboardAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
    incorrectAudio = audioBuffers[2];
    endAudio = audioBuffers[3];
  });
}

function loadProblems() {
  var grade = gradeOption.selectedIndex + 1;
  if (grade > 0) {
    fetch(grade + '.xml').then(function(response) {
      return response.text();
    }).then(function(str) {
      const parser = new DOMParser();
      return parser.parseFromString(str, 'text/xml');
    }).then(function(xml) {
      problems = xml.documentElement.children;  // IE11 required polyfill
    }).catch(function(err) {
      console.error(err);
    });
  }
}

function fixTypeStyle(currNode, word) {
  removeGuide(currNode);
  currNode.textContent = word;
  typeNormal(currNode);
}

function appendWord(currNode, word) {
  removeGuide(currNode);
  const span = document.createElement('span');
  span.textContent = word;
  currNode.parentNode.insertBefore(span, currNode.nextSibling);
}

// http://typingx0.net/key_l.html
function checkTypeStyle(currNode, word, key, romaNode) {
  const nodes = romaNode.childNodes;
  const nextNode = nodes[typeIndex+1];
  let nextWord;
  if (nextNode) {  // 最後の文字を tu --> tsu に変換しようとした時 (nextNode = null)
    nextWord = nextNode.textContent;
  }
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
    appendWord(currNode, 'i');
  } else if (word == 'h' && key == 'i' && prevWord == 's' && nextWord == 'i') {  // shi --> si
    fixTypeStyle(currNode, key);
    if (nextWord) { nextNode.remove(); }
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
    appendWord(currNode, 'h');
  } else if (word == 'c' && key == 't' && nextWord == 'h' && secondWord == 'i') {  // chi --> ti
    fixTypeStyle(currNode, key);
    if (nextWord) { nextNode.remove(); }
  } else if (word == 'u' && key == 's' && prevWord == 't') {  // tu --> tsu
    fixTypeStyle(currNode, key);
    appendWord(currNode, 'u');
  } else if (word == 's' && key == 'u' && prevWord == 't' && nextWord == 'u') {  // tsu --> tu
    fixTypeStyle(currNode, key);
    if (nextWord) { nextNode.remove(); }
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
  } else if ((word == 'i' || word == 'e') && key == 'h' && prevWord == 'w') { // wi, we --> whi, whe
    fixTypeStyle(currNode, key);
    appendWord(currNode, word);
  } else if (word == 'h' && prevWord == 'w' &&
    (key + nextWord == 'ii' || key + nextWord == 'ee')) { // whi, whe --> wi, we
    fixTypeStyle(currNode, key);
    if (nextWord) { nextNode.remove(); }
  } else if (word == 'y' && key == 'h' && prevWord == 's' &&
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {  // sya, syu, sye, syo --> sha, shu, she, sho
    fixTypeStyle(currNode, key);
  } else if (word == 'h' && key == 'y' && prevWord == 's' &&
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {  // sha, shu, she, sho --> sya, syu, sye, syo
    fixTypeStyle(currNode, key);
  } else if (word == 'z' && key == 'j' && nextWord == 'y' &&
    (secondWord == 'a' || secondWord == 'u' || secondWord == 'o')) {  // zya, zyu, zyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    if (nextWord) { nextNode.remove(); }
  } else if (word == 'j' && key == 'z' &&
    (nextWord == 'a' || netxWord == 'u' || nextword == 'o')) {  // ja, ju, jo --> zya, zyu, zyo
    fixTypeStyle(currNode, key);
    appendWord(currNode, 'y');
  } else if (word == 'z' && key == 'j' && nextWord == 'y') {  // zya, zyi, zyu, zye, zyo --> jya, jyi, jyu, jye, jyo
    fixTypeStyle(currNode, key);
  } else if (prevWord == 'j' && word == 'y' &&
    (key + nextWord == 'aa' || key + nextWord == 'uu' || key + nextWord == 'oo')) {  // jya, jyu, jyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    if (nextWord) { nextNode.remove(); }
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
  } else if (prevWord == 'c' && word == 'y' && key == 'h' &&  // cya, cyu, cye, cyo --> cha, chu, che, cho
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {
    fixTypeStyle(currNode, key);
    nextNode.textContent = nextWord;
  } else if (prevWord == 'c' && word == 'h' && key == 'y' &&  // cha, chu, che, cho --> cya, cyu, cye, cyo
    (nextWord == 'a' || nextWord == 'u' || nextWord == 'e' || nextWord == 'o')) {
    fixTypeStyle(currNode, key);
    nextNode.textContent = nextWord;
  } else {
    return false;
  }
  return true;
}

function typeNormal(currNode) {
  playAudio(keyboardAudio);
  currNode.style.color = 'silver';
  typeIndex += 1;
  normalCount += 1;
}

function nextProblem() {
  playAudio(correctAudio);
  typeIndex = 0;
  solveCount += 1;
  typable();
}

function removeGuide(currNode) {
  const prevNode = currNode.previousSiblingElement;
  if (prevNode) {
    let key = prevNode.textContent;
    if (key == ' ') { key = '{space}'; }
    const button = simpleKeyboard.getButtonElement(key);
    button.classList.remove('bg-info');
  }
  let key = currNode.textContent;
  if (key == ' ') { key = '{space}'; }
  const button = simpleKeyboard.getButtonElement(key);
  if (button) {
    button.classList.remove('bg-info');
    simpleKeyboard.setOptions({ layoutName:'default' });
  } else {
    const shift = simpleKeyboard.getButtonElement("{shift}");
    shift.classList.remove('bg-info');
  }
}

function showGuide(currNode) {
  if (guide) {
    let key = currNode.textContent;
    if (key == ' ') { key = '{space}'; }
    const button = simpleKeyboard.getButtonElement(key);
    if (button) {
      button.classList.add('bg-info');
    } else {
      const shift = simpleKeyboard.getButtonElement("{shift}");
      shift.classList.add('bg-info');
    }
  }
}

function typeEvent(event) {
  typeEventKey(event.key);
}

function typeEventKey(key) {
  if (key.length == 1) {
    const currNode = romaNode.childNodes[typeIndex];
    if (key == currNode.textContent) {
      typeNormal(currNode);
      removeGuide(currNode);
    } else {
      const state = checkTypeStyle(currNode, currNode.textContent, key, romaNode);
      if (!state) {
        playAudio(incorrectAudio, 0.3);
        errorCount += 1;
      }
    }
    if (typeIndex == romaNode.childNodes.length) {
      nextProblem();
    } else {
      showGuide(romaNode.childNodes[typeIndex]);
    }
  } else {
    if (key == 'Shift' || key == 'CapsLock') {
      if (guide) {
        const shiftToggle = (simpleKeyboard.options.layoutName == "default") ? "shift" : "default";
        simpleKeyboard.setOptions({ layoutName:shiftToggle });
        showGuide(romaNode.childNodes[typeIndex]);
      }
    } else if (key == 'Escape' || key == 'Esc') {  // ESC
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

function calcAAOuterSize() {
  const typePanelHeight = document.getElementById('typePanel').offsetHeight;
  const keyboardHeight = document.getElementById('keyboard').offsetHeight;
  return document.documentElement.clientHeight - aa.parentNode.offsetTop - typePanelHeight - keyboardHeight;
}

function resizeFontSize(node) {
  // https://stackoverflow.com/questions/118241/
  function getTextWidth(text, font) {
      // re-use canvas object for better performance
      // var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
      var context = tmpCanvas.getContext("2d");
      context.font = font;
      var metrics = context.measureText(text);
      return metrics.width;
  }
  function getTextRect(text, fontSize, font, lineHeight) {
    var lines = text.split('\n');
    var maxWidth = 0;
    var fontConfig = fontSize + 'px ' + font;
    for (var i=0; i<lines.length; i++) {
      var width = getTextWidth(lines[i], fontConfig);
      if (maxWidth < width) {
        maxWidth = width;
      }
    }
    return [maxWidth, fontSize * lines.length * lineHeight];
  }
  function getPaddingRect(style) {
    var width = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    var height = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    return [width, height];
  }
  var style = getComputedStyle(node);
  var font = style.fontFamily;
  var fontSize = parseFloat(style.fontSize);
  var lineHeight = parseFloat(style.lineHeight) / fontSize;
  var nodeHeight = calcAAOuterSize();
  var nodeWidth = infoPanel.clientWidth;
  var nodeRect = [nodeWidth, nodeHeight];
  var textRect = getTextRect(node.innerText, fontSize, font, lineHeight);
  var paddingRect = getPaddingRect(style);

  // https://stackoverflow.com/questions/46653569/
  // Safariで正確な算出ができないので誤差ぶんだけ縮小化 (10%)
  var rowFontSize = fontSize * (nodeRect[0] - paddingRect[0]) / textRect[0] * 0.90;
  var colFontSize = fontSize * (nodeRect[1] - paddingRect[1]) / textRect[1] * 0.90;
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

function typable() {
  var problem = problems[getRandomInt(0, problems.length)];
  while(japanese.firstChild) {
    japanese.removeChild(japanese.firstChild);
  }
  japanese.appendChild(textToRuby(problem));
  aa.innerText = problem.querySelector('aa').childNodes[0].nodeValue;
  var roma = problem.querySelector('roma').childNodes[0].nodeValue;
  while(romaNode.firstChild) {
    romaNode.removeChild(romaNode.firstChild);
  }
  for (var i=0; i<roma.length; i++) {
    var span = document.createElement('span');
    span.textContent = roma[i];
    romaNode.appendChild(span);
  }
  resizeFontSize(aa);
  showGuide(romaNode.childNodes[0]);
}

function countdown() {
  typeIndex = normalCount = errorCount = solveCount = 0;
  document.getElementById('guideSwitch').disabled = true;
  document.getElementById('virtualKeyboard').disabled = true;
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
      document.getElementById('guideSwitch').disabled = false;
      document.getElementById('virtualKeyboard').disabled = false;
      countPanel.hidden = true;
      scorePanel.hidden = true;
      playPanel.classList.remove('d-none');
      typable(roma.textContent);
      startTypeTimer();
      if (localStorage.getItem('bgm') == 1) {
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
      playAudio(endAudio);
      playPanel.classList.add('d-none');
      countPanel.hidden = true;
      scorePanel.hidden = false;
      scoring();
    }
  }, 1000);
}

function initTime() {
  document.getElementById('time').innerText = gameTime + '秒 / ' + gameTime + '秒';
}

gradeOption.addEventListener('change', function() {
  initTime();
  document.addEventListener('keydown', startKeyEvent);
  clearInterval(typeTimer);
});

function scoring() {
  document.body.removeEventListener('keydown', typeEvent);
  var mode = gradeOption.options[gradeOption.selectedIndex].value;
  var typeSpeed = (normalCount / gameTime).toFixed(2);
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
document.getElementById('guideSwitch').onchange = toggleGuide;
document.addEventListener('click', unlockAudio, { once:true, useCapture:true });
