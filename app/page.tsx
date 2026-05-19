"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step =
  | "landing"
  | "email"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "loading"
  | "result";

interface State {
  step: Step;
  email: string;
  answers: [string, string, string, string, string, string];
  analysis: string;
  emailError: string;
  submitError: string;
  isSubmitting: boolean;
}

// ─── Questions ───────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    text: "Каким ты представлял этот год в самом начале — и каким он оказался на самом деле?",
    placeholder: "Напиши честно, без приукрашиваний...",
  },
  {
    text: "На что ты потратил больше всего времени в этом году — и ты сам это выбрал или просто так получилось?",
    placeholder: "Что реально занимало твои дни...",
  },
  {
    text: "Какой разговор ты откладывал весь год и так и не провёл?",
    placeholder: "С кем и о чём...",
  },
  {
    text: "В какой момент ты почувствовал, что живёшь не своей жизнью — и что сделал с этим чувством?",
    placeholder: "Когда это было и как ты на это отреагировал...",
  },
  {
    text: "От чего ты убегал в этом году — работой, телефоном, людьми, планами?",
    placeholder: "Что было твоим способом не думать...",
  },
  {
    text: "Если бы этот год был у другого человека — ты бы им гордился?",
    placeholder: "Без самокритики ради самокритики. Честно.",
  },
];

const QUESTION_STEPS: Step[] = ["q1", "q2", "q3", "q4", "q5", "q6"];

function getQuestionIndex(step: Step): number {
  return QUESTION_STEPS.indexOf(step);
}

function getProgressPct(step: Step): number {
  const map: Record<Step, number> = {
    landing: 0, email: 0,
    q1: 1, q2: 2, q3: 3, q4: 4, q5: 5, q6: 6,
    loading: 6, result: 6,
  };
  return (map[step] / 6) * 100;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="shell">
      <div className="inner">
        <p
          className="animate-fadeUp"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent-dim)",
            marginBottom: "24px",
          }}
        >
          Итоги года
        </p>

        <h1
          className="animate-fadeUp delay-100"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(2rem, 2rem + 2vw, 3rem)",
            fontWeight: 400,
            lineHeight: 1.3,
            color: "var(--text-primary)",
            marginBottom: "28px",
          }}
        >
          Честный разговор
          <br />с собой.
        </h1>

        <p
          className="animate-fadeUp delay-200"
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            marginBottom: "56px",
            maxWidth: "420px",
            fontSize: "0.9375rem",
          }}
        >
          6 неудобных вопросов о твоём году. Не итоги — взгляд на то, что
          на самом деле происходило. Анализ пишет ИИ на основе твоих слов.
        </p>

        <div className="animate-fadeUp delay-300">
          <button className="btn-primary" onClick={onStart}>
            Начать
          </button>
        </div>

        <p
          className="animate-fadeUp delay-400"
          style={{
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            marginTop: "20px",
            letterSpacing: "0.03em",
          }}
        >
          Около 10 минут. Один раз на человека.
        </p>
      </div>
    </div>
  );
}

function EmailScreen({
  email,
  emailError,
  isSubmitting,
  onChange,
  onNext,
}: {
  email: string;
  emailError: string;
  isSubmitting: boolean;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="shell">
      <div className="inner">
        <p className="step-label animate-fadeUp">Перед началом</p>

        <h2 className="question-text animate-fadeUp delay-100">
          Оставь свой email
        </h2>

        <p
          className="animate-fadeUp delay-200"
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            marginBottom: "36px",
          }}
        >
          Чтобы не проходить дважды. Мы не отправляем рассылки.
        </p>

        <div className="animate-fadeUp delay-200">
          <input
            ref={inputRef}
            type="email"
            className="email-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onNext()}
            autoComplete="email"
          />
          {emailError && <p className="error-text">{emailError}</p>}
        </div>

        <div
          className="animate-fadeUp delay-300"
          style={{ marginTop: "36px" }}
        >
          <button
            className="btn-primary"
            onClick={onNext}
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? "Проверяем..." : "Продолжить →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionScreen({
  questionIndex,
  answer,
  onChange,
  onNext,
  onBack,
  isLast,
}: {
  questionIndex: number;
  answer: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}) {
  const q = QUESTIONS[questionIndex];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const step = QUESTION_STEPS[questionIndex];

  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, [questionIndex]);

  const canProceed = answer.trim().length > 10;

  return (
    <div className="shell">
      <div className="inner">
        <ProgressBar pct={getProgressPct(step)} />

        <p className="step-label animate-fadeUp">
          Вопрос {questionIndex + 1} из 6
        </p>

        <h2 className="question-text animate-fadeUp delay-100">{q.text}</h2>

        <div className="animate-fadeUp delay-200">
          <textarea
            ref={textareaRef}
            className="answer-textarea"
            placeholder={q.placeholder}
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canProceed) {
                onNext();
              }
            }}
            rows={5}
          />
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.7rem",
              marginTop: "8px",
              letterSpacing: "0.04em",
            }}
          >
            {canProceed ? "⌘ Enter — продолжить" : "Напиши хотя бы несколько слов"}
          </p>
        </div>

        <div
          className="animate-fadeUp delay-300"
          style={{
            marginTop: "36px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <button
            className="btn-primary"
            onClick={onNext}
            disabled={!canProceed}
          >
            {isLast ? "Получить анализ" : "Следующий →"}
          </button>
          <button className="btn-ghost" onClick={onBack}>
            ← Назад
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  const phrases = [
    "Читаю твои ответы...",
    "Ищу паттерн...",
    "Формулирую честно...",
    "Почти готово...",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="shell"
      style={{ textAlign: "center" }}
    >
      <div
        className="inner"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{ display: "flex", gap: "8px", marginBottom: "32px" }}
          aria-hidden="true"
        >
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>

        <p
          className="animate-fadeIn"
          key={idx}
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9375rem",
            letterSpacing: "0.02em",
          }}
        >
          {phrases[idx]}
        </p>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            marginTop: "14px",
            letterSpacing: "0.04em",
          }}
        >
          20–30 секунд
        </p>
      </div>
    </div>
  );
}

