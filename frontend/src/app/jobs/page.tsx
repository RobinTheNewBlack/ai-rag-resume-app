"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
import Link from "next/link";
import { Plus, Briefcase, Pencil, Trash2, Eye, Users } from "lucide-react";

interface Job {
    id: number;
    title: string;
    description: string;
    requirements: string | null;
    skill_weight: number;
    experience_weight: number;
    education_weight: number;
    design_weight: number;
    created_at?: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    // Edit state
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editRequirements, setEditRequirements] = useState("");
    const [editSkillWeight, setEditSkillWeight] = useState([45]);
    const [editExperienceWeight, setEditExperienceWeight] = useState([30]);
    const [editEducationWeight, setEditEducationWeight] = useState([15]);
    const [editDesignWeight, setEditDesignWeight] = useState([10]);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteJob, setDeleteJob] = useState<Job | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const totalEditWeight = editSkillWeight[0] + editExperienceWeight[0] + editEducationWeight[0] + editDesignWeight[0];

    useEffect(() => {
        const fetchJobs = async () => {
            try {
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
    }, [apiUrl]);

    const openEditDialog = (job: Job) => {
        setEditingJob(job);
        setEditTitle(job.title);
        setEditDescription(job.description);
        setEditRequirements(job.requirements ?? "");
        setEditSkillWeight([job.skill_weight]);
        setEditExperienceWeight([job.experience_weight]);
        setEditEducationWeight([job.education_weight]);
        setEditDesignWeight([job.design_weight ?? 0]);
    };

    const handleSave = async () => {
        if (!editingJob) return;
        if (totalEditWeight !== 100) {
            alert("Total weight must equal 100%");
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch(`${apiUrl}/api/jobs/${editingJob.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    requirements: editRequirements || null,
                    skill_weight: editSkillWeight[0],
                    experience_weight: editExperienceWeight[0],
                    education_weight: editEducationWeight[0],
                    design_weight: editDesignWeight[0],
                }),
            });
            if (response.ok) {
                const updated = await response.json();
                setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
                setEditingJob(null);
            } else {
                alert("Failed to update job.");
            }
        } catch (error) {
            console.error("Error updating job:", error);
            alert("Failed to connect to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteJob) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`${apiUrl}/api/jobs/${deleteJob.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setJobs(prev => prev.filter(j => j.id !== deleteJob.id));
                setDeleteJob(null);
            } else {
                alert("Failed to delete job.");
            }
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to connect to the server.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Jobs</h1>
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
                            <TableHead className="w-12">ID</TableHead>
                            <TableHead className="w-48">Job Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Requirements</TableHead>
                            <TableHead className="w-56">Weights (Sk/Ex/Ed/De)</TableHead>
                            <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading jobs...</TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No jobs found. Create one to get started.</TableCell>
                            </TableRow>
                        ) : jobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium text-slate-500">#{job.id}</TableCell>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell className="max-w-sm">
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{job.description}</p>
                                </TableCell>
                                <TableCell className="max-w-sm">
                                    {job.requirements ? (
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{job.requirements}</p>
                                    ) : (
                                        <span className="text-xs text-slate-400">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">Sk: {job.skill_weight}%</span>
                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Ex: {job.experience_weight}%</span>
                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">Ed: {job.education_weight}%</span>
                                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">De: {job.design_weight ?? 0}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-1">
                                        <Button variant="outline" size="icon" title="Details" onClick={() => setSelectedJob(job)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" title="Edit" onClick={() => openEditDialog(job)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Link href={`/dashboard?job_id=${job.id}`}>
                                            <Button variant="outline" size="icon" title="View Candidates">
                                                <Users className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            title="Delete"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setDeleteJob(job)}
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

            {/* Job Detail Dialog */}
            <Dialog open={selectedJob !== null} onOpenChange={(open) => !open && setSelectedJob(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Briefcase className="w-5 h-5 text-primary" />
                            {selectedJob?.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 mt-2">
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded border border-blue-100 text-sm">Skill: {selectedJob?.skill_weight}%</span>
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded border border-emerald-100 text-sm">Experience: {selectedJob?.experience_weight}%</span>
                            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded border border-purple-100 text-sm">Education: {selectedJob?.education_weight}%</span>
                            <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded border border-orange-100 text-sm">Design: {selectedJob?.design_weight ?? 0}%</span>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Description</h3>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedJob?.description}</p>
                        </div>

                        {selectedJob?.requirements && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Requirements</h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Link href={`/dashboard?job_id=${selectedJob?.id}`}>
                                <Button>View Candidates</Button>
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Job Confirmation Dialog */}
            <Dialog open={deleteJob !== null} onOpenChange={(open) => !open && setDeleteJob(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Delete Job
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <p className="text-slate-600">
                            Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteJob?.title}</span>?
                        </p>
                        <p className="text-sm text-slate-500 bg-slate-50 border rounded-md p-3">
                            This will permanently delete the job and all associated candidates, resumes, and AI analysis data. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setDeleteJob(null)} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Job Dialog */}
            <Dialog open={editingJob !== null} onOpenChange={(open) => !open && setEditingJob(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Pencil className="w-5 h-5 text-primary" />
                            Edit Job
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 mt-2">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Job Title</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                className="min-h-[100px]"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-requirements">Requirements</Label>
                            <Textarea
                                id="edit-requirements"
                                className="min-h-[100px]"
                                value={editRequirements}
                                onChange={(e) => setEditRequirements(e.target.value)}
                            />
                        </div>

                        {/* Weights */}
                        <div className="space-y-4 pt-2 border-t">
                            <div>
                                <h3 className="text-base font-medium">Scoring Weights</h3>
                                <p className={`text-sm mt-1 ${totalEditWeight === 100 ? "text-slate-500" : "text-red-500 font-medium"}`}>
                                    Total: {totalEditWeight}% {totalEditWeight !== 100 && "(must equal 100%)"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <Label>Skills Match</Label>
                                    <span className="font-medium text-blue-600">{editSkillWeight[0]}%</span>
                                </div>
                                <Slider value={editSkillWeight} onValueChange={setEditSkillWeight} max={100} step={5} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <Label>Experience</Label>
                                    <span className="font-medium text-emerald-600">{editExperienceWeight[0]}%</span>
                                </div>
                                <Slider value={editExperienceWeight} onValueChange={setEditExperienceWeight} max={100} step={5} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <Label>Education</Label>
                                    <span className="font-medium text-purple-600">{editEducationWeight[0]}%</span>
                                </div>
                                <Slider value={editEducationWeight} onValueChange={setEditEducationWeight} max={100} step={5} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <Label>Resume Design</Label>
                                    <span className="font-medium text-orange-500">{editDesignWeight[0]}%</span>
                                </div>
                                <Slider value={editDesignWeight} onValueChange={setEditDesignWeight} max={100} step={5} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving || totalEditWeight !== 100}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
