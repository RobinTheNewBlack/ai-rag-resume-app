import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const res = await fetch(`${process.env.BACKEND_URL}/api/resumes/candidates/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
