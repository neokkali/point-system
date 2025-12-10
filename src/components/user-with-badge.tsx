import Image from "next/image";

// type UserRole = "OWNER" | "ADMIN" | "MODERATOR" | "USER";

const badgeMap: Record<string, string | null> = {
  OWNER: "/icons/shield1.gif",
  ADMIN: "/icons/shield2.gif",
  MODERATOR: "/icons/shield3.gif",
  USER: null,
};

export default function UserBadge({
  name,
  role,
}: {
  name?: string;
  role: string;
}) {
  const badge = badgeMap[role];

  return (
    <div className="flex items-center gap-1">
      {badge && (
        <Image
          alt={`${role} badge`}
          src={badge}
          width={20}
          height={20}
          className="object-contain"
        />
      )}
      <span className="text-lg font-semibold mt-1">{name}</span>
    </div>
  );
}
