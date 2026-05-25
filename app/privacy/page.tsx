import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Little Spoonfuls",
  description: "Privacy Policy for Little Spoonfuls",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="May 25, 2026"
      intro="Little Spoonfuls helps parents plan baby meals. This policy explains the limited information we collect and how we use it."
      sections={[
        {
          title: "Information we collect",
          body: "We collect account information such as your email address, sign-in provider details, baby profile details you enter, meal requests, generated meal history, saved recipes, votes, feedback, and basic usage or error logs needed to operate the service.",
        },
        {
          title: "How we use information",
          body: "We use your information to sign you in, personalize meal suggestions, save your preferences and history, improve reliability, prevent abuse, and respond to support or feedback requests.",
        },
        {
          title: "Google sign-in data",
          body: "If you sign in with Google, we use the information provided by Google only to create and manage your Little Spoonfuls account. We do not sell Google user data or use it for advertising.",
        },
        {
          title: "Service providers",
          body: "We may process information through trusted providers that help us run authentication, database storage, analytics, observability, and AI meal generation. They may access information only as needed to provide those services.",
        },
        {
          title: "Your choices",
          body: "You may stop using the service at any time. To request access, correction, or deletion of your account data, contact us through the Contact link in the footer.",
        },
        {
          title: "Children's information",
          body: "Little Spoonfuls is for parents and caregivers. Children should not create accounts or submit information directly.",
        },
        {
          title: "Changes",
          body: "We may update this policy as the service changes. The updated date above will show when the policy was last changed.",
        },
      ]}
    />
  );
}
