import { Suspense } from "react";
import BaselineEvaluationPage from "@/app/trainer/evaluation/new/page";

export default function PreviewBaselinePage() {
  return (
    <Suspense fallback={<main className="evaluation-shell"><p className="support-copy">Loading baseline preview…</p></main>}>
      <BaselineEvaluationPage />
    </Suspense>
  );
}
