import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
   success: boolean;
   data?: T;
   error?: string;
}

export function successResponse<T>(data: T, status = 200) {
   return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500) {
   return NextResponse.json({ success: false, error: message }, { status });
}

export function handleDbError(error: any) {
   console.error("Database Error:", error);

   // Map MySQL error codes (SQLSTATE) to HTTP responses
   // Based on init_fix.sql definitions
   if (error && error.sqlState) {
      switch (error.sqlState) {
         case "45001": // ERR_ROLE_CONFLICT
            return errorResponse("Lecturer already assigned with a different role", 409);
         case "45002": // ERR_DUPLICATE_ASSIGNMENT
            return errorResponse("Lecturer already assigned to this thesis", 409);
         case "45003": // ERR_CONSULT_NOT_SUPERVISOR
            return errorResponse("Consultations are only allowed with supervisors (Pembimbing)", 403);
         case "45004": // ERR_EVENT_NOT_APPROVED
            return errorResponse("Event has not been approved yet", 400);
         case "45005": // ERR_PRIVATE_EVENT
            return errorResponse("Cannot register for private events (Ujian Akhir)", 403);
         default:
            // Log the unhandled SQL State for debugging
            console.warn(`Unhandled SQL State: ${error.sqlState}`);
      }
   }

   // Handle common standard MySQL errors potentially
   if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse("Duplicate entry found", 409);
   }

   return errorResponse("Internal Server Error", 500);
}
