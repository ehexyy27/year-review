import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { saveSubmission } from "@/lib/supabase";

const QUESTIONS = [
  "Каким ты представлял этот год в самом начале — и каким он оказался на самом деле?",
  "На что ты потратил больше всего времени в этом году — и ты сам это выбрал или просто так получилось?",
  "Какой разговор ты откладывал весь год и так и не провёл?",
  "В какой момент ты почувствовал, что живёшь не своей жизнью — и что сделал с этим чувством?",
  "От чего ты убегал в этом году — работой, телефоном, людьми, планами?",
  "Если бы этот год был у другого человека — ты бы им гордился?",
];

const SYSTEM_PROMPT = `Ты пишешь честный анализ года человека на основе его ответов. Говоришь о нём в третьем лице — «этот человек», «он», «она». Тон — умный наблюдатель, который видит паттерн, не судья и не коуч. Используй его собственные слова из ответов. Найди один главный паттерн, который проходит через все ответы, и назови его прямо. Сделай один жёсткий вывод, который сложно проигнорировать. Закончи одним вопросом — не советом. Никогда не хвали за факт существования. Никогда не используй слова: рост, трансформация, путешествие, ты молодец, двигайся вперёд. Никогда не давай список советов. Пиши на русском языке.`;

function buildPrompt(answers: string[]): string {
  const qa = answers
    .map((answer, i) => `Вопрос ${i + 1}: ${QUESTIONS[i]}\nОтвет: ${answer.trim()}`)
    .join("\n\n");
  return `${SYSTEM_PROMPT}\n\nВот ответы человека на 6 вопросов о его годе:\n\n${qa}\n\nНапиши честный анализ.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, answers } = body as { email: string; answers: string[] };

    if (
      !answers ||
      !Array.isArray(answers) ||
      answers.length !== 6 ||
      answers.some((a) => !a || typeof a !== "string" || a.trim().length < 5)
    ) {
      return NextResponse.json({ error: "Заполни все 6 ответов" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API ключ не настроен" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(buildPrompt(answers));
    const analysis = result.response.text();

    // Save to Supabase (non-blocking, best-effort)
    if (email) {
      saveSubmission(email, answers, analysis).catch(() => {});
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[analyze] error:", err);
    return NextResponse.json(
      { error: "Не удалось получить анализ. Попробуй снова." },
      { status: 500 }
    );
  }
}
