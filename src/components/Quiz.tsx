import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import "./Quiz.css";

const questions = [
  {
    topic: "Pre-engagement & scope",
    question:
      "You discover a connected subdomain that is not listed in the signed scope. What should you do next?",
    options: [
      "Test it because it belongs to the same organization.",
      "Ask the authorized contact to approve a scope change before testing.",
      "Run a quick vulnerability scan without notifying anyone.",
      "Include it in the report as a confirmed vulnerability.",
    ],
    answer: 1,
    explanation:
      "Ownership does not establish testing authorization. Record the discovery and obtain written approval for a scope change before performing active testing on that asset.",
  },
  {
    topic: "Reconnaissance",
    question: "Which activity is an example of passive reconnaissance?",
    options: [
      "Scanning every port on a production server.",
      "Testing a login form with a list of passwords.",
      "Reviewing public certificate transparency records.",
      "Sending crafted requests to identify a web application firewall.",
    ],
    answer: 2,
    explanation:
      "Public certificate transparency records can reveal hostnames without sending probes to the target. Port scans and crafted application requests are active reconnaissance and must follow the rules of engagement.",
  },
  {
    topic: "Vulnerability analysis",
    question:
      "An automated scanner reports a critical vulnerability. What is the best next step?",
    options: [
      "Report the scanner result as a confirmed critical issue.",
      "Attempt the most disruptive exploit to prove impact.",
      "Ignore it until another scanner reports the same result.",
      "Safely verify the finding and document evidence, context, and impact.",
    ],
    answer: 3,
    explanation:
      "Scanner output is a lead, not proof. Use the least disruptive authorized verification, rule out false positives, and assess the actual technical and business impact before assigning severity.",
  },
  {
    topic: "Risk & remediation",
    question:
      "Which recommendation gives a remediation owner the most actionable next step?",
    options: [
      "“Improve security as soon as possible.”",
      "“Enforce server-side access checks on the affected endpoint, add regression coverage, and verify with two distinct user roles.”",
      "“Run the same scanner again next week.”",
      "“Hide the affected page from the navigation menu.”",
    ],
    answer: 1,
    explanation:
      "Useful remediation names the control to change and how to verify it. Pair the recommendation with an accountable owner, a priority based on impact and likelihood, and a target completion date.",
  },
  {
    topic: "Retesting & verification",
    question:
      "After a fix is deployed, what demonstrates that a finding can be closed?",
    options: [
      "The developer confirms that the patch was merged.",
      "The original evidence is deleted from the report.",
      "An authorized retest verifies the original issue is resolved and records the result.",
      "The application still responds with HTTP 200.",
    ],
    answer: 2,
    explanation:
      "Closure needs evidence from a retest of the original finding in the agreed environment. Record the version, date, verification steps, and outcome; note any residual risk or incomplete remediation.",
  },
];

function readBestScore() {
  try {
    const value = Number(localStorage.getItem("north-renegades-quiz-best"));
    return Number.isInteger(value) && value >= 0 && value <= questions.length
      ? value
      : 0;
  } catch {
    return 0;
  }
}

