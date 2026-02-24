"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function CreateJobPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [skillWeight, setSkillWeight] = useState([45]);
    const [experienceWeight, setExperienceWeight] = useState([30]);
    const [educationWeight, setEducationWeight] = useState([15]);
    const [designWeight, setDesignWeight] = useState([10]);
    const [isLoading, setIsLoading] = useState(false);

    const totalWeight = skillWeight[0] + experienceWeight[0] + educationWeight[0] + designWeight[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (totalWeight !== 100) {
            alert("Total weight must equal 100%");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/jobs/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    requirements,
                    skill_weight: skillWeight[0],
                    experience_weight: experienceWeight[0],
                    education_weight: educationWeight[0],
                    design_weight: designWeight[0]
                }),
            });

            if (response.ok) {
                alert("Job created successfully!");
                // Clear form
                setTitle("");
                setDescription("");
                setRequirements("");
                setSkillWeight([45]);
                setExperienceWeight([30]);
                setEducationWeight([15]);
                setDesignWeight([10]);
            } else {
                const errorData = await response.json();
                alert(`Error creating job: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error creating job:", error);
            alert("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <Card className="border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Create New Position</CardTitle>
                    <CardDescription>
                        Define the job requirements and scoring criteria for the AI screen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Job Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the role and responsibilities..."
                                    className="min-h-[100px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requirements">Requirements</Label>
                                <Textarea
                                    id="requirements"
                                    placeholder="List specific technical skills, years of experience, or degree requirements..."
                                    className="min-h-[120px]"
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t">
                            <div>
                                <h3 className="text-lg font-medium leading-none mb-2">Scoring Weights</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    Set how the AI should weight each factor. Total must be 100% (Currently {totalWeight}%).
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-normal">Skills Match</Label>
                                        <span className="font-medium text-blue-600">{skillWeight[0]}%</span>
                                    </div>
                                    <Slider
                                        value={skillWeight}
                                        onValueChange={setSkillWeight}
                                        max={100}
                                        step={5}
                                        className="py-2"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-normal">Experience</Label>
                                        <span className="font-medium text-emerald-600">{experienceWeight[0]}%</span>
                                    </div>
                                    <Slider
                                        value={experienceWeight}
                                        onValueChange={setExperienceWeight}
                                        max={100}
                                        step={5}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-normal">Education</Label>
                                        <span className="font-medium text-purple-600">{educationWeight[0]}%</span>
                                    </div>
                                    <Slider
                                        value={educationWeight}
                                        onValueChange={setEducationWeight}
                                        max={100}
                                        step={5}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-normal">Resume Design</Label>
                                        <span className="font-medium text-orange-500">{designWeight[0]}%</span>
                                    </div>
                                    <Slider
                                        value={designWeight}
                                        onValueChange={setDesignWeight}
                                        max={100}
                                        step={5}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-medium tracking-wide">
                            Generate Job Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
