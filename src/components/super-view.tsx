"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import SuperScores from "./super-scores";

const SuperView = () => {
  useAuthGuard(["ADMIN"], "/auth", "/");
  return <SuperScores />;
};

export default SuperView;
