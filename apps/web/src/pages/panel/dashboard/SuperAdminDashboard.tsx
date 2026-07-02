import { PanelSidebar } from "./layout/panel-side-bar";
import { PanelTopBar } from "./layout/panel-top-bar";
import { PanelHeroBanner } from "./sections/panel-hero-banner";
import { PanelLiveActivity } from "./sections/panel-live-activity";
import { PanelQuickActions } from "./sections/panel-quick-actions";
import { PanelRecentSchools } from "./sections/panel-recent-schools";
import { PanelStatsCards } from "./sections/panel-stats-cards";
import { PanelSubscriptionMix } from "./sections/panel-subscription-mix";


export default function SuperAdminDashboard() {
  return (
    <div className="flex h-screen bg-[#EEEDF9] font-Poppins">
      <PanelSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PanelTopBar />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <PanelHeroBanner />
          <PanelStatsCards />
          <PanelQuickActions />

          {/* Bottom split */}
          <div className="flex gap-5 items-start">
            {/* Left — table */}
            <div className="flex-1 min-w-0">
              <PanelRecentSchools />
            </div>

            {/* Right — activity + subscription mix */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-4">
              <PanelLiveActivity />
              <PanelSubscriptionMix />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}