export default function Quiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [best, setBest] = useState(readBestScore);
  const questionRef = useRef<HTMLLegendElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const hasMounted = useRef(false);
  const question = questions[index];
  const correct = selected === question.answer;

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (complete) resultsRef.current?.focus();
    else questionRef.current?.focus();
  }, [index, complete]);

  function checkAnswer() {
    if (selected === null || checked) return;
    setChecked(true);
    if (correct) setScore((current) => current + 1);
  }

  function nextQuestion() {
    if (!checked) return;
    if (index === questions.length - 1) {
      const newBest = Math.max(best, score);
      setBest(newBest);
      try {
        localStorage.setItem("north-renegades-quiz-best", String(newBest));
      } catch {
        /* The quiz also works without browser storage. */
      }
      setComplete(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setChecked(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setComplete(false);
  }

  return (
    <div className="quiz-page">
      <div className="quiz-heading">
        <div>
          <p className="quiz-eyebrow">LEARNING CENTER</p>
          <h1>
            VAPT Academy<span>.</span>
          </h1>
          <p className="quiz-description">
            Build the judgment behind better security assessments.
          </p>
        </div>
        <span className="quiz-header-label">
          <Sparkles size={15} aria-hidden="true" /> A little sharper, every day
        </span>
      </div>

      <div className="quiz-facts">
        <div>
          <span className="quiz-fact-icon">
            <BookOpen size={19} aria-hidden="true" />
          </span>
          <span>
            <strong>05 questions</strong>
            <small>Real-world assessment decisions</small>
          </span>
        </div>
        <div>
          <span className="quiz-fact-icon">
            <Clock3 size={19} aria-hidden="true" />
          </span>
          <span>
            <strong>5 minute check-in</strong>
            <small>Learn at your own pace</small>
          </span>
        </div>
        <div>
          <span className="quiz-fact-icon">
            <Trophy size={19} aria-hidden="true" />
          </span>
          <span>
            <strong>{best} / 5 personal best</strong>
            <small>Saved on this browser</small>
          </span>
        </div>
      </div>

      <div className="quiz-layout">
        <section className="quiz-card" aria-label="VAPT knowledge quiz">
          {complete ? (
            <div className="quiz-results" aria-live="polite">
              <span className="quiz-result-icon">
                <Trophy size={34} aria-hidden="true" />
              </span>
              <p className="quiz-eyebrow">KNOWLEDGE CHECK COMPLETE</p>
              <h2 tabIndex={-1} ref={resultsRef}>
                {score >= 4
                  ? "A strong security mindset."
                  : "Every answer is progress."}
              </h2>
              <p>
                You scored{" "}
                <strong>
                  {score} out of {questions.length}
                </strong>
                .{" "}
                {score === 5
                  ? "You have the fundamentals covered. Bring that same care to your next assessment."
                  : "Revisit the methodology, then take another run to reinforce what you learned."}
              </p>
              <div className="quiz-score">
                <span>
                  {score * 20}
                  <small>%</small>
                </span>
                <p>YOUR SCORE</p>
              </div>
              <div className="quiz-result-stats">
                <span>
                  <CheckCircle2 size={16} aria-hidden="true" /> {score} correct
                </span>
                <span>
                  <Flag size={16} aria-hidden="true" />{" "}
                  {questions.length - score} to revisit
                </span>
                <span>
                  <Trophy size={16} aria-hidden="true" /> Best: {best}/5
                </span>
              </div>
              <button className="quiz-primary" onClick={restart}>
                <RotateCcw size={16} aria-hidden="true" /> Take it again
              </button>
              <p className="quiz-result-note">
                A learning exercise, not a professional certification.
              </p>
            </div>
          ) : (
            <>
              <div className="quiz-card-top">
                <span>
                  <ShieldCheck size={17} aria-hidden="true" /> THE VAPT
                  FUNDAMENTALS
                </span>
                <span>
                  Question {String(index + 1).padStart(2, "0")}{" "}
                  <span className="quiz-muted">/ 05</span>
                </span>
              </div>
              <div
                className="quiz-progress"
                role="progressbar"
                aria-label="Questions completed"
                aria-valuenow={index + (checked ? 1 : 0)}
                aria-valuemin={0}
                aria-valuemax={5}
              >
                <span
                  style={{
                    width: `${((index + (checked ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                />
              </div>
              <div className="quiz-question-content">
                <span className="quiz-topic">{question.topic}</span>
                <fieldset className="quiz-fieldset" key={index}>
                  <legend tabIndex={-1} ref={questionRef}>
                    {question.question}
                  </legend>
                  <p className="quiz-instruction">Choose the best answer.</p>
                  <div className="quiz-options">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selected === optionIndex;
                      const isAnswer =
                        checked && optionIndex === question.answer;
                      const isWrong = checked && isSelected && !correct;
                      return (
                        <label
                          key={option}
                          className={`quiz-option ${isSelected ? "is-selected" : ""} ${isAnswer ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""} ${checked ? "is-checked" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={optionIndex}
                            checked={isSelected}
                            onChange={() => setSelected(optionIndex)}
                            disabled={checked}
                          />
                          <span
                            className="quiz-option-letter"
                            aria-hidden="true"
                          >
                            {isAnswer ? (
                              <Check size={16} />
                            ) : isWrong ? (
                              <X size={16} />
                            ) : (
                              String.fromCharCode(65 + optionIndex)
                            )}
                          </span>
                          <span>{option}</span>
                          <span className="quiz-radio-dot" aria-hidden="true">
                            {isSelected && <span />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {checked && (
                  <div
                    className={`quiz-explanation ${correct ? "" : "quiz-explanation-review"}`}
                    role="status"
                  >
                    <span>
                      {correct ? (
                        <CheckCircle2 size={19} aria-hidden="true" />
                      ) : (
                        <Lightbulb size={19} aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <strong>
                        {correct
                          ? "Exactly right."
                          : "An opportunity to learn."}
                      </strong>
                      <p>{question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="quiz-actions">
                <span>
                  {checked
                    ? `${score} correct so far`
                    : "One thoughtful decision at a time."}
                </span>
                {checked ? (
                  <button className="quiz-primary" onClick={nextQuestion}>
                    {index === questions.length - 1
                      ? "See my results"
                      : "Next question"}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    className="quiz-primary"
                    disabled={selected === null}
                    onClick={checkAnswer}
                  >
                    Check answer
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        <aside className="quiz-aside">
          <div className="quiz-learning-card">
            <span className="quiz-aside-icon">
              <Lightbulb size={23} aria-hidden="true" />
            </span>
            <p className="quiz-eyebrow">THE BIGGER PICTURE</p>
            <h2>Good testing starts with good judgment.</h2>
            <p>
              Knowing a tool is useful. Knowing when, why, and where to use it
              makes the difference.
            </p>
            <div className="quiz-learning-divider" />
            <strong>Your five checkpoints</strong>
            <ol>
              {questions.map((item, questionIndex) => (
                <li
                  key={item.topic}
                  className={
                    complete || questionIndex < index
                      ? "is-done"
                      : questionIndex === index
                        ? "is-current"
                        : ""
                  }
                >
                  <span>
                    {complete || questionIndex < index ? (
                      <Check size={12} aria-hidden="true" />
                    ) : (
                      String(questionIndex + 1).padStart(2, "0")
                    )}
                  </span>
                  {item.topic}
                </li>
              ))}
            </ol>
          </div>
          <div className="quiz-privacy-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              Practice freely. This quiz runs entirely in your browser, with no
              target systems involved.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
