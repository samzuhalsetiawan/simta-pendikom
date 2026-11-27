import { NextRequest, NextResponse } from "next/server"
import { getLecturerStudentDetail } from "@/lib/dal/lecturer"

export async function GET(request: NextRequest) {
    const thesisId = request.nextUrl.searchParams.get('thesisId')
    if (!thesisId) {
        return NextResponse.json(null, { status: 400 })
    }

    const data = await getLecturerStudentDetail(thesisId)
    return NextResponse.json(data)
}
