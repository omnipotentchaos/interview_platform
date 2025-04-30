"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import toast from "react-hot-toast";
import LoaderUI from "@/components/LoaderUI";
import { getCandidateInfo, groupInterviews, getUserInfo } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INTERVIEW_CATEGORY } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertCircleIcon, 
  CalendarIcon, 
  CheckCircle2Icon, 
  ClockIcon, 
  LinkIcon,
  PlayIcon, 
  CopyIcon,
  XCircleIcon,
  CheckIcon
} from "lucide-react";
import { format, formatDistanceToNow, isBefore } from "date-fns";
import CommentDialog from "@/components/CommentDialog";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Interview = Doc<"interviews"> & {
  candidate?: Doc<"users">;
  interviewers?: Doc<"users">[];
};

function DashboardPage() {
  const { user } = useUser();
  const client = useStreamVideoClient();
  const users = useQuery(api.users.getUsers);
  // Using getAllInterviews which now filters by user permissions
  const interviews = useQuery(api.interviews.getAllInterviews);
  const updateStatus = useMutation(api.interviews.updateInterviewStatus);
  
  // Force refresh every 15 seconds to catch updates
  const [refreshKey, setRefreshKey] = useState(0);
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 15000);  // refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const handleStatusUpdate = async (interviewId: Id<"interviews">, status: string) => {
    try {
      await updateStatus({ id: interviewId, status });
      toast.success(`Interview marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const joinMeeting = async (interview: Interview) => {
    try {
      if (!client) {
        toast.error("Stream client not ready");
        return;
      }

      const call = client.call("default", interview.streamCallId);
      await call.join();

      // Redirect to the meeting page
      window.location.href = `/meeting/${interview.streamCallId}`;
    } catch (error) {
      console.error(error);
      toast.error("Failed to join meeting");
    }
  };

  const getMeetingLink = (streamCallId: string) => {
    return `${window.location.origin}/meeting/${streamCallId}`;
  };

  const copyMeetingLink = (streamCallId: string) => {
    const meetingLink = getMeetingLink(streamCallId);
    navigator.clipboard.writeText(meetingLink)
      .then(() => {
        setCopiedLinks({ ...copiedLinks, [streamCallId]: true });
        toast.success("Meeting link copied to clipboard");
        
        // Reset the copied status after 3 seconds
        setTimeout(() => {
          setCopiedLinks((prev) => ({ ...prev, [streamCallId]: false }));
        }, 3000);
      })
      .catch(() => {
        toast.error("Failed to copy meeting link");
      });
  };

  if (!interviews || !users) return <LoaderUI />;
  
  // Add a check for empty interviews array
  if (interviews.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-xl font-semibold">No interviews found</h2>
          <p className="text-muted-foreground">You might need to log in or schedule interviews.</p>
          <Link href="/schedule">
            <Button>Schedule New Interview</Button>
          </Link>
        </div>
      </div>
    );
  }

  const groupedInterviews = groupInterviews(interviews);

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/schedule">
          <Button>Schedule New Interview</Button>
        </Link>
        
        <Button variant="outline" onClick={() => setRefreshKey(prev => prev + 1)}>
          Refresh
        </Button>
      </div>

      <div className="space-y-8">
        {INTERVIEW_CATEGORY.map(
          (category) =>
            groupedInterviews[category.id]?.length > 0 && (
              <section key={category.id}>
                {/* CATEGORY TITLE */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                  <Badge variant={category.variant}>{groupedInterviews[category.id].length}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedInterviews[category.id].map((interview: Interview) => {
                  // Use the candidate and interviewers from the enhanced interview object
                  const candidate = interview.candidate;
                  const interviewers = interview.interviewers || [];
                  const startTime = new Date(interview.startTime);
                  const actualStartTime = interview.actualStartTime ? new Date(interview.actualStartTime) : null;
                  
                  // Determine if this is the current user's interview (as a candidate)
                  const isCandidate = user?.id === interview.candidateId;
                  const isInterviewer = interview.interviewerIds.includes(user?.id || "");
                  
                  // Check if the meeting has started early (actualStartTime exists and is before the scheduled startTime)
                  const isStartedEarly = interview.isStarted === true && 
                                        actualStartTime && 
                                        isBefore(actualStartTime, startTime);

                  // Calculate time difference if started early
                  const timeDiff = actualStartTime ? 
                    formatDistanceToNow(actualStartTime, { addSuffix: true }) : 
                    '';
                  
                  // Generate meeting link
                  const meetingLink = getMeetingLink(interview.streamCallId);
                  const isCopied = copiedLinks[interview.streamCallId] || false;

                  return (
                    <Card 
                      key={interview._id} 
                      className={`hover:shadow-md transition-all ${isStartedEarly && isCandidate ? 'border-red-400 bg-red-50' : ''}`}
                    >
                      {/* Show alert banner for candidates when meeting started early */}
                      {isStartedEarly && isCandidate && (
                        <div className="bg-red-500 text-white px-4 py-2 font-medium flex items-center">
                          <AlertCircleIcon className="h-5 w-5 mr-2" />
                          Meeting started early! Join now.
                        </div>
                      )}
                      
                      <CardHeader className="p-4">
                        {/* Candidate */}
                        {candidate && (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={candidate.image} />
                              <AvatarFallback>{candidate.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{candidate.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{interview.title}</p>
                            </div>
                          </div>
                        )}

                        {/* Interviewers */}
                        {interviewers.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 ml-14">
                            {interviewers.map((interviewer) => (
                              <div key={interviewer._id} className="flex items-center gap-2 text-sm">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={interviewer.image} />
                                  <AvatarFallback>{interviewer.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{interviewer.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(startTime, "MMM dd")}
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {format(startTime, "hh:mm a")}
                          </div>
                          
                          {/* Show meeting status badge */}
                          {interview.status === "completed" || interview.status === "succeeded" || interview.status === "failed" ? (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto"
                            >
                              Meeting Ended
                            </Badge>
                          ) : interview.isStarted && (
                            <Badge 
                              variant={isStartedEarly ? "destructive" : "success"} 
                              className="ml-auto"
                            >
                              Meeting Started
                            </Badge>
                          )}
                        </div>
                        
                        {/* Show notification if meeting started early */}
                        {isStartedEarly && actualStartTime && (
                          <div className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircleIcon className="h-4 w-4 mr-1" />
                            <span>Started {timeDiff} ({format(actualStartTime, "hh:mm a")})</span>
                          </div>
                        )}
                        
                        {/* Meeting Link Section */}
                        {(interview.isStarted || interview.status === "in-progress") && 
                         !(interview.status === "completed" || interview.status === "succeeded" || interview.status === "failed") && (
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <div className="text-sm font-medium flex items-center">
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Meeting Link:
                            </div>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8"
                                      onClick={() => copyMeetingLink(interview.streamCallId)}
                                    >
                                      {isCopied ? (
                                        <>
                                          <CheckIcon className="h-3.5 w-3.5 mr-1" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <CopyIcon className="h-3.5 w-3.5 mr-1" />
                                          Copy
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy meeting link to share</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8">
                                    <LinkIcon className="h-3.5 w-3.5 mr-1" />
                                    Share
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    window.open(`mailto:?subject=Meeting Link for ${interview.title}&body=Join the meeting using this link: ${meetingLink}`, '_blank');
                                  }}>
                                    Share via Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    window.open(`https://wa.me/?text=Join the meeting using this link: ${meetingLink}`, '_blank');
                                  }}>
                                    Share via WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    copyMeetingLink(interview.streamCallId);
                                  }}>
                                    Copy Link
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                        {/* Show different buttons based on interview status and user role */}
                        {interview.status === "completed" && isInterviewer && (
                          <div className="flex gap-2 w-full">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusUpdate(interview._id, "succeeded")}
                            >
                              <CheckCircle2Icon className="h-4 w-4 mr-2" />
                              Pass
                            </Button>
                            <Button
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              onClick={() => handleStatusUpdate(interview._id, "failed")}
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Fail
                            </Button>
                          </div>
                        )}
                        
                        {/* Join buttons for ongoing meetings */}
                        {(interview.isStarted || interview.status === "in-progress") && 
                         !(interview.status === "completed" || interview.status === "succeeded" || interview.status === "failed") && (
                          <div className="flex gap-2 w-full">
                            <Button 
                              className="flex-1" 
                              onClick={() => joinMeeting(interview)}
                              variant={isStartedEarly && isCandidate ? "destructive" : "default"}
                              size={isStartedEarly && isCandidate ? "lg" : "default"}
                            >
                              <PlayIcon className="h-4 w-4 mr-2" />
                              {isStartedEarly && isCandidate ? "JOIN NOW!" : "Join Meeting"}
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={() => window.open(meetingLink, '_blank')}
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Open Link
                            </Button>
                          </div>
                        )}
                        
                        {isInterviewer && (
                          <CommentDialog interviewId={interview._id}>
                            <Button 
                              variant="outline" 
                              className="w-full bg-black text-white hover:bg-gray-800"
                            >
                              Completed
                            </Button>
                          </CommentDialog>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}
export default DashboardPage;