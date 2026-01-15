import { ProfileCard } from "@/components/common/profile-card/profile-card";
import { Lecturer } from "@/types/user/lecturer";

type LecturerProfileCardProps = {
  lecturer: Lecturer;
};

export function LecturerProfileCard({ lecturer }: LecturerProfileCardProps) {
  return (
    <ProfileCard user={{...lecturer, role: "lecturer"}} showAdminPageButton={lecturer.isAdmin} />
  )
}
