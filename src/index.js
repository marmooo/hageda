import { Romaji } from "https://cdn.jsdelivr.net/npm/@marmooo/romaji/+esm";

const remSize = parseInt(getComputedStyle(document.documentElement).fontSize);
const gamePanel = document.getElementById("gamePanel");
const infoPanel = document.getElementById("infoPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const startButton = document.getElementById("startButton");
const romaNode = document.getElementById("roma");
const japanese = document.getElementById("japanese");
const gradeOption = document.getElementById("gradeOption");
const aa = document.getElementById("aa");
const tmpCanvas = document.createElement("canvas");
const gameTime = 120;
let playing;
let countdowning;
let typeTimer;
const bgm = new Audio("mp3/bgm.mp3");
bgm.volume = 0.3;
bgm.loop = true;
let errorCount = 0;
let normalCount = 0;
let solveCount = 0;
let problems = [];
let problem;
let guide = false;
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
  "🌏": (navigator.language.startsWith("ja")) ? "🇯🇵" : "🇺🇸",
};
const simpleKeyboard = new SimpleKeyboard.default({
  layout: (navigator.language.startsWith("ja")) ? layout109 : layout104,
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
const audioContext = new AudioContext();
const audioBufferCache = {};
loadAudio("end", "mp3/end.mp3");
loadAudio("keyboard", "mp3/keyboard.mp3");
loadAudio("correct", "mp3/correct.mp3");
loadAudio("incorrect", "mp3/cat.mp3");
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
  if (localStorage.getItem("bgm") != 1) {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
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

function toggleGuide(event) {
  if (event.target.checked) {
    guide = true;
  } else {
    guide = false;
  }
}

async function playAudio(name, volume) {
  const audioBuffer = await loadAudio(name, audioBufferCache[name]);
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    sourceNode.connect(gainNode);
    sourceNode.start();
  } else {
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
  }
}

async function loadAudio(name, url) {
  if (audioBufferCache[name]) return audioBufferCache[name];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBufferCache[name] = audioBuffer;
  return audioBuffer;
}

function unlockAudio() {
  audioContext.resume();
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

function nextProblem() {
  playAudio("correct", 0.3);
  solveCount += 1;
  typable();
}

function removeGuide(key) {
  if (key == " ") key = "{space}";
  const button = simpleKeyboard.getButtonElement(key);
  if (button) {
    button.classList.remove("guide");
    simpleKeyboard.setOptions({ layoutName: "default" });
  } else {
    const shift = simpleKeyboard.getButtonElement("{shift}");
    if (shift) shift.classList.remove("guide");
  }
}

function showGuide(key) {
  if (key == " ") key = "{space}";
  const button = simpleKeyboard.getButtonElement(key);
  if (button) {
    button.classList.add("guide");
  } else {
    const shift = simpleKeyboard.getButtonElement("{shift}");
    if (shift) shift.classList.add("guide");
  }
}

function upKeyEvent(event) {
  switch (event.key) {
    case "Shift":
    case "CapsLock":
      if (guide) {
        simpleKeyboard.setOptions({ layoutName: "default" });
        showGuide(problem.romaji.remainedRomaji[0]);
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
        showGuide(problem.romaji.remainedRomaji[0]);
      }
      return;
    case "Escape":
      startGame();
      return;
    case " ":
      if (!playing) {
        startGame();
        return;
      }
  }
  if (key.length == 1) {
    key = key.toLowerCase();
    const romaji = problem.romaji;
    const prevNode = romaji.currentNode;
    const state = romaji.input(key);
    if (state) {
      playAudio("keyboard");
      normalCount += 1;
      const remainedRomaji = romaji.remainedRomaji;
      const children = romaNode.children;
      children[0].textContent += key;
      children[1].textContent = remainedRomaji[0];
      children[2].textContent = remainedRomaji.slice(1);
      for (const key of prevNode.children.keys()) {
        removeGuide(key);
      }
      if (romaji.isEnd()) {
        nextProblem();
      } else if (guide) {
        showGuide(remainedRomaji[0]);
      }
    } else {
      playAudio("incorrect", 0.3);
      errorCount += 1;
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
  const nodeHeight = document.getElementById("aaOuter").offsetHeight;
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
  const ja = problem.ja;
  const yomi = problem.yomi;
  if (!yomi) {
    root.textContent = ja;
    return root;
  }
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

function toProblem(xml) {
  const aa = xml.querySelector("aa").childNodes[0].nodeValue;
  const roma = xml.querySelector("roma").childNodes[0].nodeValue;
  const ja = xml.querySelector("ja").childNodes[0].nodeValue;
  const yomiNode = xml.querySelector("yomi");
  const yomi = yomiNode ? yomiNode.childNodes[0].nodeValue.split("|") : null;
  return {
    aa: aa,
    roma: roma,
    ja: ja,
    yomi: yomi,
    romaji: new Romaji(roma),
  };
}

function typable() {
  const xml = problems[getRandomInt(0, problems.length)];
  const prevProblem = problem;
  problem = toProblem(xml);
  while (japanese.firstChild) {
    japanese.removeChild(japanese.firstChild);
  }
  japanese.appendChild(textToRuby(problem));
  aa.textContent = problem.aa;
  const romaji = problem.romaji;
  const children = romaNode.children;
  children[0].textContent = romaji.inputedRomaji;
  children[1].textContent = romaji.remainedRomaji[0];
  children[2].textContent = romaji.remainedRomaji.slice(1);
  resizeFontSize(aa);
  if (guide) {
    if (prevProblem) {
      const prevNode = prevProblem.romaji.currentNode;
      if (prevNode) {
        for (const key of prevNode.children.keys()) {
          removeGuide(key);
        }
      }
    }
    showGuide(problem.roma[0]);
  }
}

function countdown() {
  if (countdowning) return;
  countdowning = true;
  normalCount = errorCount = solveCount = 0;
  document.getElementById("guideSwitch").disabled = true;
  document.getElementById("virtualKeyboard").disabled = true;
  gamePanel.classList.add("d-none");
  infoPanel.classList.add("d-none");
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
      countdowning = false;
      playing = true;
      clearInterval(timer);
      document.getElementById("guideSwitch").disabled = false;
      document.getElementById("virtualKeyboard").disabled = false;
      gamePanel.classList.remove("d-none");
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      scorePanel.classList.add("d-none");
      resizeFontSize(aa);
      window.scrollTo({
        top: document.getElementById("typePanel").getBoundingClientRect().top,
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

function startGame() {
  clearInterval(typeTimer);
  initTime();
  loadProblems();
  countdown();
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
      playAudio("end");
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
  gamePanel.classList.add("d-none");
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
startButton.addEventListener("click", startGame);
document.addEventListener("keyup", upKeyEvent);
document.addEventListener("keydown", typeEvent);
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
