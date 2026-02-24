import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const res = await fetch(`${process.env.BACKEND_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await fetch(`${process.env.BACKEND_URL}/api/jobs/${id}`, { method: "DELETE" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
