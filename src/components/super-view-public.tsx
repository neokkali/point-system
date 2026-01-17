"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import SuperScores from "./super-scores";

const SuperViewPublic = () => {
  useAuthGuard(["OWNER", "ADMIN", "MODERATOR"], "/auth", "/");
  return <SuperScores url="/super/public" />;
};

export default SuperViewPublic;
