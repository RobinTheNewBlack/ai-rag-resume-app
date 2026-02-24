import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await fetch(`${process.env.BACKEND_URL}/api/resumes/download/${id}`);

    if (!res.ok) {
        return NextResponse.json({ error: "File not found" }, { status: res.status });
    }

    const contentType = res.headers.get("Content-Type") ?? "application/pdf";
    const contentDisposition = res.headers.get("Content-Disposition") ?? "";

    return new NextResponse(res.body, {
        status: res.status,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": contentDisposition,
        },
    });
}
