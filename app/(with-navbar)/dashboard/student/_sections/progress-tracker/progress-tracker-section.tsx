import { ProgressTracker } from "./components/progress-tracker";

type ProgressTrackerSectionProps = {
   currentProgress: number;
}

export function ProgressTrackerSection({
   currentProgress
}: ProgressTrackerSectionProps) {

   return (
      <section className="mb-4">
         <ProgressTracker currentStage={currentProgress} />
      </section>
   )
}