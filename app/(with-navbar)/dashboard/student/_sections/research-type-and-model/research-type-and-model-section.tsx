import { ResearchSelector } from "./components/research-selector";

export function ResearchTypeAndModelSection() {
   return (
      <section className="mb-4">
         <ResearchSelector
            initialType="quantitative"
            initialModel="survey"
         />
      </section>
   )
}