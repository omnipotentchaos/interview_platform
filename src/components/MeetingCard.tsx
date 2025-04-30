import useMeetingActions from "@/hooks/useMeetingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type Interview = Doc<"interviews">;

function MeetingCard({ interview }: { interview: Interview }) {
  const { joinMeeting } = useMeetingActions();

  const status = getMeetingStatus(interview);
  const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d · h:mm a");

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {formattedDate}
          </div>

          <Badge
            variant={
              status === "live" ? "default" : status === "upcoming" ? "secondary" : "outline"
            }
          >
            {status === "live" ? "Live Now" : status === "upcoming" ? "Upcoming" : "Completed"}
          </Badge>
        </div>

        <CardTitle>{interview.title}</CardTitle>

        {interview.description && (
          <CardDescription className="line-clamp-2">{interview.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {status === "live" && (
          <Button className="w-full" onClick={() => joinMeeting(interview.streamCallId)}>
            Join Meeting
          </Button>
        )}

        {status === "upcoming" && (
          <Button variant="outline" className="w-full" disabled>
            Waiting to Start
          </Button>
        )}
      </CardContent>
      <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-muted">
  

  {/* Candidate Info */}
  <div className="mb-3">
    <p className="text-sm font-medium text-muted-foreground mb-1">Candidate</p>
    <div className="flex items-center gap-3">
      <img
        src={interview.candidate.image}
        alt={interview.candidate.name}
        className="h-8 w-8 rounded-full"
      />
      <span>{interview.candidate.name}</span>
    </div>
  </div>

  {/* Interviewers Info */}
  <div className="mb-3">
    <p className="text-sm font-medium text-muted-foreground mb-1">Interviewers</p>
    <div className="flex flex-wrap items-center gap-3">
      {interview.interviewers.map((interviewer, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <img
            src={interviewer.image}
            alt={interviewer.name}
            className="h-7 w-7 rounded-full"
          />
          <span className="text-sm">{interviewer.name}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Start time + status */}
  <div className="text-sm text-muted-foreground mt-3">
    
    <p>
      <strong>Start:</strong> {new Date(interview.startTime).toLocaleString()}
    </p>
  </div>
</div>

    </Card>
  );
}
export default MeetingCard;
