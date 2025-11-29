import Players from "@/modules/room/components/players";
import TabNavigation from "@/modules/room/components/tab-navigation";

interface SingleRoomPageProps {
  params: Promise<{ roomId: string }>;
}

const SingleRoomPage = async ({ params }: SingleRoomPageProps) => {
  const { roomId } = await params;

  return (
    <div>
      <TabNavigation />
      <Players roomId={roomId} />
    </div>
  );
};

export default SingleRoomPage;