function ResultScreen({
  analysis,
  onRestart,
}: {
  analysis: string;
  onRestart: () => void;
}) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(analysis).catch(() => {});
  }, [analysis]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Мои итоги года",
          text: analysis,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  }, [analysis, handleCopy]);

  return (
    <div
      className="shell"
      style={{
        justifyContent: "flex-start",
        paddingTop: "56px",
        paddingBottom: "72px",
      }}
    >
      <div className="inner">
        <p
          className="animate-fadeUp"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent-dim)",
            marginBottom: "16px",
          }}
        >
          Анализ готов
        </p>

        <h2
          className="animate-fadeUp delay-100"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(1.375rem, 1.2rem + 1vw, 1.75rem)",
            fontWeight: 400,
            color: "var(--text-primary)",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Вот что увидел ИИ
        </h2>

        <div className="analysis-card animate-fadeUp delay-200">
          <p className="analysis-body">{analysis}</p>
        </div>

        <div
          className="animate-fadeUp delay-300"
          style={{
            marginTop: "28px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <button className="btn-primary" onClick={handleShare}>
            Поделиться
          </button>
          <button className="btn-ghost" onClick={handleCopy}>
            Скопировать текст
          </button>
        </div>

        <div
          className="animate-fadeUp delay-400"
          style={{
            marginTop: "56px",
            borderTop: "1px solid var(--border)",
            paddingTop: "28px",
          }}
        >
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              lineHeight: 1.7,
              maxWidth: "400px",
            }}
          >
            Это не истина в последней инстанции — это взгляд со стороны на то,
            что ты сам написал.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL: State = {
  step: "landing",
  email: "",
  answers: ["", "", "", "", "", ""],
  analysis: "",
  emailError: "",
  submitError: "",
  isSubmitting: false,
};

export default function App() {
  const [state, setState] = useState<State>(INITIAL);
  const update = (patch: Partial<State>) =>
    setState((s) => ({ ...s, ...patch }));

  // ── Handlers ──

  const handleStart = () => update({ step: "email" });

  const handleEmailNext = async () => {
    if (!isValidEmail(state.email)) {
      update({ emailError: "Введи корректный email" });
      return;
    }
    update({ isSubmitting: true, emailError: "" });
    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.exists) {
        update({ isSubmitting: false, emailError: "Ты уже проходил анализ с этим email." });
        return;
      }
    } catch {
      // Supabase not configured — skip check
    }
    update({ isSubmitting: false, step: "q1" });
  };

  const handleAnswerChange = (idx: number, value: string) => {
    const answers = [...state.answers] as State["answers"];
    answers[idx] = value;
    update({ answers });
  };

  const handleQuestionNext = async (idx: number) => {
    if (idx < 5) {
      update({ step: QUESTION_STEPS[idx + 1] });
      return;
    }
    // Last question — submit for analysis
    update({ step: "loading", submitError: "" });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email.trim().toLowerCase(),
          answers: state.answers,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        update({ step: "result", analysis: data.analysis });
      } else {
        update({
          step: "q6",
          submitError: data.error || "Что-то пошло не так. Попробуй ещё раз.",
        });
      }
    } catch {
      update({
        step: "q6",
        submitError: "Не удалось отправить. Проверь интернет и попробуй снова.",
      });
    }
  };

  const handleBack = (idx: number) =>
    update({ step: idx === 0 ? "email" : QUESTION_STEPS[idx - 1] });

  // ── Render ──

  const { step } = state;

  if (step === "landing") return <LandingScreen onStart={handleStart} />;

  if (step === "email")
    return (
      <EmailScreen
        email={state.email}
        emailError={state.emailError}
        isSubmitting={state.isSubmitting}
        onChange={(v) => update({ email: v, emailError: "" })}
        onNext={handleEmailNext}
      />
    );

  const qIdx = getQuestionIndex(step);
  if (qIdx !== -1)
    return (
      <>
        <QuestionScreen
          key={step}
          questionIndex={qIdx}
          answer={state.answers[qIdx]}
          onChange={(v) => handleAnswerChange(qIdx, v)}
          onNext={() => handleQuestionNext(qIdx)}
          onBack={() => handleBack(qIdx)}
          isLast={qIdx === 5}
        />
        {state.submitError && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#1a0a0a",
              border: "1px solid #c0392b",
              color: "#e74c3c",
              padding: "12px 24px",
              fontSize: "0.875rem",
              maxWidth: "480px",
              width: "calc(100% - 40px)",
              textAlign: "center",
            }}
          >
            {state.submitError}
          </div>
        )}
      </>
    );

  if (step === "loading") return <LoadingScreen />;

  if (step === "result")
    return (
      <ResultScreen
        analysis={state.analysis}
        onRestart={() => setState(INITIAL)}
      />
    );

  return null;
}
