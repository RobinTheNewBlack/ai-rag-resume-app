"use client";

import { useEffect, useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, FileText, Download, Check, X, AlertCircle, Loader2, MapPin, Linkedin, Award, GraduationCap, Languages } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface EducationItem {
    degree: string;
    field_of_study?: string;
    institution: string;
    year?: string;
    gpa?: string;
}

interface ExperienceItem {
    position: string;
    company: string;
    start_date?: string;
    end_date?: string;
    duration?: string;
    description?: string;
    technologies: string[];
}

interface ExtractedData {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    summary?: string;
    skills: string[];
    experience: ExperienceItem[];
    education: EducationItem[];
    certifications: string[];
    languages: string[];
}

interface CandidateDetails {
    id: number;
    job_id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    summary: string;
    extracted_data: ExtractedData | null;
    score: {
        skill_score: number;
        experience_score: number;
        education_score: number;
        design_score: number;
        overall_score: number;
        reasoning: any;
    } | null;
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const candidateId = resolvedParams.id;
    const [candidateData, setCandidateData] = useState<CandidateDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (status: "Shortlisted" | "Rejected") => {
        if (!candidateData || isUpdating) return;
        setIsUpdating(true);
        try {
                const response = await fetch(`/api/resumes/candidates/${candidateId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                setCandidateData(prev => prev ? { ...prev, status } : prev);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const response = await fetch(`/api/resumes/candidates/${candidateId}`);
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
    const extracted = candidateData.extracted_data;
    const skills = extracted?.skills || [];
    const experience = extracted?.experience || [];
    const education = extracted?.education || [];
    const certifications = extracted?.certifications || [];
    const languages = extracted?.languages || [];

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

                            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-600">
                                <Badge variant="default">{candidateData.status}</Badge>
                                {candidateData.email && <span>{candidateData.email}</span>}
                                {candidateData.phone && <span>{candidateData.phone}</span>}
                                {extracted?.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {extracted.location}
                                    </span>
                                )}
                                {extracted?.linkedin && (
                                    <a href={extracted.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                        <Linkedin className="w-3.5 h-3.5" />
                                        LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleStatusUpdate("Rejected")}
                                disabled={isUpdating || candidateData.status === "Rejected"}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                    ${candidateData.status === "Rejected"
                                        ? "bg-rose-50 border-rose-200 text-rose-600"
                                        : "border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
                                    }`}
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Reject
                            </button>
                            <button
                                onClick={() => handleStatusUpdate("Shortlisted")}
                                disabled={isUpdating || candidateData.status === "Shortlisted"}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                    ${candidateData.status === "Shortlisted"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                    }`}
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Shortlist
                            </button>
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

                                        {/* Design Score */}
                                        <div className="space-y-2 pt-4">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span>Design & Layout Match</span>
                                                <span>{candidateData.score.design_score}%</span>
                                            </div>
                                            <Progress value={candidateData.score.design_score} className={`h-2 ${getProgressColor(candidateData.score.design_score)}`} />
                                        </div>

                                        {candidateData.score.reasoning && (
                                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border text-sm text-slate-600 space-y-3">
                                                {candidateData.score.reasoning.skill_evaluation?.reason && (
                                                    <div><strong>Skills Match:</strong> {candidateData.score.reasoning.skill_evaluation.reason}</div>
                                                )}
                                                {candidateData.score.reasoning.experience_evaluation?.reason && (
                                                    <div><strong>Experience Match:</strong> {candidateData.score.reasoning.experience_evaluation.reason}</div>
                                                )}
                                                {candidateData.score.reasoning.education_evaluation?.reason && (
                                                    <div><strong>Education Match:</strong> {candidateData.score.reasoning.education_evaluation.reason}</div>
                                                )}
                                                {candidateData.score.reasoning.design_evaluation?.reason && (
                                                    <div><strong>Design Match:</strong> {candidateData.score.reasoning.design_evaluation.reason}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="details" className="space-y-8 mt-0">

                                {/* Professional Summary */}
                                {extracted?.summary && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Professional Summary</h3>
                                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                                            {extracted.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.length > 0 ? skills.map(skill => (
                                            <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">{skill}</Badge>
                                        )) : <span className="text-muted-foreground text-sm">No skills extracted</span>}
                                    </div>
                                </div>

                                {/* Work Experience */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
                                    <div className="space-y-5 border-l-2 border-slate-200 pl-4 ml-2">
                                        {experience.length > 0 ? experience.map((exp, idx) => (
                                            <div key={idx} className="relative">
                                                <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[23px] top-1.5 border-2 border-white ring-1 ring-slate-200" />
                                                <h4 className="font-semibold text-slate-900">{exp.position}</h4>
                                                <p className="text-slate-600 text-sm">{exp.company}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {exp.start_date && exp.end_date
                                                        ? `${exp.start_date} — ${exp.end_date}`
                                                        : exp.duration || ""}
                                                </p>
                                                {exp.description && (
                                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                                                )}
                                                {exp.technologies.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {exp.technologies.map(tech => (
                                                            <Badge key={tech} variant="outline" className="text-xs px-2 py-0.5 font-normal">{tech}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )) : <span className="text-muted-foreground text-sm">No experience extracted</span>}
                                    </div>
                                </div>

                                {/* Education */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-slate-500" /> Education
                                    </h3>
                                    <div className="space-y-4">
                                        {education.length > 0 ? education.map((edu, idx) => (
                                            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                                                <p className="font-semibold text-slate-900">{edu.degree}{edu.field_of_study ? ` — ${edu.field_of_study}` : ""}</p>
                                                <p className="text-slate-600 text-sm mt-0.5">{edu.institution}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    {edu.year && <span>{edu.year}</span>}
                                                    {edu.gpa && <span className="text-emerald-600 font-medium">GPA: {edu.gpa}</span>}
                                                </div>
                                            </div>
                                        )) : <span className="text-muted-foreground text-sm">No education extracted</span>}
                                    </div>
                                </div>

                                {/* Certifications */}
                                {certifications.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-slate-500" /> Certifications
                                        </h3>
                                        <ul className="space-y-2">
                                            {certifications.map((cert, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                    {cert}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Languages */}
                                {languages.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Languages className="w-5 h-5 text-slate-500" /> Languages
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {languages.map(lang => (
                                                <Badge key={lang} variant="outline" className="px-3 py-1 text-sm">{lang}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                    <a href={`/api/resumes/download/${candidateId}`} download>
                        <Button variant="ghost" size="sm" className="h-8 shadow-none">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                    </a>
                </div>

                <div className="flex-1 w-full h-full bg-slate-100 overflow-hidden">
                    <iframe
                        src={`/api/resumes/download/${candidateId}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        className="w-full h-full border-0"
                        title="Resume PDF Viewer"
                    />
                </div>
            </div>

        </div>
    );
}
