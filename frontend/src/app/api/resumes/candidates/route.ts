import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("job_id");
    const url = jobId
        ? `${process.env.BACKEND_URL}/api/resumes/candidates?job_id=${jobId}`
        : `${process.env.BACKEND_URL}/api/resumes/candidates`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
