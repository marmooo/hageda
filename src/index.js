const remSize = parseInt(getComputedStyle(document.documentElement).fontSize);
const gamePanel = document.getElementById("gamePanel");
const playPanel = document.getElementById("playPanel");
const infoPanel = document.getElementById("infoPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const aaOuter = document.getElementById("aaOuter");
const startButton = document.getElementById("startButton");
const romaNode = document.getElementById("roma");
const japanese = document.getElementById("japanese");
const gradeOption = document.getElementById("gradeOption");
const aa = document.getElementById("aa");
const tmpCanvas = document.createElement("canvas");
const gameTime = 120;
let playing;
let typeTimer;
const bgm = new Audio("mp3/bgm.mp3");
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
  "default": [
    "{esc} ` 1 2 3 4 5 6 7 8 9 0 - =",
    "{tab} q w e r t y u i o p [ ] \\",
    "{lock} a s d f g h j k l ; '",
    "{shift} z x c v b n m , . /",
    "🌏 {altLeft} {space} {altRight}",
  ],
  "shift": [
    "{esc} ~ ! @ # $ % ^ & * ( ) _ +",
    "{tab} Q W E R T Y U I O P { } |",
    '{lock} A S D F G H J K L : "',
    "{shift} Z X C V B N M < > ?",
    "🌏 {altLeft} {space} {altRight}",
  ],
};
const layout109 = {
  "default": [
    "{esc} 1 2 3 4 5 6 7 8 9 0 - ^",
    "{tab} q w e r t y u i o p @",
    "{lock} a s d f g h j k l ; :",
    "{shift} z x c v b n m , . /",
    "🌏 無変換 {space} 変換",
  ],
  "shift": [
    "{esc} ! \" # $ % & ' ( ) = ~",
    "{tab} Q W E R T Y U I O P `",
    "{lock} A S D F G H J K L + *",
    "{shift} Z X C V B N M < > ?",
    "🌏 無変換 {space} 変換",
  ],
};
const keyboardDisplay = {
  "{esc}": "Esc",
  "{tab}": "Tab",
  "{lock}": "Caps",
  "{shift}": "Shift",
  "{space}": " ",
  "{altLeft}": "Alt",
  "{altRight}": "Alt",
  "🌏": (navigator.language == "ja") ? "🇯🇵" : "🇺🇸",
};
const simpleKeyboard = new SimpleKeyboard.default({
  layout: (navigator.language == "ja") ? layout109 : layout104,
  display: keyboardDisplay,
  onInit: () => {
    document.getElementById("keyboard").classList.add("d-none");
  },
  onKeyPress: (input) => {
    switch (input) {
      case "{esc}":
        return typeEventKey("Escape");
      case "{space}":
        return typeEventKey(" ");
      case "無変換":
      case "{altLeft}":
        return typeEventKey("NonConvert");
      case "変換":
      case "{altRight}":
        return typeEventKey("Convert");
      case "🌏": {
        if (simpleKeyboard.options.layout == layout109) {
          keyboardDisplay["🌏"] = "🇺🇸";
          simpleKeyboard.setOptions({
            layout: layout104,
            display: keyboardDisplay,
          });
        } else {
          keyboardDisplay["🌏"] = "🇯🇵";
          simpleKeyboard.setOptions({
            layout: layout109,
            display: keyboardDisplay,
          });
        }
        break;
      }
      case "{shift}":
      case "{lock}": {
        const shiftToggle = (simpleKeyboard.options.layoutName == "default")
          ? "shift"
          : "default";
        simpleKeyboard.setOptions({ layoutName: shiftToggle });
        break;
      }
      default:
        return typeEventKey(input);
    }
  },
});
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
  if (localStorage.getItem("bgm") != 1) {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
  }
}

function toggleBGM() {
  if (localStorage.getItem("bgm") == 1) {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
    localStorage.setItem("bgm", 0);
    bgm.pause();
  } else {
    document.getElementById("bgmOn").classList.remove("d-none");
    document.getElementById("bgmOff").classList.add("d-none");
    localStorage.setItem("bgm", 1);
    bgm.play();
  }
}

