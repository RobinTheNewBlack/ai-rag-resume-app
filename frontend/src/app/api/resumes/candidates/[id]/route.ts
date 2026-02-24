import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await fetch(`${process.env.BACKEND_URL}/api/resumes/candidates/${id}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await fetch(`${process.env.BACKEND_URL}/api/resumes/candidates/${id}`, { method: "DELETE" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
