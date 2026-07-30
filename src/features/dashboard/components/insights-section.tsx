import { Package, Sparkles } from "lucide-react";

export function PerformanceTrajectoryCard() {
  return (
    <div className="squircle col-span-8 flex flex-col bg-surface-container-low p-10">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Performance Trajectory
        </h3>
        <div className="flex items-center gap-6">
          <span className="text-label-sm flex items-center gap-2 text-on-surface-variant">
            <span className="squircle size-3 bg-primary" />
            Primary
          </span>
          <span className="text-label-sm flex items-center gap-2 text-on-surface-variant">
            <span className="squircle size-3 bg-surface-container-highest" />
            Baseline
          </span>
        </div>
      </div>
      <div className="relative min-h-[350px] flex-1">
        <div className="absolute inset-0 flex items-end gap-4 px-2">
          <div className="squircle h-[40%] flex-1 rounded-b-none bg-surface-container-high transition-all hover:bg-primary/20" />
          <div className="squircle h-[60%] flex-1 rounded-b-none bg-surface-container-high transition-all hover:bg-primary/20" />
          <div className="squircle h-[55%] flex-1 rounded-b-none bg-surface-container-high transition-all hover:bg-primary/20" />
          <div className="squircle h-[85%] flex-1 rounded-b-none bg-surface-container-high transition-all hover:bg-primary/20" />
          <div className="squircle relative h-[95%] flex-1 rounded-b-none bg-primary transition-all">
            <div className="squircle absolute -top-12 left-1/2 -translate-x-1/2 bg-on-surface px-4 py-2 text-[11px] font-bold tracking-widest whitespace-nowrap text-white uppercase">
              रू 12,400
            </div>
          </div>
          <div className="squircle h-[70%] flex-1 rounded-b-none bg-surface-container-high transition-all hover:bg-primary/20" />
          <div className="squircle h-[65%] flex-1 rounded-b-none bg-surface-container-high transition-all hover:bg-primary/20" />
        </div>
        <div className="text-label-sm absolute bottom-0 flex w-full justify-between border-t border-surface-container-high pt-6 font-bold text-on-surface-variant uppercase">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
}

export function CuratedInsightsPanel() {
  return (
    <div className="col-span-4 space-y-8">
      <h3 className="font-headline-md text-headline-md text-on-surface">
        Curated Insights
      </h3>
      <div className="squircle relative cursor-pointer overflow-hidden border-none bg-[#F3E5F5] p-8 text-[#4A148C] shadow-sm transition-transform active:scale-[0.98]">
        <div className="relative z-10">
          <p className="text-label-sm mb-3 font-bold tracking-widest opacity-70">
            Peak Analysis
          </p>
          <h4 className="mb-2 text-2xl font-bold">Friday Strategic Peak</h4>
          <p className="text-sm leading-relaxed opacity-90">
            Significant volume surge observed between 15:00 and 20:00. Optimizing
            staff levels recommended.
          </p>
        </div>
        <Sparkles
          className="absolute -right-6 -bottom-6 size-[140px] opacity-10"
          strokeWidth={1}
        />
      </div>
      <div className="squircle relative cursor-pointer overflow-hidden border-none bg-[#E8F5E9] p-8 text-[#1B5E20] shadow-sm transition-transform active:scale-[0.98]">
        <div className="relative z-10">
          <p className="text-label-sm mb-3 font-bold tracking-widest opacity-70">
            Resource Warning
          </p>
          <h4 className="mb-2 text-2xl font-bold">Stock Critical: Pomade</h4>
          <p className="text-sm leading-relaxed opacity-90">
            Inventory forecast suggests replenishment before the weekend cycle
            commences.
          </p>
        </div>
        <Package
          className="absolute -right-6 -bottom-6 size-[140px] opacity-10"
          strokeWidth={1}
        />
      </div>
    </div>
  );
}

export function InsightsSection() {
  return (
    <section className="grid grid-cols-12 gap-8">
      <PerformanceTrajectoryCard />
      <CuratedInsightsPanel />
    </section>
  );
}
