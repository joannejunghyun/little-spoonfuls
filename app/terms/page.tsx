import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Little Spoonfuls",
  description: "Terms of Service for Little Spoonfuls",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="May 25, 2026"
      intro="By using Little Spoonfuls, you agree to these terms. If you do not agree, please do not use the service."
      sections={[
        {
          title: "Use of the service",
          body: "Little Spoonfuls provides meal planning ideas for parents and caregivers. You are responsible for the information you enter and for using the service lawfully and safely.",
        },
        {
          title: "Not medical advice",
          body: "Meal suggestions are informational only and are not medical, nutrition, allergy, or emergency advice. Always use your judgment and consult a qualified healthcare professional for your child's needs.",
        },
        {
          title: "Allergies and safety",
          body: "You are responsible for checking ingredients, allergens, choking risks, food texture, portion size, and suitability before preparing or serving any meal.",
        },
        {
          title: "Accounts",
          body: "You are responsible for keeping your account access secure. We may limit, suspend, or remove access if the service is misused or if required to protect the service or other users.",
        },
        {
          title: "Availability",
          body: "We try to keep Little Spoonfuls reliable, but the service may change, pause, or stop at any time. We provide the service as is, without guarantees that every suggestion will fit every situation.",
        },
        {
          title: "Contact",
          body: "For questions about these terms, contact us through the Contact link in the footer.",
        },
      ]}
    />
  );
}
