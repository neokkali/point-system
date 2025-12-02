import HomeView from "@/components/home-view";
import SpeedType from "@/modules/home/components/speed-type";

export default function Page() {
  return (
    <main className="p-8">
      <SpeedType />
      <HomeView />
    </main>
  );
}
