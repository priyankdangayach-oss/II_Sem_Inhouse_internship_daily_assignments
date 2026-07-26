/* ============================================================
   QuizMaster — quiz logic
   Questions preserved from the original app; edit freely below.
   Each option array must have exactly 4 items; correct is the
   0-based index of the right option.
   ============================================================ */

const QUESTIONS = [
  {
    category: "CSS",
    question: "Which language is used to style web pages?",
    options: ["Java", "Python", "CSS", "HTML"],
    correct: 2
  },
  {
    category: "Computer Science",
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Computer Processing Unit",
      "Central Program Unit",
      "Central Processor Unit"
    ],
    correct: 0
  },
  {
    category: "CSS",
    question: "Which CSS property changes the text color?",
    options: ["font-color", "color", "text-color", "colour"],
    correct: 1
  },
  {
    category: "JavaScript",
    question: "Which language is used to make web pages interactive?",
    options: ["HTML", "JavaScript", "CSS", "SQL"],
    correct: 1
  },
  {
    category: "HTML",
    question: "Which HTML tag is used to insert an image?",
    options: ["<picture>", "<image>", "<img>", "<src>"],
    correct: 2
  },
  {
    category: "Tech History",
    question: "Which company developed JavaScript?",
    options: ["Microsoft", "Apple", "Netscape", "Google"],
    correct: 2
  },
  {
    category: "CSS",
    question: "Which CSS property changes the background color?",
    options: ["background-color", "color", "bg-color", "background"],
    correct: 0
  },
  {
    category: "JavaScript",
    question: "Which function takes input from the user in JavaScript?",
    options: ["alert()", "prompt()", "input=()", "console.log()"],
    correct: 1
  },
  {
    category: "HTML",
    question: "Which HTML tag is used to create a form?",
    options: ["<input>", "<submit>", "<field>", "<form>"],
    correct: 3
  },
  {
    category: "Web Development",
    question: "What does PHP stand for?",
    options: [
      "Personal Home Page",
      "Private Home Page",
      "Hypertext Preprocessor",
      "Programming Hypertext Page"
    ],
    correct: 2
  }
];

const TOTAL_TIME = 120; // seconds, for the whole 10-question round
const TIME_PER_QUESTION = Math.round(TOTAL_TIME / QUESTIONS.length); // seconds per question

/* ---------------- state ---------------- */

let currentIndex = 0;
let score = 0;
let answers = [];      // "correct" | "wrong" | "timeout"
let timerId = null;
let timeLeft = TIME_PER_QUESTION;
let locked = false;    // true once the current question has been answered/timed out

/* ---------------- element refs ---------------- */

const screenStart  = document.getElementById("screen-start");
const screenQuiz   = document.getElementById("screen-quiz");
const screenResult = document.getElementById("screen-result");

const btnStart   = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");

const qCurrentEl = document.getElementById("q-current");
const qTotalEl   = document.getElementById("q-total");
const dotsEl      = document.getElementById("dots");
const scoreValueEl = document.getElementById("score-value");

const timerRing  = document.getElementById("timer-ring");
const timerValue = document.getElementById("timer-value");
const timerRingWrap = document.querySelector(".ring--timer");

const qCategoryEl = document.getElementById("q-category");
const qTextEl      = document.getElementById("q-text");
const optionsGrid  = document.getElementById("options-grid");
const statusLine   = document.getElementById("status-line");

const finalScoreEl = document.getElementById("final-score");
const scoreRing     = document.getElementById("score-ring");
const gradeTextEl   = document.getElementById("grade-text");
const gradeSubEl    = document.getElementById("grade-sub");
const breakdownEl   = document.getElementById("breakdown");

const RING_C = 326.7; // matches --ring-c in CSS, circumference of r=52 circle
const LETTERS = ["A", "B", "C", "D"];

/* ---------------- setup ---------------- */

qTotalEl.textContent = QUESTIONS.length;
buildDots();

btnStart.addEventListener("click", startQuiz);
btnRestart.addEventListener("click", resetQuiz);

/* ---------------- flow control ---------------- */

function showScreen(el){
  [screenStart, screenQuiz, screenResult].forEach(s => s.classList.remove("is-active"));
  el.classList.add("is-active");
}

function startQuiz(){
  currentIndex = 0;
  score = 0;
  answers = [];
  scoreValueEl.textContent = "0";
  buildDots();
  showScreen(screenQuiz);
  loadQuestion();
}

function resetQuiz(){
  clearInterval(timerId);
  showScreen(screenStart);
}

