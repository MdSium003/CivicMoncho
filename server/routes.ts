import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { db } from "./db.js";
import { threads, threadComments, users, projects as projectsTable, projectVotes, specialProjectVotes, pendingEvents, events as eventsTable, eventVolunteers, eventGoings, eventHelpfulVotes, notifications, notificationReads, aboutUs, contactInfo, eventParticipation, contactSubmissions } from "./schema.js";
import { desc, eq, inArray, sql as dsql, and, lt } from "drizzle-orm";
import { generateCertificate, generateCertificateBengali } from "./certificateGenerator.js";

// Helper function to check if an event is finished (past today's date)
function isEventFinished(eventDate: string): boolean {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return eventDate < today;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all projects
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get top projects (by upvotes, limited to 4)
  app.get("/api/projects/top", async (_req, res) => {
    try {
      const topProjects = await db
        .select()
        .from(projectsTable)
        .orderBy(desc(projectsTable.upvotes))
        .limit(4);
      res.json(topProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top projects" });
    }
  });

  // Upvote a project (one vote per user)
  app.post("/api/projects/:id/upvote", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const existing = await db
        .select({ id: projectVotes.id })
        .from(projectVotes)
        .where(and(eq(projectVotes.projectId, id), eq(projectVotes.userId, user.id)))
        .limit(1);
      if (existing[0]) {
        return res.status(409).json({ message: "Already voted" });
      }
      await db.insert(projectVotes).values({ projectId: id, userId: user.id });
      const updated = await db
        .update(projectsTable)
        .set({ upvotes: dsql`${projectsTable.upvotes} + 1` as unknown as number })
        .where(eq(projectsTable.id, id))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to upvote project" });
    }
  });

  // Remove vote
  app.post("/api/projects/:id/unvote", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(projectVotes)
        .where(and(eq(projectVotes.projectId, id), eq(projectVotes.userId, user.id)))
        .returning();
      if (!deleted[0]) return res.status(404).json({ message: "Vote not found" });
      const updated = await db
        .update(projectsTable)
        .set({ upvotes: dsql`${projectsTable.upvotes} - 1` as unknown as number })
        .where(eq(projectsTable.id, id))
        .returning();
      res.json(updated[0]);
    } catch (e) {
      res.status(500).json({ message: "Failed to remove vote" });
    }
  });

  // Check vote status for current user
  app.get("/api/projects/:id/vote-status", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.json({ voted: false });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const existing = await db
        .select({ id: projectVotes.id })
        .from(projectVotes)
        .where(and(eq(projectVotes.projectId, id), eq(projectVotes.userId, user.id)))
        .limit(1);
      return res.json({ voted: !!existing[0] });
    } catch (e) {
      return res.status(500).json({ message: "Failed to get vote status" });
    }
  });

  // Create a new project (governmental only)
  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { titleEn, titleBn, descriptionEn, descriptionBn, category, status, budget, imageUrl } = req.body as any;
      if (!titleEn || !titleBn || !descriptionEn || !descriptionBn || !category || !status || !budget) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      const inserted = await db.insert(projectsTable).values({
        titleEn,
        titleBn,
        descriptionEn,
        descriptionBn,
        category,
        status,
        budget,
        imageUrl: imageUrl || "https://placehold.co/800x400/cccccc/000000?text=Project",
      }).returning();
      res.json(inserted[0]);
    } catch (e) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Delete a project (governmental only)
  app.delete("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { id } = req.params;
      await db.delete(projectsTable).where(eq(projectsTable.id, id));
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Update project status (governmental only)
  app.patch("/api/projects/:id/status", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { id } = req.params;
      const { status } = req.body as { status?: string };
      const allowed = new Set(["Planning", "Active", "Implementation", "Completed", "Partially Active"]);
      if (!status || !allowed.has(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await db.update(projectsTable).set({ status }).where(eq(projectsTable.id, id)).returning();
      res.json(updated[0] || null);
    } catch (e) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Polls: Top 4 projects by normal upvotes (use project upvotes as poll votes)
  app.get("/api/polls", async (_req, res) => {
    try {
      const topProjects = await db
        .select()
        .from(projectsTable)
        .orderBy(desc(projectsTable.upvotes))
        .limit(4);

      const polls = topProjects.map((p) => ({
        id: p.id,
        titleBn: p.titleBn,
        titleEn: p.titleEn,
        descriptionBn: p.descriptionBn,
        descriptionEn: p.descriptionEn,
        votes: p.upvotes || 0,
        createdAt: p.createdAt,
      }));
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  // Poll vote behaves like normal project upvote (one per user)
  app.post("/api/polls/:id/vote", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const existing = await db
        .select({ id: projectVotes.id })
        .from(projectVotes)
        .where(and(eq(projectVotes.projectId, id), eq(projectVotes.userId, user.id)))
        .limit(1);
      if (existing[0]) return res.status(409).json({ message: "Already voted" });
      await db.insert(projectVotes).values({ projectId: id, userId: user.id });
      const updated = await db
        .update(projectsTable)
        .set({ upvotes: dsql`${projectsTable.upvotes} + 1` as unknown as number })
        .where(eq(projectsTable.id, id))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to vote" });
    }
  });

  // Get all events (with proposer name)
  app.get("/api/events", async (_req, res) => {
    try {
      const rows = await db.select().from(eventsTable);
      const proposerIds = Array.from(new Set(rows.map(r => r.proposerId).filter(Boolean) as string[]));
      let proposerMap: Record<string, string> = {};
      if (proposerIds.length) {
        const proposers = await db
          .select({ id: users.id, username: users.username, firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(inArray(users.id, proposerIds));
        proposerMap = proposers.reduce((acc, u) => { acc[u.id] = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username; return acc; }, {} as Record<string, string>);
      }
      res.json(rows.map(r => ({ ...r, proposerName: r.proposerId ? proposerMap[r.proposerId] || null : null })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get top events (by helpful votes, limited to 4)
  app.get("/api/events/top", async (_req, res) => {
    try {
      const topEvents = await db
        .select()
        .from(eventsTable)
        .orderBy(desc(eventsTable.helpful))
        .limit(4);
      res.json(topEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top events" });
    }
  });

  // Volunteer for an event (one per user)
  app.post("/api/events/:id/volunteer", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      
      // Check if event exists and get its date
      const event = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
      if (!event[0]) return res.status(404).json({ message: "Event not found" });
      
      // Check if event is finished
      if (isEventFinished(event[0].date)) {
        return res.status(400).json({ message: "This event has ended. Participation is no longer available." });
      }
      
      const existing = await db
        .select({ id: eventVolunteers.id })
        .from(eventVolunteers)
        .where(and(eq(eventVolunteers.eventId, id), eq(eventVolunteers.userId, user.id)))
        .limit(1);
      if (existing[0]) return res.status(409).json({ message: "Already volunteered" });
      await db.insert(eventVolunteers).values({ eventId: id, userId: user.id });
      await db.insert(eventParticipation).values({ 
        eventId: id, 
        userId: user.id, 
        participationType: 'volunteer' 
      });
      const updated = await db
        .update(eventsTable)
        .set({ volunteers: dsql`${eventsTable.volunteers} + 1` as unknown as number })
        .where(eq(eventsTable.id, id))
        .returning();
      res.json(updated[0] || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to volunteer for event" });
    }
  });

  // Cancel volunteer
  app.post("/api/events/:id/unvolunteer", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(eventVolunteers)
        .where(and(eq(eventVolunteers.eventId, id), eq(eventVolunteers.userId, user.id)))
        .returning();
      if (!deleted[0]) return res.status(404).json({ message: "Not volunteered" });
      const updated = await db
        .update(eventsTable)
        .set({ volunteers: dsql`${eventsTable.volunteers} - 1` as unknown as number })
        .where(eq(eventsTable.id, id))
        .returning();
      res.json(updated[0] || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel volunteer" });
    }
  });

  // Mark going to an event (one per user)
  app.post("/api/events/:id/going", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      
      // Check if event exists and get its date
      const event = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
      if (!event[0]) return res.status(404).json({ message: "Event not found" });
      
      // Check if event is finished
      if (isEventFinished(event[0].date)) {
        return res.status(400).json({ message: "This event has ended. Participation is no longer available." });
      }
      
      const existing = await db
        .select({ id: eventGoings.id })
        .from(eventGoings)
        .where(and(eq(eventGoings.eventId, id), eq(eventGoings.userId, user.id)))
        .limit(1);
      if (existing[0]) return res.status(409).json({ message: "Already marked going" });
      await db.insert(eventGoings).values({ eventId: id, userId: user.id });
      await db.insert(eventParticipation).values({ 
        eventId: id, 
        userId: user.id, 
        participationType: 'going' 
      });
      const updated = await db
        .update(eventsTable)
        .set({ going: dsql`${eventsTable.going} + 1` as unknown as number })
        .where(eq(eventsTable.id, id))
        .returning();
      res.json(updated[0] || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark going to event" });
    }
  });

  // Cancel going
  app.post("/api/events/:id/notgoing", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(eventGoings)
        .where(and(eq(eventGoings.eventId, id), eq(eventGoings.userId, user.id)))
        .returning();
      if (!deleted[0]) return res.status(404).json({ message: "Not marked going" });
      const updated = await db
        .update(eventsTable)
        .set({ going: dsql`${eventsTable.going} - 1` as unknown as number })
        .where(eq(eventsTable.id, id))
        .returning();
      res.json(updated[0] || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel going" });
    }
  });

  // Mark event as helpful (one per user)
  app.post("/api/events/:id/helpful", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const existing = await db
        .select({ id: eventHelpfulVotes.id })
        .from(eventHelpfulVotes)
        .where(and(eq(eventHelpfulVotes.eventId, id), eq(eventHelpfulVotes.userId, user.id)))
        .limit(1);
      if (existing[0]) return res.status(409).json({ message: "Already marked helpful" });
      await db.insert(eventHelpfulVotes).values({ eventId: id, userId: user.id });
      const updated = await db
        .update(eventsTable)
        .set({ helpful: dsql`${eventsTable.helpful} + 1` as unknown as number })
        .where(eq(eventsTable.id, id))
        .returning();
      res.json(updated[0] || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark event as helpful" });
    }
  });

  // Remove helpful
  app.post("/api/events/:id/unhelpful", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(eventHelpfulVotes)
        .where(and(eq(eventHelpfulVotes.eventId, id), eq(eventHelpfulVotes.userId, user.id)))
        .returning();
      if (!deleted[0]) return res.status(404).json({ message: "Not marked helpful" });
      const updated = await db
        .update(eventsTable)
        .set({ helpful: dsql`${eventsTable.helpful} - 1` as unknown as number })
        .where(eq(eventsTable.id, id))
        .returning();
      res.json(updated[0] || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove helpful" });
    }
  });

  // Status endpoints for current user
  app.get("/api/events/:id/status", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.json({ volunteered: false, going: false, helpful: false });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const [v, g, h] = await Promise.all([
        db.select({ id: eventVolunteers.id }).from(eventVolunteers).where(and(eq(eventVolunteers.eventId, id), eq(eventVolunteers.userId, user.id))).limit(1),
        db.select({ id: eventGoings.id }).from(eventGoings).where(and(eq(eventGoings.eventId, id), eq(eventGoings.userId, user.id))).limit(1),
        db.select({ id: eventHelpfulVotes.id }).from(eventHelpfulVotes).where(and(eq(eventHelpfulVotes.eventId, id), eq(eventHelpfulVotes.userId, user.id))).limit(1),
      ]);
      res.json({ volunteered: !!v[0], going: !!g[0], helpful: !!h[0] });
    } catch (e) {
      res.status(500).json({ message: "Failed to get status" });
    }
  });

  // Propose event: create pending event (logged-in users)
  app.post("/api/events/propose", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const body = req.body as any;
      const required = ["titleEn","titleBn","descriptionEn","descriptionBn","category","date","location"];
      if (required.some((k) => !body?.[k])) return res.status(400).json({ message: "All fields are required" });
      const inserted = await db.insert(pendingEvents).values({
        titleEn: body.titleEn,
        titleBn: body.titleBn,
        descriptionEn: body.descriptionEn,
        descriptionBn: body.descriptionBn,
        category: body.category,
        date: body.date,
        location: body.location,
        imageUrl: body.imageUrl || "https://placehold.co/800x400/cccccc/000000?text=Event",
        volunteers: parseInt(body.volunteersNeeded || '0', 10) || 0,
        proposerId: user.id,
        going: 0,
        helpful: 0,
      }).returning();
      res.json({ id: inserted[0].id, message: "Event submitted for approval" });
    } catch (e) {
      res.status(500).json({ message: "Failed to submit event" });
    }
  });

  // Governmental: list pending events
  app.get("/api/events/pending", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') return res.status(403).json({ message: "Forbidden" });
    try {
      const rows = await db.select().from(pendingEvents).orderBy(desc(pendingEvents.createdAt));
      res.json(rows);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch pending events" });
    }
  });

  // Governmental: approve pending event
  app.post("/api/events/pending/:id/approve", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const pending = (await db.select().from(pendingEvents).where(eq(pendingEvents.id, id)).limit(1))[0];
      if (!pending) return res.status(404).json({ message: "Not found" });
      const { id: _, ...data } = pending as any;
      await db.insert(eventsTable).values(data);
      await db.delete(pendingEvents).where(eq(pendingEvents.id, id));
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to approve event" });
    }
  });

  // Governmental: delete pending event
  app.delete("/api/events/pending/:id", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      await db.delete(pendingEvents).where(eq(pendingEvents.id, id));
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to delete pending event" });
    }
  });

  // Delete an event (governmental only)
  app.delete("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { id } = req.params;
      await db.delete(eventsTable).where(eq(eventsTable.id, id));
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Threads API
  app.get("/api/threads", async (_req, res) => {
    try {
      const rows = await db.select().from(threads).orderBy(desc(threads.createdAt));
      // fetch comment counts
      const threadIds = rows.map(r => r.id);
      let commentsByThread: Record<string, number> = {};
      if (threadIds.length) {
        const comments = await db
          .select({ threadId: threadComments.threadId })
          .from(threadComments)
          .where(inArray(threadComments.threadId, threadIds));
        commentsByThread = comments.reduce((acc, c) => { acc[c.threadId] = (acc[c.threadId] || 0) + 1; return acc; }, {} as Record<string, number>);
      }
      // attach author names
      const authorIds = Array.from(new Set(rows.map(r => r.authorId)));
      let authorMap: Record<string, { username: string; firstName?: string; lastName?: string }> = {};
      if (authorIds.length) {
        const authors = await db
          .select({ id: users.id, username: users.username, firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(inArray(users.id, authorIds));
        authorMap = authors.reduce((acc, u) => { acc[u.id] = { username: u.username, firstName: u.firstName, lastName: u.lastName }; return acc; }, {} as Record<string, any>);
      }
      res.json(rows.map(r => ({ ...r, commentCount: commentsByThread[r.id] || 0, author: authorMap[r.authorId] || null })));
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch threads" });
    }
  });

  app.post("/api/threads", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      const { titleBn, titleEn, contentBn, contentEn, category } = req.body as any;
      if (!titleBn || !titleEn || !contentBn || !contentEn || !category) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const inserted = await db.insert(threads).values({ titleBn, titleEn, contentBn, contentEn, category, authorId: user.id }).returning();
      res.json(inserted[0]);
    } catch (e) {
      res.status(500).json({ message: "Failed to create thread" });
    }
  });

  app.get("/api/threads/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await db.select().from(threadComments).where(eq(threadComments.threadId, id)).orderBy(desc(threadComments.createdAt));
      const authorIds = Array.from(new Set(comments.map(c => c.authorId)));
      let authorMap: Record<string, { username: string; firstName?: string; lastName?: string }> = {};
      if (authorIds.length) {
        const authors = await db
          .select({ id: users.id, username: users.username, firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(inArray(users.id, authorIds));
        authorMap = authors.reduce((acc, u) => { acc[u.id] = { username: u.username, firstName: u.firstName, lastName: u.lastName }; return acc; }, {} as Record<string, any>);
      }
      res.json(comments.map(c => ({ ...c, author: authorMap[c.authorId] || null })));
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/threads/:id/comments", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      const { text } = req.body as any;
      if (!text) return res.status(400).json({ message: "Text is required" });
      const inserted = await db.insert(threadComments).values({ threadId: id, authorId: user.id, text }).returning();
      res.json(inserted[0]);
    } catch (e) {
      res.status(500).json({ message: "Failed to post comment" });
    }
  });

  app.post("/api/threads/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await db
        .update(threads)
        .set({ likes: dsql`${threads.likes} + 1` as unknown as number })
        .where(eq(threads.id, id))
        .returning();
    
      res.json(updated[0] || null);
    } catch (e) {
      res.status(500).json({ message: "Failed to like thread" });
    }
  });

  // Admin actions: pin/unpin and delete (governmental only)
  app.post("/api/threads/:id/pin", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const updated = await db.update(threads).set({ pinned: 1 as unknown as number }).where(eq(threads.id, id)).returning();
      res.json(updated[0] || null);
    } catch (e) {
      res.status(500).json({ message: "Failed to pin" });
    }
  });

  app.post("/api/threads/:id/unpin", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const updated = await db.update(threads).set({ pinned: 0 as unknown as number }).where(eq(threads.id, id)).returning();
      res.json(updated[0] || null);
    } catch (e) {
      res.status(500).json({ message: "Failed to unpin" });
    }
  });

  app.delete("/api/threads/:id", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      await db.delete(threadComments).where(eq(threadComments.threadId, id));
      await db.delete(threads).where(eq(threads.id, id));
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to delete thread" });
    }
  });

  // Notification API endpoints

  // Get notifications for a user (filtered by their thana and countrywide)
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      // Get user's thana
      const userData = await db.select({ thana: users.thana }).from(users).where(eq(users.id, user.id)).limit(1);
      const userThana = userData[0]?.thana;

      // Get notifications that are either countrywide or targeted to user's thana
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.isActive, 1),
            dsql`(${notifications.targetType} = 'countrywide' OR ${notifications.targetThana} = ${userThana})`
          )
        )
        .orderBy(desc(notifications.createdAt));

      // Get read status for each notification
      const notificationIds = userNotifications.map(n => n.id);
      let readStatuses: Record<string, boolean> = {};
      if (notificationIds.length > 0) {
        const reads = await db
          .select({ notificationId: notificationReads.notificationId })
          .from(notificationReads)
          .where(
            and(
              eq(notificationReads.userId, user.id),
              inArray(notificationReads.notificationId, notificationIds)
            )
          );
        readStatuses = reads.reduce((acc, read) => {
          acc[read.notificationId] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }

      // Add read status to notifications
      const notificationsWithReadStatus = userNotifications.map(notification => ({
        ...notification,
        isRead: !!readStatuses[notification.id]
      }));

      res.json(notificationsWithReadStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get all notifications for government users (for management)
  app.get("/api/notifications/admin", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const allNotifications = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt));
      res.json(allNotifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Create new notification (government only)
  app.post("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { titleBn, titleEn, messageBn, messageEn, targetType, targetThana } = req.body;
      if (!titleBn || !titleEn || !messageBn || !messageEn || !targetType) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      if (targetType === 'thana' && !targetThana) {
        return res.status(400).json({ message: "Target thana required for thana-specific notifications" });
      }

      const newNotification = await db
        .insert(notifications)
        .values({
          titleBn,
          titleEn,
          messageBn,
          messageEn,
          authorId: user.id,
          targetType,
          targetThana: targetType === 'countrywide' ? null : targetThana,
        })
        .returning();

      res.json(newNotification[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      const { id } = req.params;
      
      // Check if already read
      const existingRead = await db
        .select({ id: notificationReads.id })
        .from(notificationReads)
        .where(and(eq(notificationReads.notificationId, id), eq(notificationReads.userId, user.id)))
        .limit(1);

      if (existingRead[0]) {
        return res.json({ message: "Already read" });
      }

      await db
        .insert(notificationReads)
        .values({
          notificationId: id,
          userId: user.id,
        });

      res.json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    try {
      // Get all unread notifications for this user
      const userData = await db.select({ thana: users.thana }).from(users).where(eq(users.id, user.id)).limit(1);
      const userThana = userData[0]?.thana;

      const unreadNotifications = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.isActive, 1),
            dsql`(${notifications.targetType} = 'countrywide' OR ${notifications.targetThana} = ${userThana})`
          )
        );

      const notificationIds = unreadNotifications.map(n => n.id);

      if (notificationIds.length > 0) {
        // Get already read notifications
        const readNotifications = await db
          .select({ notificationId: notificationReads.notificationId })
          .from(notificationReads)
          .where(
            and(
              eq(notificationReads.userId, user.id),
              inArray(notificationReads.notificationId, notificationIds)
            )
          );

        const readIds = new Set(readNotifications.map(r => r.notificationId));
        const unreadIds = notificationIds.filter(id => !readIds.has(id));

        // Mark unread notifications as read
        if (unreadIds.length > 0) {
          await db.insert(notificationReads).values(
            unreadIds.map(notificationId => ({
              notificationId,
              userId: user.id,
            }))
          );
        }
      }

      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all as read" });
    }
  });

  // Deactivate notification (government only)
  app.patch("/api/notifications/:id/deactivate", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { id } = req.params;
      await db
        .update(notifications)
        .set({ isActive: 0 })
        .where(eq(notifications.id, id));
      res.json({ message: "Notification deactivated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate notification" });
    }
  });

  // About Us API
  app.get("/api/about", async (_req, res) => {
    try {
      const about = await db.select().from(aboutUs).limit(1);
      res.json(about[0] || null);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch about us" });
    }
  });

  // Update About Us (governmental only)
  app.put("/api/about", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const body = req.body as any;
      const required = ["titleEn", "titleBn", "contentEn", "contentBn", "missionEn", "missionBn", "visionEn", "visionBn", "valuesEn", "valuesBn", "imageUrl"];
      if (required.some((k) => !body?.[k])) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if about us exists
      const existing = await db.select().from(aboutUs).limit(1);
      
      if (existing.length > 0) {
        // Update existing
        const updated = await db
          .update(aboutUs)
          .set({
            titleEn: body.titleEn,
            titleBn: body.titleBn,
            contentEn: body.contentEn,
            contentBn: body.contentBn,
            missionEn: body.missionEn,
            missionBn: body.missionBn,
            visionEn: body.visionEn,
            visionBn: body.visionBn,
            valuesEn: body.valuesEn,
            valuesBn: body.valuesBn,
            imageUrl: body.imageUrl,
            updatedAt: new Date(),
          })
          .where(eq(aboutUs.id, existing[0].id))
          .returning();
        res.json(updated[0]);
      } else {
        // Create new
        const inserted = await db.insert(aboutUs).values({
          titleEn: body.titleEn,
          titleBn: body.titleBn,
          contentEn: body.contentEn,
          contentBn: body.contentBn,
          missionEn: body.missionEn,
          missionBn: body.missionBn,
          visionEn: body.visionEn,
          visionBn: body.visionBn,
          valuesEn: body.valuesEn,
          valuesBn: body.valuesBn,
          imageUrl: body.imageUrl,
        }).returning();
        res.json(inserted[0]);
      }
    } catch (e) {
      res.status(500).json({ message: "Failed to update about us" });
    }
  });

  // Contact Info API
  app.get("/api/contact", async (_req, res) => {
    try {
      const contact = await db.select().from(contactInfo).limit(1);
      res.json(contact[0] || null);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch contact info" });
    }
  });

  // Update Contact Info (governmental only)
  app.put("/api/contact", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const user = req.user as any;
    if (user.role !== 'governmental') {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const body = req.body as any;
      const required = ["titleEn", "titleBn", "addressEn", "addressBn", "phone", "email", "website", "officeHoursEn", "officeHoursBn"];
      if (required.some((k) => !body?.[k])) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if contact info exists
      const existing = await db.select().from(contactInfo).limit(1);
      
      if (existing.length > 0) {
        // Update existing
        const updated = await db
          .update(contactInfo)
          .set({
            titleEn: body.titleEn,
            titleBn: body.titleBn,
            addressEn: body.addressEn,
            addressBn: body.addressBn,
            phone: body.phone,
            email: body.email,
            website: body.website,
            officeHoursEn: body.officeHoursEn,
            officeHoursBn: body.officeHoursBn,
            mapEmbed: body.mapEmbed || null,
            socialMedia: body.socialMedia || null,
            updatedAt: new Date(),
          })
          .where(eq(contactInfo.id, existing[0].id))
          .returning();
        res.json(updated[0]);
      } else {
        // Create new
        const inserted = await db.insert(contactInfo).values({
          titleEn: body.titleEn,
          titleBn: body.titleBn,
          addressEn: body.addressEn,
          addressBn: body.addressBn,
          phone: body.phone,
          email: body.email,
          website: body.website,
          officeHoursEn: body.officeHoursEn,
          officeHoursBn: body.officeHoursBn,
          mapEmbed: body.mapEmbed || null,
          socialMedia: body.socialMedia || null,
        }).returning();
        res.json(inserted[0]);
      }
    } catch (e) {
      res.status(500).json({ message: "Failed to update contact info" });
    }
  });

  // Submit Contact Form
  app.post("/api/contact/submit", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // Save contact submission to database
      const submission = await db.insert(contactSubmissions).values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      }).returning();
      
      res.json({ 
        message: "Contact form submitted successfully",
        submissionId: submission[0].id 
      });
    } catch (e) {
      console.error("Error submitting contact form:", e);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Get user's finished events (events that are past today's date)
  app.get("/api/user/finished-events", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get events where user participated and event date is before today
      const finishedEvents = await db
        .select({
          event: eventsTable,
          participation: eventParticipation,
        })
        .from(eventsTable)
        .innerJoin(eventParticipation, eq(eventsTable.id, eventParticipation.eventId))
        .where(
          and(
            eq(eventParticipation.userId, user.id),
            lt(eventsTable.date, today)
          )
        )
        .orderBy(desc(eventsTable.date));

      res.json(finishedEvents);
    } catch (e) {
      console.error("Error fetching finished events:", e);
      res.status(500).json({ message: "Failed to fetch finished events" });
    }
  });

  // Generate certificate for a specific event participation
  app.post("/api/user/generate-certificate/:participationId", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { participationId } = req.params;

      // Get participation details
      const participation = await db
        .select({
          participation: eventParticipation,
          event: eventsTable,
          user: users,
        })
        .from(eventParticipation)
        .innerJoin(eventsTable, eq(eventParticipation.eventId, eventsTable.id))
        .innerJoin(users, eq(eventParticipation.userId, users.id))
        .where(eq(eventParticipation.id, participationId))
        .limit(1);

      if (!participation.length) {
        return res.status(404).json({ message: "Participation not found" });
      }

      const { participation: part, event, user: participantUser } = participation[0];

      // Check if user owns this participation
      if (part.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if certificate already generated
      if (part.certificateGenerated) {
        return res.json({ 
          message: "Certificate already generated",
          certificateUrl: part.certificateUrl 
        });
      }

      // Generate certificate URL
      const certificateUrl = `/api/certificates/${participationId}.png`;

      // Update participation with certificate info
      await db
        .update(eventParticipation)
        .set({
          certificateGenerated: 1,
          certificateUrl: certificateUrl,
        })
        .where(eq(eventParticipation.id, participationId));

      res.json({ 
        message: "Certificate generated successfully",
        certificateUrl: certificateUrl 
      });
    } catch (e) {
      console.error("Error generating certificate:", e);
      res.status(500).json({ message: "Failed to generate certificate" });
    }
  });

  // Download certificate
  app.get("/api/certificates/:participationId.png", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const user = req.user as any;
    try {
      const { participationId } = req.params;

      // Get participation details
      const participation = await db
        .select({
          participation: eventParticipation,
          event: eventsTable,
          user: users,
        })
        .from(eventParticipation)
        .innerJoin(eventsTable, eq(eventParticipation.eventId, eventsTable.id))
        .innerJoin(users, eq(eventParticipation.userId, users.id))
        .where(eq(eventParticipation.id, participationId))
        .limit(1);

      if (!participation.length) {
        return res.status(404).json({ message: "Participation not found" });
      }

      const { participation: part, event, user: participantUser } = participation[0];

      // Check if user owns this participation
      if (part.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if certificate is generated
      if (!part.certificateGenerated) {
        return res.status(404).json({ message: "Certificate not generated" });
      }

      // Generate the actual certificate image
      const certificateData = {
        userName: `${participantUser.firstName} ${participantUser.lastName}`,
        eventName: event.titleEn,
        eventDate: event.date,
        eventLocation: event.location,
        participationType: part.participationType as 'volunteer' | 'going'
      };

      // Generate certificate (try Bengali first, fallback to English)
      let certificateBuffer: Buffer;
      try {
        certificateBuffer = await generateCertificateBengali(certificateData);
      } catch (error) {
        console.log('Bengali certificate generation failed, falling back to English:', error);
        certificateBuffer = await generateCertificate(certificateData);
      }

      // Set headers for PNG image
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${event.titleEn.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png"`);
      res.setHeader('Content-Length', certificateBuffer.length);

      res.send(certificateBuffer);
    } catch (e) {
      console.error("Error downloading certificate:", e);
      res.status(500).json({ message: "Failed to download certificate" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
