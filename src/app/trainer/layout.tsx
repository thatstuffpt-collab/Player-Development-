import { ReactNode } from "react";
import { TrainerAuthGate } from "@/components/auth/trainer-auth-gate";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return <TrainerAuthGate>{children}</TrainerAuthGate>;
}
