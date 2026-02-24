"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Job {
    id: number;
    title: string;
    description: string;
    skill_weight: number;
    experience_weight: number;
    education_weight: number;
    created_at?: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await fetch(`${apiUrl}/api/jobs/`);
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data);
                } else {
                    console.error("Failed to fetch jobs");
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
                    <p className="text-muted-foreground mt-1">Manage your job postings and their scoring criteria.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/jobs/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create New Job
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">ID</TableHead>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Weights (Skill/Exp/Edu)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">Loading jobs...</TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No jobs found. Create one to get started.</TableCell>
                            </TableRow>
                        ) : jobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium text-slate-500">#{job.id}</TableCell>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2 text-sm text-slate-600">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded border">
                                            Sk: {job.skill_weight}%
                                        </span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded border">
                                            Ex: {job.experience_weight}%
                                        </span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded border">
                                            Ed: {job.education_weight}%
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/dashboard?job_id=${job.id}`}>
                                        <Button variant="ghost" size="sm">View Candidates</Button>
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
