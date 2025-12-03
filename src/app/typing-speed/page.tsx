import Leaderboard from "@/modules/home/components/leader-borad";
import SpeedType from "@/modules/home/components/speed-type";

const TypingSpeedPage = () => {
  return (
    <div className="p-2">
      <SpeedType />
      <Leaderboard />
    </div>
  );
};

export default TypingSpeedPage;
