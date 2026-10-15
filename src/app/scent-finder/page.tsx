import type { Metadata } from "next";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Scent Finder: find your perfume in six questions",
  description: "Answer six quick questions and the Solvane Scent Finder matches you with three of our eaux de parfum. Try them as samples or in the Discovery Set.",
  alternates: { canonical: "/scent-finder" },
};

export default function ScentFinderPage() {
  return (
    <section className="sec-bone">
      <Quiz />
    </section>
  );
}
