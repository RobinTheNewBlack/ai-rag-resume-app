import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const res = await fetch(`${process.env.BACKEND_URL}/api/resumes/upload`, {
        method: "POST",
        body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
