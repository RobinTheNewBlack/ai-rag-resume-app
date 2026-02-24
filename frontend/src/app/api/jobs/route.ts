import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const res = await fetch(`${process.env.BACKEND_URL}/api/jobs/`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const res = await fetch(`${process.env.BACKEND_URL}/api/jobs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
