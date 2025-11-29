import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useClearRoom } from "@/hooks/use-clear-room";
import { useState } from "react";

export default function ClearRoomButton({ roomId }: { roomId: string }) {
  const [open, setOpen] = useState(false);
  const clearRoomMutation = useClearRoom(roomId);

  const handleClear = () => {
    clearRoomMutation.mutate();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* الزر الذي يفتح الدايالوغ */}
      <DialogTrigger asChild>
        <Button variant="destructive">حذف جميع اللاعبين من الغرفة</Button>
      </DialogTrigger>

      <DialogContent dir="rtl">
        <AlertDialogHeader dir="rtl" className="text-center!">
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogDescription>
            هل أنت متأكد أنك تريد حذف كل اللاعبين ونقاطهم من هذه الغرفة؟ هذا
            الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </AlertDialogHeader>
        <DialogFooter className="flex justify-start gap-2" dir="rtl">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={clearRoomMutation.isPending}
          >
            {clearRoomMutation.isPending ? "جارٍ الحذف..." : "حذف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