function buildDots(){
  dotsEl.innerHTML = "";
  QUESTIONS.forEach(() => {
    const d = document.createElement("span");
    d.className = "dot";
    dotsEl.appendChild(d);
  });
}

function refreshDots(){
  const dots = dotsEl.querySelectorAll(".dot");
  dots.forEach((d, i) => {
    d.classList.remove("is-done", "is-wrong", "is-current");
    if (i < answers.length){
      d.classList.add(answers[i] === "correct" ? "is-done" : "is-wrong");
    } else if (i === currentIndex){
      d.classList.add("is-current");
    }
  });
}

/* ---------------- question rendering ---------------- */

function loadQuestion(){
  locked = false;
  const q = QUESTIONS[currentIndex];

  qCurrentEl.textContent = currentIndex + 1;
  qCategoryEl.textContent = q.category;
  qTextEl.textContent = q.question;
  statusLine.innerHTML = "&nbsp;";

  optionsGrid.innerHTML = "";
  q.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.className = "option";

    const letterSpan = document.createElement("span");
    letterSpan.className = "option-letter";
    letterSpan.textContent = LETTERS[i];

    const textSpan = document.createElement("span");
    textSpan.textContent = optionText; // textContent keeps things like "<img>" as visible text, not markup

    btn.appendChild(letterSpan);
    btn.appendChild(textSpan);
    btn.addEventListener("click", () => selectOption(i));
    optionsGrid.appendChild(btn);
  });

  refreshDots();
  startTimer();
}

function startTimer(){
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();
  timerRingWrap.classList.remove("is-urgent");

  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
    if (timeLeft <= 3){
      timerRingWrap.classList.add("is-urgent");
    }
    if (timeLeft <= 0){
      clearInterval(timerId);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay(){
  timerValue.textContent = timeLeft;
  const fraction = timeLeft / TIME_PER_QUESTION;
  timerRing.style.strokeDashoffset = RING_C * (1 - fraction);
}

/* ---------------- answering ---------------- */

function selectOption(selectedIndex){
  if (locked) return;
  lockQuestion();

  const q = QUESTIONS[currentIndex];
  const options = optionsGrid.querySelectorAll(".option");
  const isCorrect = selectedIndex === q.correct;

  options[q.correct].classList.add("is-correct");
  if (!isCorrect){
    options[selectedIndex].classList.add("is-wrong");
    statusLine.textContent = "Incorrect — correct answer highlighted";
  } else {
    statusLine.textContent = "Correct!";
    score += 1;
    scoreValueEl.textContent = score;
  }

  answers.push(isCorrect ? "correct" : "wrong");
  refreshDots();
  goToNextAfterDelay();
}

function handleTimeout(){
  if (locked) return;
  lockQuestion();

  const q = QUESTIONS[currentIndex];
  const options = optionsGrid.querySelectorAll(".option");
  options[q.correct].classList.add("is-correct");
  statusLine.textContent = "Time's up — correct answer highlighted";

  answers.push("timeout");
  refreshDots();
  goToNextAfterDelay();
}

function lockQuestion(){
  locked = true;
  clearInterval(timerId);
  optionsGrid.querySelectorAll(".option").forEach(btn => btn.disabled = true);
}

function goToNextAfterDelay(){
  setTimeout(() => {
    currentIndex += 1;
    if (currentIndex < QUESTIONS.length){
      loadQuestion();
    } else {
      showResult();
    }
  }, 1400);
}

/* ---------------- result screen ---------------- */

function showResult(){
  clearInterval(timerId);
  showScreen(screenResult);

  finalScoreEl.textContent = score;
  const total = QUESTIONS.length;
  const fraction = score / total;

  scoreRing.style.strokeDashoffset = RING_C * (1 - fraction);

  const pct = Math.round(fraction * 100);
  if (pct >= 80){
    gradeTextEl.textContent = "Outstanding!";
  } else if (pct >= 60){
    gradeTextEl.textContent = "Well played!";
  } else if (pct >= 40){
    gradeTextEl.textContent = "Good effort!";
  } else {
    gradeTextEl.textContent = "Room to grow!";
  }
  gradeSubEl.textContent = `You answered ${score} of ${total} correctly.`;

  breakdownEl.innerHTML = "";
  answers.forEach((result, i) => {
    const chip = document.createElement("span");
    chip.className = "chip is-" + result;
    chip.textContent = i + 1;
    breakdownEl.appendChild(chip);
  });
}
