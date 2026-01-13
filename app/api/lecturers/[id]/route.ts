import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLecturerById } from "@/data/lecturer/get-lecturer-by-id";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const session = await getServerSession(authOptions);

      // Check if user is authenticated
      if (!session || !session.user) {
         return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
         );
      }

      const userId = Number(session.user.id);
      const requestedId = Number((await params).id);

      // user can only access their own data
      if (userId !== requestedId || session.user.role !== "lecturer") {
         return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
         );
      }

      const lecturer = await getLecturerById(requestedId);

      if (!lecturer) {
         return NextResponse.json(
            { error: "Lecturer not found" },
            { status: 404 }
         );
      }

      return NextResponse.json(lecturer, { status: 200 });
   } catch (error) {
      console.error("Error fetching lecturer:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
