"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
    id: number;
    title: string;
}

interface Candidate {
    id: number;
    job_id: number;
    name: string;
    email: string;
    status: string;
    overall_score: number;
    created_at: string;
}

export default function ResumeUploadPage() {
    const [files, setFiles] = useState<{ file: File, status: string, progress: number }[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isCandidatesLoading, setIsCandidatesLoading] = useState(true);
    const [previewCandidateId, setPreviewCandidateId] = useState<number | null>(null);
    const router = useRouter();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchCandidates = useCallback(async () => {
        setIsCandidatesLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/resumes/candidates`);
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            }
        } catch (error) {
            console.error("Failed to fetch candidates:", error);
        } finally {
            setIsCandidatesLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/jobs/`);
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data);
                    if (data.length > 0) {
                        setSelectedJobId(data[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            }
        };
        fetchJobs();
        fetchCandidates();
    }, [apiUrl, fetchCandidates]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!selectedJobId) {
            alert("Please select a job first.");
            return;
        }

        const newFiles = acceptedFiles.map(file => ({ file, status: 'parsing', progress: 10 }));
        setFiles(prev => [...prev, ...newFiles]);

        for (const fileObj of newFiles) {
            const formData = new FormData();
            formData.append("file", fileObj.file);
            formData.append("job_id", selectedJobId.toString());

            try {
                setFiles(prev => prev.map(f =>
                    f.file.name === fileObj.file.name ? { ...f, progress: 50, status: 'scoring' } : f
                ));

                const response = await fetch(`${apiUrl}/api/resumes/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    setFiles(prev => prev.map(f =>
                        f.file.name === fileObj.file.name ? { ...f, progress: 100, status: 'completed' } : f
                    ));
                    fetchCandidates();
                } else {
                    console.error("Upload failed", await response.text());
                    setFiles(prev => prev.map(f =>
                        f.file.name === fileObj.file.name ? { ...f, progress: 0, status: 'error' } : f
                    ));
                }
            } catch (error) {
                console.error("Upload error:", error);
                setFiles(prev => prev.map(f =>
                    f.file.name === fileObj.file.name ? { ...f, progress: 0, status: 'error' } : f
                ));
            }
        }
    }, [selectedJobId, apiUrl, fetchCandidates]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    const getScoreColor = (score: number) => {
        if (score > 80) return "text-emerald-600";
        if (score > 60) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBarColor = (score: number) => {
        if (score > 80) return "bg-emerald-500";
        if (score > 60) return "bg-amber-500";
        return "bg-red-500";
    };

    const previewUrl = previewCandidateId
        ? `${apiUrl}/api/resumes/download/${previewCandidateId}`
        : null;

    const previewCandidate = candidates.find(c => c.id === previewCandidateId);

    return (
        <div className="container mx-auto py-10 max-w-5xl space-y-8">
            {/* Upload Card */}
            <Card className="border-0 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Upload Resumes</CardTitle>
                    <CardDescription>
                        Drag and drop candidate resumes (PDF, DOCX) to have the AI analyze and score them automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    {/* Job Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Job for these Resumes</label>
                        <select
                            className="w-full p-2 border rounded-md bg-transparent"
                            value={selectedJobId || ""}
                            onChange={(e) => setSelectedJobId(Number(e.target.value))}
                            disabled={jobs.length === 0}
                        >
                            <option value="" disabled>Select a job...</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                        {jobs.length === 0 && (
                            <p className="text-sm text-red-500 flex items-center gap-2">
                                No jobs found.
                                <Link href="/jobs/create" className="text-blue-600 hover:underline">
                                    Click here to create a new job.
                                </Link>
                            </p>
                        )}
                    </div>

                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200 ease-in-out ${jobs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                            }`}
                    >
                        <input {...getInputProps()} disabled={jobs.length === 0} />
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <UploadCloud className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-medium text-slate-700">
                                    {isDragActive ? "Drop the files here" : "Drag & drop files here, or click to select files"}
                                </p>
                                <p className="text-sm text-slate-500">
                                    Supports PDF and DOCX files
                                </p>
                            </div>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-medium">Upload Status</h3>
                            <div className="space-y-3">
                                {files.map((fileObj, idx) => (
                                    <div key={idx} className="flex items-center p-4 border rounded-lg bg-white shadow-sm">
                                        <div className="mr-4 text-slate-400">
                                            <FileText className="w-8 h-8" />
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between">
                                                <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-md">
                                                    {fileObj.file.name}
                                                </p>
                                                <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                                    {fileObj.status === 'completed' && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Done</span>}
                                                    {fileObj.status === 'error' && <span className="text-red-500 flex items-center gap-1"><XCircle className="w-4 h-4" /> Failed</span>}
                                                    {['pending', 'parsing', 'scoring'].includes(fileObj.status) && (
                                                        <span className="text-blue-500 flex items-center gap-1 capitalize">
                                                            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Progress value={fileObj.progress} className="h-2 flex-1" />
                                                <span className="text-xs text-slate-500 w-8 text-right">{fileObj.progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>

            {/* Uploaded Resumes Table */}
            <Card className="border-0 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Uploaded Resumes</CardTitle>
                            <CardDescription>All resumes that have been uploaded and analyzed.</CardDescription>
                        </div>
                        <span className="text-sm text-slate-500">{candidates.length} total</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Match Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Uploaded</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isCandidatesLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                                    </TableCell>
                                </TableRow>
                            ) : candidates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No resumes uploaded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                candidates.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">{c.email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${getScoreColor(c.overall_score)}`}>
                                                    {c.overall_score}%
                                                </span>
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getScoreBarColor(c.overall_score)}`}
                                                        style={{ width: `${c.overall_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    c.status === 'Shortlisted' ? 'default' :
                                                    c.status === 'Pending' ? 'secondary' : 'destructive'
                                                }
                                            >
                                                {c.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(c.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPreviewCandidateId(c.id)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Preview
                                                </Button>
                                                <Link href={`/candidates/${c.id}`}>
                                                    <Button variant="ghost" size="sm">Profile</Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
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