function toggleKeyboard() {
  const virtualKeyboardOn = document.getElementById("virtualKeyboardOn");
  const virtualKeyboardOff = document.getElementById("virtualKeyboardOff");
  if (virtualKeyboardOn.classList.contains("d-none")) {
    virtualKeyboardOn.classList.remove("d-none");
    virtualKeyboardOff.classList.add("d-none");
    document.getElementById("keyboard").classList.remove("d-none");
    resizeFontSize(aa);
  } else {
    virtualKeyboardOn.classList.add("d-none");
    virtualKeyboardOff.classList.remove("d-none");
    document.getElementById("keyboard").classList.add("d-none");
    document.getElementById("guideSwitch").checked = false;
    guide = false;
    resizeFontSize(aa);
  }
}

function toggleGuide() {
  if (this.checked) {
    guide = true;
  } else {
    guide = false;
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
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
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
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
    loadAudio("mp3/keyboard.mp3"),
    loadAudio("mp3/correct.mp3"),
    loadAudio("mp3/cat.mp3"),
    loadAudio("mp3/end.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    keyboardAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
    incorrectAudio = audioBuffers[2];
    endAudio = audioBuffers[3];
  });
}

function loadProblems() {
  const grade = gradeOption.selectedIndex + 1;
  if (grade > 0) {
    fetch("data/" + grade + ".xml")
      .then((response) => response.text())
      .then((str) => {
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/xml");
      }).then((xml) => {
        problems = xml.documentElement.children; // IE11 required polyfill
      }).catch((err) => {
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
  const span = document.createElement("span");
  span.textContent = word;
  currNode.parentNode.insertBefore(span, currNode.nextSibling);
}

// http://typingx0.net/key_l.html
function checkTypeStyle(currNode, word, key, romaNode) {
  const ie = ["i", "e"];
  const auo = ["a", "u", "o"];
  const aueo = ["a", "u", "e", "o"];
  const aiueo = ["a", "i", "u", "e", "o"];
  const nodes = romaNode.childNodes;
  const nextNode = nodes[typeIndex + 1];
  let n;
  if (nextNode) { // 最後の文字を tu --> tsu に変換しようとした時 (nextNode = null)
    n = nextNode.textContent;
  }
  let p;
  if (typeIndex != 0) {
    p = nodes[typeIndex - 1].textContent;
  }
  let nn;
  if (nodes[typeIndex + 2]) {
    nn = nodes[typeIndex + 2].textContent;
  }
  if (key == "k" && word == "c" && auo.includes(n)) { // ca, cu, co --< ka, ku, ko
    fixTypeStyle(currNode, key);
  } else if (key == "c" && word == "k" && auo.includes(n)) { // ka, ku, ko --< ca, cu, co
    fixTypeStyle(currNode, key);
  } else if (key == "h" && p == "s" && word == "i") { // si --> shi
    fixTypeStyle(currNode, key);
    appendWord(currNode, "i");
  } else if (key == "i" && p == "s" && word == "h" && n == "i") { // shi --> si
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "c" && word == "s" && ie.includes(n)) { // si, se --> ci, ce
    fixTypeStyle(currNode, key);
  } else if (key == "s" && word == "c" && ie.includes(n)) { // ci, ce --> si, se
    fixTypeStyle(currNode, key);
  } else if (key == "j" && word == "z" && n == "i") { // zi --> ji
    fixTypeStyle(currNode, key);
  } else if (key == "z" && word == "j" && n == "i") { // ji --> zi
    fixTypeStyle(currNode, key);
  } else if (key == "c" && word == "t" && n == "i") { // ti --> chi
    fixTypeStyle(currNode, key);
    appendWord(currNode, "h");
  } else if (key == "t" && word == "c" && n == "h" && nn == "i") { // chi --> ti
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "s" && p == "t" && word == "u") { // tu --> tsu
    fixTypeStyle(currNode, key);
    appendWord(currNode, "u");
  } else if (key == "u" && p == "t" && word == "s" && n == "u") { // tsu --> tu
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "f" && word == "h" && n == "u") { // hu --> fu
    fixTypeStyle(currNode, key);
  } else if (key == "h" && word == "f" && n == "u") { // fu --> hu
    fixTypeStyle(currNode, key);
  } else if (key == "x" && word == "n" && n == "n") { // nn --> xn
    fixTypeStyle(currNode, key);
  } else if (key == "n" && word == "x" && n == "n") { // xn --> nn
    fixTypeStyle(currNode, key);
  } else if (key == "l" && word == "x" && aiueo.includes(n)) { // xa, xi, xu, xe, xo --> la, li, lu, le, lo
    fixTypeStyle(currNode, key);
  } else if (key == "x" && word == "l" && aiueo.includes(n)) { // la, li, lu, le, lo --> xa, xi, xu, xe, xo
    fixTypeStyle(currNode, key);
  } else if (key == "x" && word == "l" && n == "y" && auo.includes(n)) { // TODO: lyi, lye
    // lya, lyu, lyo --> xya, xyu, xyo
    fixTypeStyle(currNode, key);
  } else if (key == "h" && p == "w" && ie.includes(word)) { // wi, we --> whi, whe
    fixTypeStyle(currNode, key);
    appendWord(currNode, word);
  } else if (ie.includes(key) && p == "w" && word == "h" && ie.includes(n)) { // whi, whe --> wi, we
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "h" && p == "s" && word == "y" && aueo.includes(n)) {
    // sya, syu, sye, syo --> sha, shu, she, sho
    fixTypeStyle(currNode, key);
  } else if (key == "y" && p == "s" && word == "h" && aueo.includes(n)) {
    // sha, shu, she, sho --> sya, syu, sye, syo
    fixTypeStyle(currNode, key);
  } else if (key == "j" && word == "z" && n == "y" && auo.includes(nn)) { // zya, zyu, zyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "z" && word == "j" && auo.includes(n)) { // ja, ju, jo --> zya, zyu, zyo
    fixTypeStyle(currNode, key);
    appendWord(currNode, "y");
  } else if (key == "j" && word == "z" && n == "y") { // zya, zyi, zyu, zye, zyo --> jya, jyi, jyu, jye, jyo
    fixTypeStyle(currNode, key);
  } else if (auo.includes(key) && p == "j" && word == "y" && auo.includes(n)) {
    // jya, jyu, jyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "y" && p == "j" && auo.includes(word)) { // ja, ju, jo --> jya, jyu, jyo
    fixTypeStyle(currNode, key);
    appendWord(currNode, n);
  } else if (key == "z" && word == "j" && n == "y") { // jya, jyi, jyu, jye, jyo --> zya, zyi, zyu, zye, zyo
    fixTypeStyle(currNode, key);
  } else if (key == "t" && word == "c" && n == "y") { // cya, cyi, cyu, cye, cyo --> tya, tyi, tyu, tye, tyo
    fixTypeStyle(currNode, key);
  } else if (key == "c" && word == "t" && n == "y") {
    // tya, tyi, tyu, tye, tyo --> cya, cyi, cyu, cye, cyo
    // tya, tyu, tye, tyo --> cha, chu, che, cho (chi の問題があるので cyi を採用)
    fixTypeStyle(currNode, key);
  } else if (key == "t" && word == "c" && n == "h" && aueo.includes(n)) {
    // cha, chu, che, cho --> tya, tyu, tye, tyo
    fixTypeStyle(currNode, key);
    nextNode.textContent = "y";
  } else if (key == "h" && p == "c" && word == "y" && aueo.includes(n)) {
    // cya, cyu, cye, cyo --> cha, chu, che, cho
    fixTypeStyle(currNode, key);
    nextNode.textContent = n;
  } else if (key == "y" && p == "c" && word == "h" && aueo.includes(n)) {
    // cha, chu, che, cho --> cya, cyu, cye, cyo
    fixTypeStyle(currNode, key);
    nextNode.textContent = n;
  } else {
    return false;
  }
  return true;
}

function typeNormal(currNode) {
  playAudio(keyboardAudio);
  currNode.style.color = "silver";
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
    if (key == " ") key = "{space}";
    const button = simpleKeyboard.getButtonElement(key);
    button.classList.remove("bg-info");
  }
  let key = currNode.textContent;
  if (key == " ") key = "{space}";
  const button = simpleKeyboard.getButtonElement(key);
  if (button) {
    button.classList.remove("bg-info");
    simpleKeyboard.setOptions({ layoutName: "default" });
  } else {
    const shift = simpleKeyboard.getButtonElement("{shift}");
    shift.classList.remove("bg-info");
  }
}

function showGuide(currNode) {
  if (guide) {
    let key = currNode.textContent;
    if (key == " ") key = "{space}";
    const button = simpleKeyboard.getButtonElement(key);
    if (button) {
      button.classList.add("bg-info");
    } else {
      const shift = simpleKeyboard.getButtonElement("{shift}");
      shift.classList.add("bg-info");
    }
  }
}

function upKeyEvent(event) {
  switch (event.key) {
    case "Shift":
    case "CapsLock":
      if (guide) {
        simpleKeyboard.setOptions({ layoutName: "default" });
        showGuide(romaNode.childNodes[typeIndex]);
      }
  }
}

function typeEvent(event) {
  switch (event.code) {
    case "Space":
      event.preventDefault();
      // falls through
    default:
      return typeEventKey(event.key);
  }
}

function typeEventKey(key) {
  switch (key) {
    case "Shift":
    case "CapsLock":
      if (guide) {
        simpleKeyboard.setOptions({ layoutName: "shift" });
        showGuide(romaNode.childNodes[typeIndex]);
      }
      return;
    case "Escape":
      replay();
      return;
    case " ":
      if (!playing) {
        replay();
        return;
      }
  }
  if (key.length == 1) {
    const currNode = romaNode.childNodes[typeIndex];
    if (key == currNode.textContent) {
      typeNormal(currNode);
      removeGuide(currNode);
    } else {
      const state = checkTypeStyle(
        currNode,
        currNode.textContent,
        key,
        romaNode,
      );
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
  }
}

function resizeFontSize(node) {
  // https://stackoverflow.com/questions/118241/
  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    // const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = tmpCanvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  function getTextRect(text, fontSize, font, lineHeight) {
    const lines = text.split("\n");
    const fontConfig = fontSize + "px " + font;
    let maxWidth = 0;
    for (let i = 0; i < lines.length; i++) {
      const width = getTextWidth(lines[i], fontConfig);
      if (maxWidth < width) {
        maxWidth = width;
      }
    }
    return [maxWidth, fontSize * lines.length * lineHeight];
  }
  function getPaddingRect(style) {
    const width = parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight);
    const height = parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom);
    return [width, height];
  }
  const style = getComputedStyle(node);
  const font = style.fontFamily;
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) / fontSize;
  const nodeHeight = aaOuter.offsetHeight;
  const nodeWidth = infoPanel.clientWidth;
  const nodeRect = [nodeWidth, nodeHeight];
  const textRect = getTextRect(node.textContent, fontSize, font, lineHeight);
  const paddingRect = getPaddingRect(style);

  // https://stackoverflow.com/questions/46653569/
  // Safariで正確な算出ができないので誤差ぶんだけ縮小化 (10%)
  const rowFontSize = fontSize * (nodeRect[0] - paddingRect[0]) / textRect[0] *
    0.90;
  const colFontSize = fontSize * (nodeRect[1] - paddingRect[1]) / textRect[1] *
    0.90;
  if (colFontSize < rowFontSize) {
    if (colFontSize < remSize) {
      node.style.fontSize = remSize + "px";
    } else {
      node.style.fontSize = colFontSize + "px";
    }
  } else {
    if (rowFontSize < remSize) {
      node.style.fontSize = remSize + "px";
    } else {
      node.style.fontSize = rowFontSize + "px";
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function textToRuby(problem) {
  const root = document.createElement("span");
  const ja = problem.querySelector("ja").childNodes[0].nodeValue;
  const yomiNode = problem.querySelector("yomi");
  if (!yomiNode) {
    root.textContent = ja;
    return root;
  }
  const yomi = yomiNode.childNodes[0].nodeValue.split("|");
  let y = 0;
  for (let i = 0; i < ja.length; i++) {
    const span = document.createElement("span");
    if (/[一-龠々]/.test(ja[i]) && yomi[y]) { // 漢字かつyomiがある
      const ruby = document.createElement("ruby");
      const rp1 = document.createElement("rp");
      const rt = document.createElement("rt");
      const rp2 = document.createElement("rp");
      span.appendChild(ruby);
      ruby.appendChild(document.createTextNode(ja[i]));
      ruby.appendChild(rp1);
      rp1.appendChild(document.createTextNode("("));
      ruby.appendChild(rt);
      rt.appendChild(document.createTextNode(yomi[y]));
      ruby.appendChild(rp2);
      rp2.appendChild(document.createTextNode(")"));
      y += 1;
    } else {
      span.textContent = ja[i];
    }
    root.appendChild(span);
  }
  return root;
}

function typable() {
  const problem = problems[getRandomInt(0, problems.length)];
  while (japanese.firstChild) {
    japanese.removeChild(japanese.firstChild);
  }
  japanese.appendChild(textToRuby(problem));
  aa.textContent = problem.querySelector("aa").childNodes[0].nodeValue;
  const roma = problem.querySelector("roma").childNodes[0].nodeValue;
  while (romaNode.firstChild) {
    romaNode.removeChild(romaNode.firstChild);
  }
  for (let i = 0; i < roma.length; i++) {
    const span = document.createElement("span");
    span.textContent = roma[i];
    romaNode.appendChild(span);
  }
  resizeFontSize(aa);
  showGuide(romaNode.childNodes[0]);
}

function countdown() {
  playing = true;
  typeIndex =
    normalCount =
    errorCount =
    solveCount =
      0;
  document.getElementById("guideSwitch").disabled = true;
  document.getElementById("virtualKeyboard").disabled = true;
  gamePanel.classList.add("d-none");
  countPanel.classList.remove("d-none");
  counter.textContent = 3;
  const timer = setInterval(() => {
    const counter = document.getElementById("counter");
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearInterval(timer);
      document.getElementById("guideSwitch").disabled = false;
      document.getElementById("virtualKeyboard").disabled = false;
      gamePanel.classList.remove("d-none");
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      playPanel.classList.remove("d-none");
      aaOuter.classList.remove("d-none");
      scorePanel.classList.add("d-none");
      resizeFontSize(aa);
      window.scrollTo({
        top: document.getElementById("timePanel").getBoundingClientRect().top +
          document.documentElement.scrollTop,
        behavior: "auto",
      });
      typable(roma.textContent);
      startTypeTimer();
      if (localStorage.getItem("bgm") == 1) {
        bgm.play();
      }
    }
  }, 1000);
}

function replay() {
  clearInterval(typeTimer);
  removeGuide(romaNode.childNodes[typeIndex]);
  initTime();
  loadProblems();
  countdown();
  typeIndex =
    normalCount =
    errorCount =
    solveCount =
      0;
  countPanel.classList.remove("d-none");
  scorePanel.classList.add("d-none");
}

function startTypeTimer() {
  const timeNode = document.getElementById("time");
  typeTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(typeTimer);
      bgm.pause();
      playAudio(endAudio);
      scoring();
    }
  }, 1000);
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

