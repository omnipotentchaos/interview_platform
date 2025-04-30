"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon, AlertCircleIcon, PlayIcon, CheckCircle2Icon } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"; // Import useTheme for dark mode support

export default function Home() {
  const router = useRouter();
  const { isInterviewer, isCandidate, isLoading, userId } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();
  const [refreshKey, setRefreshKey] = useState(0);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const { theme } = useTheme(); // Get current theme

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (interviews) {
      interviews.forEach((interview) => {
        if (interview.status === "completed" && !dismissed[interview._id]) {
          const timeout = setTimeout(() => {
            setDismissed((prev) => ({ ...prev, [interview._id]: true }));
          }, 5000);
          return () => clearTimeout(timeout);
        }
      });
    }
  }, [interviews, dismissed]);

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  const handleJoinMeeting = (streamCallId: string) => {
    router.push(`/meeting/${streamCallId}`);
  };

  if (isLoading) return <LoaderUI />;

  // Filter interviews based on user role and ID
  const filteredInterviews = interviews?.filter((interview) => {
    if (!userId) return false;
    return (
      (isCandidate && interview.candidateId === userId) ||
      (isInterviewer && interview.interviewerIds.includes(userId))
    );
  });

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="rounded-lg bg-gradient-to-br from-teal-900 to-slate-800 dark:from-teal-950 dark:to-slate-900 p-6 border border-slate-700 shadow-md mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-xl text-slate-300 dark:text-slate-400 mt-2">
          {isInterviewer
            ? "Manage your Interviews and review Candidates effectively."
            : "Access your upcoming interviews and preparations"}
        </p>
      </div>

      {isInterviewer ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold dark:text-white">Your Interviews</h1>
            <p className="text-muted-foreground mt-1">View and join your scheduled interviews</p>
            <Button
              variant="default"
              className="mt-4"
              onClick={() => {
                setModalType("join");
                setShowModal(true);
              }}
            >
              Join via Link
            </Button>
          </div>

          <div className="mt-6">
            {filteredInterviews === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredInterviews.map((interview) => {
                  const scheduledTime = new Date(interview.startTime);
                  const isCompleted = interview.status === "completed";
                  const hasStartedEarly = interview.isStarted && !isCompleted && Date.now() < scheduledTime.getTime();

                  return (
                    <div
                      key={interview._id}
                      className={`relative border rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg 
                        ${isCompleted 
                          ? 'bg-green-900 dark:bg-green-950 border-green-700 text-white' 
                          : hasStartedEarly 
                            ? 'bg-red-900 dark:bg-red-950 border-red-700 text-white' 
                            : 'bg-slate-800 dark:bg-slate-900 border-slate-700 text-slate-100'}`}
                    >
                      {!dismissed[interview._id] && isCompleted && (
                        <div className="absolute top-0 left-0 w-full bg-green-600 text-white px-4 py-2 text-sm font-medium flex items-center rounded-t-md">
                          <CheckCircle2Icon className="h-4 w-4 mr-2" />
                          Interview completed
                        </div>
                      )}
                      {hasStartedEarly && (
                        <div className="absolute top-0 left-0 w-full bg-red-500 text-white px-4 py-2 text-sm font-medium flex items-center rounded-t-md">
                          <AlertCircleIcon className="h-4 w-4 mr-2" />
                          Interview started early! Join now.
                        </div>
                      )}
                      <div className="mt-10">
                        <MeetingCard interview={interview} />
                      </div>
                      {hasStartedEarly && !isCompleted && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleJoinMeeting(interview.streamCallId)}
                            className="bg-slate-700 text-white border border-slate-600 hover:bg-slate-600"
                          >
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Join Now
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground dark:text-slate-400">
                You have no scheduled interviews at the moment
              </div>
            )}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Join Meeting"
            isJoinMeeting={true}
          />
        </>
      )}
    </div>
  );
}