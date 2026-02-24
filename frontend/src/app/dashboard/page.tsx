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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, FileText, Trash2, ChevronDown, X, UserRound } from "lucide-react";
import Link from "next/link";

interface Candidate {
    id: number;
    job_id: number;
    job_title: string;
    name: string;
    email: string;
    status: string;
    summary: string;
    overall_score: number;
    created_at: string;
}

export default function DashboardPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<{ id: number; title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewCandidateId, setPreviewCandidateId] = useState<number | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [candidatesRes, jobsRes] = await Promise.all([
                    fetch(`/api/resumes/candidates`),
                    fetch(`/api/jobs/`),
                ]);
                if (candidatesRes.ok) setCandidates(await candidatesRes.json());
                if (jobsRes.ok) setJobs(await jobsRes.json());
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    const handleDelete = async () => {
        if (!deleteCandidate) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/resumes/candidates/${deleteCandidate.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setCandidates(prev => prev.filter(c => c.id !== deleteCandidate.id));
                setDeleteCandidate(null);
            } else {
                alert("Failed to delete candidate.");
            }
        } catch (error) {
            console.error("Error deleting candidate:", error);
            alert("Failed to connect to the server.");
        } finally {
            setIsDeleting(false);
        }
    };

    const previewCandidate = candidates.find(c => c.id === previewCandidateId);

    const uniqueRoles = jobs.map(j => j.title).sort();
    const statuses = ["Shortlisted", "Pending", "Rejected"];

    const filtered = candidates.filter(c => {
        const matchSearch = search === "" ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "" || c.job_title === roleFilter;
        const matchStatus = statusFilter === "" || c.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const hasActiveFilter = search !== "" || roleFilter !== "" || statusFilter !== "";
    const clearFilters = () => { setSearch(""); setRoleFilter(""); setStatusFilter(""); };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Candidate Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Review and rank candidates based on AI evaluation.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search by name or email..."
                        className="w-56"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    {/* Role filter */}
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="appearance-none h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        >
                            <option value="">All Roles</option>
                            {uniqueRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    {hasActiveFilter && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1">
                            <X className="w-4 h-4" /> Clear
                        </Button>
                    )}

                    <Link href="/candidates/upload">
                        <Button>Upload Resumes</Button>
                    </Link>
                </div>
            </div>

            {!isLoading && (
                <p className="text-sm text-muted-foreground mb-3">
                    Showing {filtered.length} of {candidates.length} candidates
                </p>
            )}

            <div className="border rounded-md">
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48">Candidate Name</TableHead>
                            <TableHead className="w-44">Applied Role</TableHead>
                            <TableHead className="w-44">Match Score</TableHead>
                            <TableHead className="w-28">Status</TableHead>
                            <TableHead className="w-32">Date Analyzed</TableHead>
                            <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading candidates...</TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {candidates.length === 0 ? "No candidates found." : "No candidates match the selected filters."}
                                </TableCell>
                            </TableRow>
                        ) : filtered.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">
                                    {c.name}
                                    <div className="text-xs text-muted-foreground">{c.email}</div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">{c.job_title}</TableCell>
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
                                <TableCell>
                                    <div className="flex justify-left gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            title="Preview Resume"
                                            onClick={() => setPreviewCandidateId(c.id)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Link href={`/candidates/${c.id}`}>
                                            <Button variant="outline" size="icon" title="View Profile">
                                                <UserRound className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            title="Delete"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setDeleteCandidate(c)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteCandidate !== null} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Delete Candidate
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <p className="text-slate-600">
                            Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteCandidate?.name}</span>?
                        </p>
                        <p className="text-sm text-slate-500 bg-slate-50 border rounded-md p-3">
                            This will permanently delete the candidate record, their resume PDF file, and all associated AI analysis data. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setDeleteCandidate(null)} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* PDF Preview Dialog */}
            <Dialog open={previewCandidateId !== null} onOpenChange={(open) => !open && setPreviewCandidateId(null)}>
                <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {previewCandidate?.name ?? "Resume Preview"}
                            {previewCandidate && (
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                    — {previewCandidate.email}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        {previewCandidateId && (
                            <iframe
                                src={`/api/resumes/download/${previewCandidateId}`}
                                className="w-full h-full"
                                title="Resume Preview"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
