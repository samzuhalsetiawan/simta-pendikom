"use client";

import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function DashboardButton() {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <Button
      asChild
      variant={"default"}
      size={"lg"}
      className="lg:px-14 lg:py-6 hover:cursor-pointer lg:uppercase lg:bg-primary lg:text-background lg:border-border lg:hover:bg-muted lg:hover:text-primary lg:hover:border-primary pointer-events-auto shadow-lg"
    >
      <Link
        href={
          !user
            ? "/login"
            : user.role === "student"
            ? "/dashboard/student"
            : user.role === "lecturer"
            ? "/dashboard/lecturer"
            : "#"
        }
      >
        Masuk Dashboard
      </Link>
    </Button>
  );
}
