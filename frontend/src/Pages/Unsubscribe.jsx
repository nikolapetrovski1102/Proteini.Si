import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiMail } from "react-icons/fi";
import { api } from "../services/api";
import { useLanguage } from "./translation/LanguageContext";
import { Alert, AuthShell, headingClass, primaryButtonClass } from "./LoginPages/AuthKit";

const COPY = {
  mk: {
    working: "Те одјавуваме…",
    doneTitle: "Одјавен си",
    doneText: "Повеќе нема да добиваш промотивни пораки од Proteini.si. Пораките за твоите нарачки и профилот ќе продолжат да стигнуваат.",
    errorTitle: "Одјавата не успеа",
    invalid: "Линкот за одјава е невалиден или нецелосен. Отвори го повторно од пораката или пиши ни на info@proteini.mk.",
    failed: "Не успеавме да те одјавиме. Обиди се повторно подоцна или пиши ни на info@proteini.mk.",
    home: "Назад кон продавницата",
    asideTitle: "Ти одлучуваш што добиваш",
    asideText: "Промотивните пораки ги праќаме само ако си се согласил. Секогаш можеш повторно да ги вклучиш преку поставките за колачиња.",
  },
  al: {
    working: "Po të çregjistrojmë…",
    doneTitle: "U çregjistrove",
    doneText: "Nuk do të marrësh më mesazhe promovuese nga Proteini.si. Mesazhet për porositë dhe profilin tënd do të vazhdojnë të vijnë.",
    errorTitle: "Çregjistrimi dështoi",
    invalid: "Linku për çregjistrim është i pavlefshëm ose i paplotë. Hape përsëri nga mesazhi ose na shkruaj në info@proteini.mk.",
    failed: "Nuk arritëm të të çregjistrojmë. Provo përsëri më vonë ose na shkruaj në info@proteini.mk.",
    home: "Kthehu te dyqani",
    asideTitle: "Ti vendos çfarë merr",
    asideText: "Mesazhet promovuese i dërgojmë vetëm nëse ke dhënë pëlqimin. Mund t'i aktivizosh përsëri te cilësimet e cookies.",
  },
};

export default function Unsubscribe() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.mk;
  const params = new URLSearchParams(location.search);
  const email = params.get("e");
  const token = params.get("t");
  const [result, setResult] = useState("working"); // working | done | failed
  const state = email && token ? result : "invalid";
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !email || !token) return;
    started.current = true;
    api
      .unsubscribeMarketingEmails({ email, token })
      .then(() => setResult("done"))
      .catch(() => setResult("failed"));
  }, [email, token]);

  const aside = (
    <div className="flex flex-1 flex-col justify-end">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDC700] text-[#141409]">
        <FiMail size={22} />
      </span>
      <h2 className={`${headingClass} mt-6 text-4xl text-white`}>{copy.asideTitle}</h2>
      <p className="mt-3 max-w-[380px] text-[15px] leading-relaxed text-white/70">{copy.asideText}</p>
    </div>
  );

  return (
    <AuthShell aside={aside}>
      {state === "working" && (
        <p className="py-10 text-center text-[15px] text-gray-600" role="status">
          {copy.working}
        </p>
      )}

      {state === "done" && (
        <div className="py-4 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#8DC658] text-white">
            <FiCheck size={30} strokeWidth={3} />
          </span>
          <h1 className={`${headingClass} mt-6 text-4xl sm:text-5xl`}>{copy.doneTitle}</h1>
          <p className="mx-auto mt-3 max-w-[380px] text-[15px] leading-relaxed text-gray-600">{copy.doneText}</p>
        </div>
      )}

      {(state === "invalid" || state === "failed") && (
        <div className="py-4">
          <h1 className={`${headingClass} text-4xl sm:text-5xl`}>{copy.errorTitle}</h1>
          <div className="mt-6">
            <Alert>{state === "invalid" ? copy.invalid : copy.failed}</Alert>
          </div>
        </div>
      )}

      {state !== "working" && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => navigate("/")} className={primaryButtonClass}>
            {copy.home}
            <FiArrowRight className="text-[#FDC700]" />
          </button>
        </div>
      )}
    </AuthShell>
  );
}
