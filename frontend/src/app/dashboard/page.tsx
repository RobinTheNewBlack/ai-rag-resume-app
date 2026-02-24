"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Candidate {
    id: number;
    job_id: number;
    name: string;
    email: string;
    status: string;
    summary: string;
    overall_score: number;
    created_at: string;
}

export default function DashboardPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                // Fetch from the Backend API URL
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await fetch(`${apiUrl}/api/resumes/candidates`);
                if (response.ok) {
                    const data = await response.json();
                    setCandidates(data);
                } else {
                    console.error("Failed to fetch candidates");
                }
            } catch (error) {
                console.error("Error fetching candidates:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    // Helper to format date relative or short
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Review and rank candidates based on AI evaluation.</p>
                </div>
                <div className="flex gap-4">
                    <Input placeholder="Search candidates..." className="w-64" />
                    <Button variant="outline">Filter</Button>
                    <Link href="/candidates/upload">
                        <Button>Upload Resumes</Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate Name</TableHead>
                            <TableHead>Match Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Analyzed</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading candidates...</TableCell>
                            </TableRow>
                        ) : candidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No candidates found.</TableCell>
                            </TableRow>
                        ) : candidates.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">
                                    {c.name}
                                    <div className="text-xs text-muted-foreground">{c.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{c.overall_score}%</span>
                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${c.overall_score > 80 ? 'bg-emerald-500' : c.overall_score > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${c.overall_score}%` }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={c.status === 'Shortlisted' ? 'default' : c.status === 'Pending' ? 'secondary' : 'destructive'}>
                                        {c.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/candidates/${c.id}`}>
                                        <Button variant="ghost" size="sm">View Profile</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
