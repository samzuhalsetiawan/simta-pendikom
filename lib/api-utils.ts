import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200) {
   return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500) {
   return NextResponse.json({ success: false, error: message }, { status });
}

export function handleError(error: any) {
   console.error("Database Error:", error);

   // 1. Tangani Error Berdasarkan SQL State (Custom Signal dari Database)
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
            console.warn(`Unhandled SQL State: ${error.sqlState}`);
      }
   }

   // 2. Tangani Error MySQL Common Codes
   if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse("Duplicate entry found", 409);
   }
   
   if (error.code === 'ECONNREFUSED') {
      return errorResponse("Database connection refused. Please check if MySQL is running.", 503);
   }

   // 3. Tangani Error Parsing JSON (Khusus untuk pendekatan JSON_ARRAYAGG/OBJECT)
   // Ini sering terjadi jika kolom JSON di database berisi data yang tidak valid
   if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return errorResponse("Data format error: Invalid JSON structure from database", 500);
   }

   // 4. Tangani Parameter ID yang tidak valid (Bukan angka saat query ke /api/thesis/[id])
   if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_PARSE_ERROR') {
      return errorResponse("Invalid request parameter or query syntax", 400);
   }

   return errorResponse("Internal Server Error", 500);
}