import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Check if the user is authenticated
    if (!identity) {
      // Instead of throwing an error, return an empty array
      return [];
    }

    // Only show interviews where the current user is a candidate or interviewer
    const currentUserId = identity.subject;
    
    // First get all interviews
    const allInterviews = await ctx.db.query("interviews").collect();
    
    // Then filter them in memory 
    const interviews = allInterviews.filter(
      interview => 
        interview.candidateId === currentUserId || 
        (interview.interviewerIds && interview.interviewerIds.includes(currentUserId))
    );

    const userIds = [
      ...new Set(interviews.flatMap((i) => [i.candidateId, ...i.interviewerIds])),
    ];

    const users = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
          .first()
      )
    );

    const userMap = new Map(users.filter(Boolean).map((u) => [u!.clerkId, u!]));

    return interviews.map((interview) => ({
      ...interview,
      candidate: userMap.get(interview.candidateId),
      interviewers: interview.interviewerIds.map((id) => userMap.get(id)).filter(Boolean),
    }));
  },
});


export const getMyInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get all interviews first
    const allInterviews = await ctx.db.query("interviews").collect();
    
    // Then filter them in memory
    const interviews = allInterviews.filter(
      interview => 
        interview.candidateId === identity.subject || 
        (interview.interviewerIds && interview.interviewerIds.includes(identity.subject))
    );

    const userIds = [
      ...new Set(interviews.flatMap((i) => [i.candidateId, ...(i.interviewerIds || [])])),
    ];

    const users = await Promise.all(
      userIds.map((id) =>
        ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", id)).first()
      )
    );

    const userMap = new Map(users.filter(Boolean).map((u) => [u!.clerkId, u!]));

    return interviews.map((interview) => ({
      ...interview,
      candidate: userMap.get(interview.candidateId),
      interviewers: (interview.interviewerIds || []).map((id) => userMap.get(id)).filter(Boolean),
    }));
  },
});


export const getInterviewByStreamCallId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const currentUserId = identity.subject;
    
    // Get the interview
    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
      .first();
      
    // Check if the user has permission to view this interview
    if (interview && (
      interview.candidateId === currentUserId || 
      interview.interviewerIds.includes(currentUserId)
    )) {
      return interview;
    }
    
    return null;
  },
});

export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("interviews", {
      ...args,
      isStarted: false,
    });
  },
});

export const updateInterviewStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const currentUserId = identity.subject;
    
    // Get the interview
    const interview = await ctx.db.get(args.id);
    if (!interview) throw new Error("Interview not found");
    
    // Check if user has permission to update this interview
    if (interview.candidateId !== currentUserId && !interview.interviewerIds.includes(currentUserId)) {
      throw new Error("Unauthorized to update this interview");
    }
    
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});

export const startInterview = mutation({
  args: {
    id: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const currentUserId = identity.subject;

    // Get the interview to check if the user is an interviewer
    const interview = await ctx.db.get(args.id);
    if (!interview) throw new Error("Interview not found");
    
    // Only interviewers can start an interview
    if (!interview.interviewerIds.includes(currentUserId)) {
      throw new Error("Only interviewers can start an interview");
    }

    // Mark the interview as started and update its status to "in-progress"
    return await ctx.db.patch(args.id, {
      isStarted: true,
      status: "in-progress",
      actualStartTime: Date.now(),
    });
  },
});

export const deleteInterview = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const currentUserId = identity.subject;
    
    // Get the interview
    const interview = await ctx.db.get(args.id);
    if (!interview) throw new Error("Interview not found");
    
    // Only interviewers can delete interviews
    if (!interview.interviewerIds.includes(currentUserId)) {
      throw new Error("Only interviewers can delete interviews");
    }
    
    await ctx.db.delete(args.id);
  },
});