gradeOption.addEventListener("change", () => {
  initTime();
  clearInterval(typeTimer);
});

function scoring() {
  playing = false;
  infoPanel.classList.remove("d-none");
  playPanel.classList.add("d-none");
  aaOuter.classList.add("d-none");
  countPanel.classList.add("d-none");
  scorePanel.classList.remove("d-none");
  const mode = gradeOption.options[gradeOption.selectedIndex].value;
  const typeSpeed = (normalCount / gameTime).toFixed(2);
  document.getElementById("totalType").textContent = normalCount + errorCount;
  document.getElementById("typeSpeed").textContent = typeSpeed;
  document.getElementById("errorType").textContent = errorCount;
  document.getElementById("twitter").href =
    "https://twitter.com/intent/tweet?text=ハゲ打の" + mode +
    "をプレイしたよ! (速度: " + typeSpeed + "回/秒) " +
    "&url=https%3a%2f%2fmarmooo.github.com/hageda/%2f&hashtags=ハゲ打";
}

resizeFontSize(aa);

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("toggleBGM").onclick = toggleBGM;
document.getElementById("virtualKeyboard").onclick = toggleKeyboard;
window.addEventListener("resize", () => {
  resizeFontSize(aa);
});
document.getElementById("guideSwitch").onchange = toggleGuide;
startButton.addEventListener("click", replay);
document.addEventListener("keyup", upKeyEvent);
document.addEventListener("keydown", typeEvent);
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
