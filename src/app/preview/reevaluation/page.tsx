import { Suspense } from "react";
import ReevaluationPage from "@/app/trainer/evaluation/reevaluate/page";

export default function PreviewReevaluationPage() {
  return (
    <Suspense fallback={<main className="reeval-shell"><p className="support-copy">Loading reevaluation preview…</p></main>}>
      <ReevaluationPage />
    </Suspense>
  );
}
