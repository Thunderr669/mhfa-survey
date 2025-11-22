// TODO: Replace with your actual Apps Script URL:
const SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";

/* ----------------------
   Question text + choices
-------------------------*/
const questionData = {
  q1: [
    { value: "B", text: "Stay with them and guide slow breathing." },
    { value: "D", text: "Give them water and distract them with a joke." },
    { value: "C", text: "Leave and call someone else." },
    { value: "A", text: "Tell them to calm down and ignore it." }
  ],
  q2: [
    { value: "B", text: "Gently ask if they want to talk about anything." },
    { value: "D", text: "Wait for them to approach you first." },
    { value: "A", text: "Ignore it — it’s their problem." },
    { value: "C", text: "Tell others they’re acting weird." }
  ],
  q3: [
    { value: "B", text: "Ask if they’re feeling overwhelmed lately." },
    { value: "C", text: "Tell them everyone feels like that sometimes." },
    { value: "A", text: "Change the topic." },
    { value: "D", text: "Advise them to get over it." }
  ],
  q4: [
    { value: "B", text: "Give them space, later check if they’re stressed." },
    { value: "D", text: "Avoid them forever." },
    { value: "A", text: "Snap back." },
    { value: "C", text: "Gossip about it to friends." }
  ],
  q5: [
    { value: "B", text: "Could be a temporary high — check in gently." },
    { value: "A", text: "Finally, they are back to normal." },
    { value: "C", text: "No idea, ignore." },
    { value: "D", text: "They're being dramatic." }
  ],
  q6: [
    { value: "B", text: "Help them breathe and reassure them they’re safe." },
    { value: "A", text: "Give motivational quotes." },
    { value: "C", text: "Tell them they’ll fail if they panic." },
    { value: "D", text: "Tell the teacher they’re causing drama." }
  ],
  q7: [
    { value: "A", text: "Ask a warden to check on them." },
    { value: "B", text: "Knock and ask if they want company." },
    { value: "C", text: "Mind your business." },
    { value: "D", text: "Tell others they're acting weird." }
  ],
  q8: [
    { value: "B", text: "Sit with them and let them talk." },
    { value: "D", text: "Immediately call their parents." },
    { value: "C", text: "Pretend you didn’t see anything." },
    { value: "A", text: "Tell them to toughen up." }
  ],
  q9: [
    { value: "A", text: "Ask gently if they’re feeling unsafe lately." },
    { value: "D", text: "Ignore it." },
    { value: "C", text: "Show others." },
    { value: "B", text: "Confront them aggressively." }
  ],
  q10: [
    { value: "D", text: "I want training for this." },
    { value: "B", text: "Somewhat confident." },
    { value: "A", text: "Very confident." },
    { value: "C", text: "Not confident." }
  ]
};

/* ----------------------
   Score map (same as before)
-------------------------*/
const scoreMap = {
  q1: { B: 3, D: 2, C: 1, A: 0 },
  q2: { B: 3, D: 2, A: 1, C: 0 },
  q3: { B: 3, C: 2, A: 1, D: 0 },
  q4: { B: 3, D: 2, A: 1, C: 0 },
  q5: { B: 3, A: 2, C: 1, D: 0 },
  q6: { B: 3, A: 2, C: 1, D: 0 },
  q7: { A: 3, B: 2, C: 1, D: 0 },
  q8: { B: 3, D: 2, C: 1, A: 0 },
  q9: { A: 3, D: 2, C: 1, B: 0 },
  q10: { D: 3, B: 2, A: 1, C: 0 }
};

/* ----------------------
   Shuffle only once per session
-------------------------*/
function getShuffledOptions() {
  if (sessionStorage.getItem("mhfa-options")) {
    return JSON.parse(sessionStorage.getItem("mhfa-options"));
  }

  const shuffled = {};

  Object.keys(questionData).forEach(q => {
    const arr = [...questionData[q]];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffled[q] = arr;
  });

  sessionStorage.setItem("mhfa-options", JSON.stringify(shuffled));
  return shuffled;
}

/* ----------------------
   Classification result
-------------------------*/
function classify(score) {
  if (score >= 24) {
    return {
      level: "Supportive Responder",
      recommendation:
        "You consistently choose safe, empathetic responses. With some structured MHFA training, you can be a reliable first responder to emotional distress among peers."
    };
  } else if (score >= 18) {
    return {
      level: "Aware but Inconsistent",
      recommendation:
        "You are aware of mental health situations and often choose helpful actions, but sometimes hesitate or pick less effective responses."
    };
  } else if (score >= 10) {
    return {
      level: "Silent Observer",
      recommendation:
        "You notice something might be wrong but often stay in the background. MHFA skills can help you step in safely."
    };
  } else {
    return {
      level: "Needs Awareness Training",
      recommendation:
        "Some choices may worsen emotional distress unknowingly. MHFA training will help you respond safely."
    };
  }
}

/* ----------------------
   Render options dynamically
-------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("mhfaForm");
  if (!form) return;

  const shuffled = getShuffledOptions();

  document.querySelectorAll(".question").forEach(q => {
    const qName = q.dataset.q;
    const container = q.querySelector(".options");

    shuffled[qName].forEach(opt => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="${qName}" value="${opt.value}" required>
        ${opt.text}
      `;
      container.appendChild(label);
    });
  });

  /* ---- handle submission ---- */
  const resultCard = document.getElementById("resultCard");
  const levelText = document.getElementById("levelText");
  const scoreText = document.getElementById("scoreText");
  const recommendationText = document.getElementById("recommendationText");

  form.addEventListener("submit", e => {
    e.preventDefault();

    let totalScore = 0;
    const answers = {};

    Object.keys(scoreMap).forEach(qName => {
      const selected = form.querySelector(`input[name="${qName}"]:checked`);
      const value = selected.value;

      answers[qName] = value;
      totalScore += scoreMap[qName][value] || 0;
    });

    const data = classify(totalScore);

    levelText.textContent = data.level;
    scoreText.textContent = `Your score: ${totalScore} / 30`;
    recommendationText.textContent = data.recommendation;

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth" });

    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...answers, score: totalScore, level: data.level })
    });
  });
});
