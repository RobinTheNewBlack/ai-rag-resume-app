"use client";

import { useEffect, useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, FileText, Download, Check, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface CandidateDetails {
    id: number;
    job_id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    summary: string;
    extracted_data: {
        skills: string[];
        experience: { role: string; company: string; duration: string }[];
    } | null;
    score: {
        skill_score: number;
        experience_score: number;
        education_score: number;
        overall_score: number;
        reasoning: any;
    } | null;
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const candidateId = resolvedParams.id;
    const [candidateData, setCandidateData] = useState<CandidateDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await fetch(`${apiUrl}/api/resumes/candidates/${candidateId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCandidateData(data);
                } else {
                    console.error("Failed to fetch candidate details");
                }
            } catch (error) {
                console.error("Error fetching candidate:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidate();
    }, [candidateId]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50">Loading profile...</div>;
    }

    if (!candidateData) {
        return <div className="flex h-screen items-center justify-center bg-slate-50">Candidate not found</div>;
    }

    const overallScore = candidateData.score?.overall_score || 0;
    const skills = candidateData.extracted_data?.skills || [];
    const experience = candidateData.extracted_data?.experience || [];

    const getScoreStyle = (score: number) => {
        if (score > 80) return { stroke: '#34d399', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', label: 'Strong Match' };
        if (score > 65) return { stroke: '#fbbf24', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', label: 'Good Match' };
        if (score > 40) return { stroke: '#fb923c', badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200', label: 'Weak Match' };
        return { stroke: '#fb7185', badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200', label: 'Poor Match' };
    };
    const scoreStyle = getScoreStyle(overallScore);
    const circumference = 2 * Math.PI * 36;

    const getProgressColor = (score: number) => {
        if (score > 80) return "bg-emerald-100 [&_[data-slot=progress-indicator]]:bg-emerald-400";
        if (score > 65) return "bg-amber-100 [&_[data-slot=progress-indicator]]:bg-amber-400";
        if (score > 40) return "bg-orange-100 [&_[data-slot=progress-indicator]]:bg-orange-400";
        return "bg-rose-100 [&_[data-slot=progress-indicator]]:bg-rose-400";
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Left Panel: AI Extraction & Scoring */}
            <div className="w-1/2 flex flex-col h-full border-r bg-white shadow-xl z-10">

                {/* Header */}
                <div className="p-6 border-b shrink-0">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{candidateData.name}</h1>
                            <p className="text-lg text-slate-500 mt-1">Applied Job ID: {candidateData.job_id}</p>

                            <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1"><Badge variant="default">{candidateData.status}</Badge></span>
                                <span>{candidateData.email}</span>
                                <span>{candidateData.phone}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><X className="w-4 h-4 mr-2" /> Reject</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="w-4 h-4 mr-2" /> Shortlist</Button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 h-full">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="inline-flex bg-slate-100 rounded-xl p-1 gap-1 mb-6 h-auto">
                                <TabsTrigger value="overview" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold">Overview & Scoring</TabsTrigger>
                                <TabsTrigger value="details" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold">Extracted Details</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 mt-0">
                                {/* Overall Score Card */}
                                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-8 flex flex-row items-center justify-between">
                                    {/* Labels */}
                                    <div className="flex-1">
                                        <p className="text-3xl font-bold text-slate-800 mb-2">{scoreStyle.label}</p>
                                        <p className="text-slate-400 text-base mb-5">Based on skills, experience & education</p>
                                        <span className={`inline-flex items-center px-5 py-2 rounded-full text-base font-semibold ${scoreStyle.badge}`}>
                                            {overallScore > 80 ? 'Recommended to shortlist' : overallScore > 65 ? 'Worth a closer look' : overallScore > 40 ? 'May not meet requirements' : 'Does not meet requirements'}
                                        </span>
                                    </div>

                                    {/* Donut ring */}
                                    <div className="relative flex-shrink-0 w-56 h-56">
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="7" />
                                            <circle
                                                cx="50" cy="50" r="38" fill="none"
                                                stroke={scoreStyle.stroke}
                                                strokeWidth="7"
                                                strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={circumference * (1 - overallScore / 100)}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-6xl font-bold text-slate-800 leading-none">{overallScore}</span>
                                            <span className="text-sm text-slate-400 mt-1">/ 100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-primary" /> AI Summary
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 italic">
                                        {candidateData.summary ? `"${candidateData.summary}"` : "No summary available."}
                                    </p>
                                </div>

                                {/* Detailed Scores */}
                                {candidateData.score && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>

                                        {/* Skill Score */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span>Skills Match</span>
                                                <span>{candidateData.score.skill_score}%</span>
                                            </div>
                                            <Progress value={candidateData.score.skill_score} className={`h-2 ${getProgressColor(candidateData.score.skill_score)}`} />
                                        </div>

                                        {/* Experience Score */}
                                        <div className="space-y-2 pt-4">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span>Experience Match</span>
                                                <span>{candidateData.score.experience_score}%</span>
                                            </div>
                                            <Progress value={candidateData.score.experience_score} className={`h-2 ${getProgressColor(candidateData.score.experience_score)}`} />
                                        </div>

                                        {/* Education Score */}
                                        <div className="space-y-2 pt-4">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span>Education Match</span>
                                                <span>{candidateData.score.education_score}%</span>
                                            </div>
                                            <Progress value={candidateData.score.education_score} className={`h-2 ${getProgressColor(candidateData.score.education_score)}`} />
                                        </div>

                                        {candidateData.score.reasoning && (
                                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border text-sm text-slate-600 space-y-3">
                                                {candidateData.score.reasoning.skill_evaluation?.reason && (
                                                    <div><strong>Skills Reasoning:</strong> {candidateData.score.reasoning.skill_evaluation.reason}</div>
                                                )}
                                                {candidateData.score.reasoning.experience_evaluation?.reason && (
                                                    <div><strong>Experience Reasoning:</strong> {candidateData.score.reasoning.experience_evaluation.reason}</div>
                                                )}
                                                {candidateData.score.reasoning.education_evaluation?.reason && (
                                                    <div><strong>Education Reasoning:</strong> {candidateData.score.reasoning.education_evaluation.reason}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="details" className="space-y-8 mt-0">
                                {/* Extracted Skills */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Technical Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.length > 0 ? skills.map(skill => (
                                            <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">{skill}</Badge>
                                        )) : <span className="text-muted-foreground">No skills extracted</span>}
                                    </div>
                                </div>

                                {/* Extracted Experience */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
                                    <div className="space-y-6 border-l-2 border-slate-200 pl-4 ml-2">
                                        {experience.length > 0 ? experience.map((exp, idx) => (
                                            <div key={idx} className="relative">
                                                <div className="absolute w-3 h-3 bg-slate-200 rounded-full -left-[23px] top-1.5 border-2 border-white ring-1 ring-slate-200" />
                                                <h4 className="font-medium text-slate-900">{exp.role}</h4>
                                                <p className="text-slate-600">{exp.company}</p>
                                                <p className="text-sm text-slate-400 mt-1">{exp.duration}</p>
                                            </div>
                                        )) : <span className="text-muted-foreground">No experience extracted</span>}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>
            </div>

            {/* Right Panel: PDF Viewer */}
            <div className="w-1/2 h-full bg-slate-200/50 flex flex-col relative">
                <div className="h-14 bg-white border-b px-4 flex items-center justify-between shadow-sm z-10">
                    <h2 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {candidateData.name} - Resume.pdf
                    </h2>
                    <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/resumes/download/${candidateId}`} download>
                        <Button variant="ghost" size="sm" className="h-8 shadow-none">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                    </a>
                </div>

                <div className="flex-1 w-full h-full bg-slate-100 overflow-hidden">
                    <iframe
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/resumes/download/${candidateId}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        className="w-full h-full border-0"
                        title="Resume PDF Viewer"
                    />
                </div>
            </div>

        </div>
    );
}
