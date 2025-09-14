import type { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import { db } from "./db";
import { users, pendingApprovals } from "@shared/schema";
import { eq } from "drizzle-orm";

type PassportUser = { id: string; username: string; role: 'citizen' | 'governmental' };

function hashPassword(password: string, salt: string): Promise<string> {
	return new Promise((resolve, reject) => {
		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) return reject(err);
			resolve(`${salt}:${derivedKey.toString("hex")}`);
		});
	});
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [salt, key] = stored.split(":");
	const hashed = await hashPassword(password, salt);
	return hashed === stored;
}

passport.serializeUser((user: any, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
	try {
		const row = (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
		done(null, row || false);
	} catch (e) {
		done(e as any);
	}
});

passport.use(
	new LocalStrategy(
		{ usernameField: "username", passwordField: "password" },
		async (username, password, done) => {
			try {
				const row = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
				if (!row) return done(null, false, { message: "Invalid credentials" });
				const ok = await verifyPassword(password, row.password);
				if (!ok) return done(null, false, { message: "Invalid credentials" });
				return done(null, { id: row.id, username: row.username, role: (row as any).role } as PassportUser);
			} catch (e) {
				return done(e as any);
			}
		}
	)
);

export function registerAuthRoutes(app: Express) {
	app.use(passport.initialize());
	app.use(passport.session());

	app.post("/api/auth/register", async (req: Request, res: Response) => {
		try {
			const { username, password, role = 'citizen', firstName, lastName, idType, idNumber, building, floor, street, thana, city, postalCode, country, mobile } = req.body as any;
			if (!username || !password || !firstName || !lastName || !idType || !idNumber || !building || !street || !thana || !city || !postalCode || !country || !mobile) {
				return res.status(400).json({ message: "All fields are required" });
			}
			const salt = crypto.randomBytes(16).toString("hex");
			const hashed = await hashPassword(password, salt);
			
			// Uniqueness pre-check across users and pending
			const existingUser = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
			const existingPending = (await db.select().from(pendingApprovals).where(eq(pendingApprovals.username, username)).limit(1))[0];
			if (existingUser || existingPending) return res.status(409).json({ message: "Email already exists" });
			const existingMobileUser = (await db.select().from(users).where(eq(users.mobile, mobile)).limit(1))[0];
			const existingMobilePending = (await db.select().from(pendingApprovals).where(eq(pendingApprovals.mobile, mobile)).limit(1))[0];
			if (existingMobileUser || existingMobilePending) return res.status(409).json({ message: "Mobile already exists" });
			const existingIdNumUser = (await db.select().from(users).where(eq(users.idNumber, idNumber)).limit(1))[0];
			const existingIdNumPending = (await db.select().from(pendingApprovals).where(eq(pendingApprovals.idNumber, idNumber)).limit(1))[0];
			if (existingIdNumUser || existingIdNumPending) return res.status(409).json({ message: "ID number already exists" });
			
			// Create pending approval instead of direct user
			const inserted = await db.insert(pendingApprovals).values({ 
				username, password: hashed, role, firstName, lastName, idType, idNumber, 
				building, floor, street, thana, city, postalCode, country, mobile 
			}).returning();
			
			res.json({ 
				message: "Registration submitted for approval", 
				id: inserted[0].id 
			});
		} catch (e: any) {
			if (e?.code === "23505") {
				return res.status(409).json({ message: "Duplicate value" });
			}
			res.status(500).json({ message: "Registration failed" });
		}
	});

	app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
		passport.authenticate("local", (err: any, user: PassportUser | false, info: any) => {
			if (err) return next(err);
			if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });
			const requestedRole = (req.body && (req.body as any).role) as string | undefined;
			if (requestedRole && user.role && requestedRole !== user.role) {
				return res.status(403).json({ message: "Invalid role for this account" });
			}
			req.logIn(user, (err2) => {
				if (err2) return next(err2);
				return res.json({ id: user.id, username: user.username, role: user.role });
			});
		})(req, res, next);
	});

	app.get("/api/auth/me", async (req: Request, res: Response) => {
		if (req.isAuthenticated && req.isAuthenticated()) {
			// @ts-ignore
			const authUser = req.user as any;
			// Return full profile (without password)
			const row = (await db.select().from(users).where(eq(users.id, authUser.id)).limit(1))[0];
			if (!row) return res.status(401).json({ message: "Unauthorized" });
			const { password, ...rest } = row as any;
			return res.json(rest);
		}
		return res.status(401).json({ message: "Unauthorized" });
	});

	app.post("/api/auth/logout", (req: Request, res: Response) => {
		if (req.logout) {
			// @ts-ignore
			req.logout(() => res.json({ ok: true }));
		} else {
			res.json({ ok: true });
		}
	});

	// Approval routes (governmental only)
	app.get("/api/approvals", async (req: Request, res: Response) => {
		if (!req.isAuthenticated || !req.isAuthenticated()) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		// @ts-ignore
		const user = req.user as any;
		if (user.role !== 'governmental') {
			return res.status(403).json({ message: "Forbidden" });
		}
		
		try {
			const rows = await db.select().from(pendingApprovals).orderBy(pendingApprovals.createdAt);
			res.json(rows);
		} catch (e) {
			res.status(500).json({ message: "Failed to fetch approvals" });
		}
	});

	app.post("/api/approvals/:id/approve", async (req: Request, res: Response) => {
		if (!req.isAuthenticated || !req.isAuthenticated()) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		// @ts-ignore
		const user = req.user as any;
		if (user.role !== 'governmental') {
			return res.status(403).json({ message: "Forbidden" });
		}
		
		try {
			const { id } = req.params as { id: string };
			const pending = (await db.select().from(pendingApprovals).where(eq(pendingApprovals.id, id)).limit(1))[0];
			if (!pending) return res.status(404).json({ message: "Not found" });
			
			// Uniqueness checks before moving
			if ((await db.select().from(users).where(eq(users.username, pending.username)).limit(1))[0]) return res.status(409).json({ message: "Email already exists" });
			if ((await db.select().from(users).where(eq(users.mobile, pending.mobile)).limit(1))[0]) return res.status(409).json({ message: "Mobile already exists" });
			if ((await db.select().from(users).where(eq(users.idNumber, pending.idNumber)).limit(1))[0]) return res.status(409).json({ message: "ID number already exists" });
			
			// Move to users table
			const { id: _, ...userData } = pending as any;
			await db.insert(users).values(userData);
			
			// Remove from pending
			await db.delete(pendingApprovals).where(eq(pendingApprovals.id, id));
			
			res.json({ message: "Approved" });
		} catch (e) {
			res.status(500).json({ message: "Failed to approve" });
		}
	});

	app.delete("/api/approvals/:id", async (req: Request, res: Response) => {
		if (!req.isAuthenticated || !req.isAuthenticated()) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		// @ts-ignore
		const user = req.user as any;
		if (user.role !== 'governmental') {
			return res.status(403).json({ message: "Forbidden" });
		}
		
		try {
			const { id } = req.params as { id: string };
			await db.delete(pendingApprovals).where(eq(pendingApprovals.id, id));
			res.json({ message: "Deleted" });
		} catch (e) {
			res.status(500).json({ message: "Failed to delete" });
		}
	});
}
