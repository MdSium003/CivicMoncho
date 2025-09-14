import { type User, type InsertUser, type Project, type InsertProject, type Poll, type InsertPoll, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { users, projects as projectsTable, polls as pollsTable, events as eventsTable } from "@shared/schema";
import { eq, desc, sql as dsql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  upvoteProject(id: string): Promise<Project | undefined>;
  getAllPolls(): Promise<Poll[]>;
  getPoll(id: string): Promise<Poll | undefined>;
  voteForPoll(id: string): Promise<Poll | undefined>;
  getAllEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  volunteerForEvent(id: string): Promise<Event | undefined>;
  goingToEvent(id: string): Promise<Event | undefined>;
  markEventHelpful(id: string): Promise<Event | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private polls: Map<string, Poll>;
  private events: Map<string, Event>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.polls = new Map();
    this.events = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize projects with Bangladeshi context
    const projectsData: Project[] = [
      {
        id: "1",
        titleBn: "পদ্মা সেতু রেল সংযোগ প্রকল্প",
        titleEn: "Padma Bridge Rail Link Project",
        descriptionBn: "পদ্মা সেতুর মাধ্যমে ঢাকা থেকে যশোর পর্যন্ত রেললাইন নির্মাণ।",
        descriptionEn: "Construction of a rail line from Dhaka to Jessore via the Padma Bridge.",
        category: "Infrastructure",
        budget: "৳ ৩৯,২৪৬ কোটি",
        status: "Implementation",
        imageUrl: "https://placehold.co/800x400/000000/FFFFFF?text=Padma+Rail+Link",
        upvotes: 789,
        createdAt: new Date(),
      },
      {
        id: "2",
        titleBn: "ঢাকা মেট্রোরেল প্রকল্প",
        titleEn: "Dhaka Metro Rail Project",
        descriptionBn: "ঢাকার যানজট নিরসনে নগর জুড়ে দ্রুতগতির গণপরিবহন ব্যবস্থা স্থাপন।",
        descriptionEn: "Establishing a rapid mass transit system across Dhaka to alleviate traffic congestion.",
        category: "Infrastructure",
        budget: "৳ ৩৩,৪৭২ কোটি",
        status: "Active",
        imageUrl: "https://placehold.co/800x400/333333/FFFFFF?text=Dhaka+Metro",
        upvotes: 932,
        createdAt: new Date(),
      },
      {
        id: "3",
        titleBn: "বঙ্গবন্ধু শেখ মুজিব শিল্প নগর",
        titleEn: "Bangabandhu Sheikh Mujib Shilpa Nagar",
        descriptionBn: "মীরসরাইয়ে একটি অর্থনৈতিক অঞ্চল প্রতিষ্ঠা করে শিল্পায়ন ও কর্মসংস্থান সৃষ্টি।",
        descriptionEn: "Creating industrialization and employment by establishing an economic zone in Mirsarai.",
        category: "Economy",
        budget: "৳ ৪,৩৪৭ কোটি",
        status: "Active",
        imageUrl: "https://placehold.co/800x400/555555/FFFFFF?text=BSMSN",
        upvotes: 541,
        createdAt: new Date(),
      },
      {
        id: "4",
        titleBn: "রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্র",
        titleEn: "Rooppur Nuclear Power Plant",
        descriptionBn: "দেশের প্রথম পারমাণবিক বিদ্যুৎ কেন্দ্র স্থাপন করে দীর্ঘমেয়াদী বিদ্যুৎ চাহিদা পূরণ।",
        descriptionEn: "Meeting long-term electricity demand by establishing the country's first nuclear power plant.",
        category: "Energy",
        budget: "৳ ১,১৩,০৯৫ কোটি",
        status: "Implementation",
        imageUrl: "https://placehold.co/800x400/777777/FFFFFF?text=Rooppur+NPP",
        upvotes: 612,
        createdAt: new Date(),
      },
      {
        id: "5",
        titleBn: "বঙ্গবন্ধু শেখ মুজিবুর রহমান টানেল",
        titleEn: "Bangabandhu Sheikh Mujibur Rahman Tunnel",
        descriptionBn: "কর্ণফুলী নদীর তলদেশে নির্মিত দক্ষিণ এশিয়ার প্রথম আন্ডারওয়াটার টানেল।",
        descriptionEn: "South Asia's first underwater tunnel, constructed beneath the Karnaphuli River.",
        category: "Infrastructure",
        budget: "৳ ১০,৩৭৪ কোটি",
        status: "Active",
        imageUrl: "https://placehold.co/800x400/1a2b3c/FFFFFF?text=Karnaphuli+Tunnel",
        upvotes: 850,
        createdAt: new Date(),
      },
      {
        id: "6",
        titleBn: "ঢাকা এলিভেটেড এক্সপ্রেসওয়ে",
        titleEn: "Dhaka Elevated Expressway",
        descriptionBn: "বিমানবন্দর থেকে কুতুবখালী পর্যন্ত বিস্তৃত ঢাকার প্রথম এলিভেটেড এক্সপ্রেসওয়ে।",
        descriptionEn: "Dhaka's first elevated expressway, extending from the airport to Kutubkhali.",
        category: "Infrastructure",
        budget: "৳ ৮,৯৪০ কোটি",
        status: "Partially Active",
        imageUrl: "https://placehold.co/800x400/4d5e6f/FFFFFF?text=Elevated+Expressway",
        upvotes: 720,
        createdAt: new Date(),
      },
      {
        id: "7",
        titleBn: "মাতারবাড়ী গভীর সমুদ্র বন্দর",
        titleEn: "Matarbari Deep Sea Port",
        descriptionBn: "কক্সবাজারের মাতারবাড়ীতে দেশের প্রথম গভীর সমুদ্র বন্দর নির্মাণ।",
        descriptionEn: "Construction of the country's first deep sea port at Matarbari, Cox's Bazar.",
        category: "Infrastructure",
        budget: "৳ ১৭,৭৭৭ কোটি",
        status: "Implementation",
        imageUrl: "https://placehold.co/800x400/2a3b4c/FFFFFF?text=Matarbari+Port",
        upvotes: 680,
        createdAt: new Date(),
      },
      {
        id: "8",
        titleBn: "বঙ্গবন্ধু শেখ মুজিব রেলওয়ে সেতু",
        titleEn: "Bangabandhu Sheikh Mujib Railway Bridge",
        descriptionBn: "যমুনা নদীর উপর দেশের বৃহত্তম ডেডিকেটেড রেলওয়ে সেতু নির্মাণ।",
        descriptionEn: "Building the country's largest dedicated railway bridge over the Jamuna River.",
        category: "Infrastructure",
        budget: "৳ ১৬,৭৮۰ কোটি",
        status: "Implementation",
        imageUrl: "https://placehold.co/800x400/5d6e7f/FFFFFF?text=Jamuna+Rail+Bridge",
        upvotes: 750,
        createdAt: new Date(),
      },
    ];

    projectsData.forEach(project => this.projects.set(project.id, project));

    // Initialize polls with Bangladeshi context
    const pollsData: Poll[] = [
      {
        id: "1",
        titleBn: "সরকারি সেবা ডিজিটালাইজেশন",
        titleEn: "Digitization of Government Services",
        descriptionBn: "জন্মনিবন্ধন, পাসপোর্ট এবং অন্যান্য সরকারি সেবা অনলাইনে সহজলভ্য করা উচিত?",
        descriptionEn: "Should services like birth registration, passports, and others be made easily accessible online?",
        votes: 1534,
        createdAt: new Date(),
      },
      {
        id: "2",
        titleBn: "নদী দূষণ রোধ",
        titleEn: "Preventing River Pollution",
        descriptionBn: "বুড়িগঙ্গা ও অন্যান্য নদীগুলোকে দূষণমুক্ত করতে কঠোর আইন প্রয়োগ করা উচিত?",
        descriptionEn: "Should strict laws be enforced to free the Buriganga and other rivers from pollution?",
        votes: 1120,
        createdAt: new Date(),
      },
      {
        id: "3",
        titleBn: "পাঠ্যপুস্তকে কারিগরি শিক্ষা",
        titleEn: "Technical Education in Textbooks",
        descriptionBn: "মাধ্যমিক স্তরের পাঠ্যপুস্তকে কারিগরি ও বৃত্তিমূলক শিক্ষা অন্তর্ভুক্ত করা উচিত?",
        descriptionEn: "Should technical and vocational education be included in secondary level textbooks?",
        votes: 876,
        createdAt: new Date(),
      },
    ];

    pollsData.forEach(poll => this.polls.set(poll.id, poll));

    // Initialize events with Bangladeshi context
    const eventsData: Event[] = [
      {
        id: "1",
        titleBn: "অমর একুশে বইমেলা",
        titleEn: "Ekushey Book Fair",
        descriptionBn: "ভাষা আন্দোলনের শহীদদের স্মরণে প্রতি বছর ফেব্রুয়ারি মাসে বাংলা একাডেমি প্রাঙ্গণে অনুষ্ঠিত বইমেলা।",
        descriptionEn: "The book fair held every February on the Bangla Academy premises in memory of the martyrs of the Language Movement.",
        category: "Culture",
        date: "ফেব্রুয়ারি ১, ২০২৫",
        location: "বাংলা একাডেমি, ঢাকা",
        imageUrl: "https://placehold.co/800x400/999999/FFFFFF?text=Ekushey+Book+Fair",
        volunteers: 150,
        going: 1200,
        helpful: 850,
        createdAt: new Date(),
      },
      {
        id: "2",
        titleBn: "ডিজিটাল বাংলাদেশ মেলা",
        titleEn: "Digital Bangladesh Mela",
        descriptionBn: "তথ্যপ্রযুক্তি খাতের সর্বশেষ উদ্ভাবন ও অগ্রগতি প্রদর্শনের জন্য একটি বার্ষিক আয়োজন।",
        descriptionEn: "An annual event to showcase the latest innovations and progress in the IT sector.",
        category: "Technology",
        date: "জানুয়ারি ২৬, ২০২৫",
        location: "বঙ্গবন্ধু আন্তর্জাতিক সম্মেলন কেন্দ্র, ঢাকা",
        imageUrl: "https://placehold.co/800x400/BBBBBB/FFFFFF?text=Digital+BD+Mela",
        volunteers: 80,
        going: 950,
        helpful: 600,
        createdAt: new Date(),
      },
      {
        id: "3",
        titleBn: "জাতীয় বৃক্ষরোপণ অভিযান",
        titleEn: "National Tree Plantation Campaign",
        descriptionBn: "পরিবেশ রক্ষায় দেশব্যাপী বৃক্ষরোপণ কর্মসূচি এবং জনসচেতনতা সৃষ্টি।",
        descriptionEn: "A nationwide tree plantation program and public awareness campaign to protect the environment.",
        category: "Environment",
        date: "জুলাই ৫, ২০২৫",
        location: "সারাদেশ",
        imageUrl: "https://placehold.co/800x400/DDDDDD/FFFFFF?text=Tree+Plantation",
        volunteers: 500,
        going: 2500,
        helpful: 1800,
        createdAt: new Date(),
      },
      {
        id: "4",
        titleBn: "পহেলা বৈশাখ উদযাপন",
        titleEn: "Pohela Boishakh Celebration",
        descriptionBn: "রমনা বটমূলে ছায়ানটের বর্ষবরণ ও মঙ্গল শোভাযাত্রার মাধ্যমে বাংলা নববর্ষ উদযাপন।",
        descriptionEn: "Celebrating the Bengali New Year with Chhayanaut's ceremony at Ramna Batamul and the Mangal Shobhajatra.",
        category: "Culture",
        date: "এপ্রিল ১৪, ২০২৬",
        location: "রমনা পার্ক ও ঢাকা বিশ্ববিদ্যালয় এলাকা",
        imageUrl: "https://placehold.co/800x400/f0e1d2/000000?text=Pohela+Boishakh",
        volunteers: 200,
        going: 5000,
        helpful: 3500,
        createdAt: new Date(),
      },
      {
        id: "5",
        titleBn: "বিজয় দিবস উদযাপন",
        titleEn: "Victory Day Celebration",
        descriptionBn: "জাতীয় প্যারেড স্কয়ারে সামরিক কুচকাওয়াজ এবং দেশব্যাপী বিভিন্ন সাংস্কৃতিক অনুষ্ঠানের মাধ্যমে বিজয় দিবস পালন।",
        descriptionEn: "Observing Victory Day with a military parade at the National Parade Square and various cultural events across the country.",
        category: "National",
        date: "ডিসেম্বর ১৬, ২০২৫",
        location: "জাতীয় প্যারেড স্কয়ার, ঢাকা",
        imageUrl: "https://placehold.co/800x400/c2b3a4/FFFFFF?text=Victory+Day",
        volunteers: 100,
        going: 3000,
        helpful: 2200,
        createdAt: new Date(),
      },
      {
        id: "6",
        titleBn: "আন্তর্জাতিক মাতৃভাষা দিবস",
        titleEn: "International Mother Language Day",
        descriptionBn: "কেন্দ্রীয় শহীদ মিনারে ভাষা শহীদদের প্রতি শ্রদ্ধা নিবেদন এবং প্রভাতফেরি।",
        descriptionEn: "Paying homage to the language martyrs at the Central Shaheed Minar and organizing 'Prabhat Feri'.",
        category: "National",
        date: "ফেব্রুয়ারি ২১, ২০২৬",
        location: "কেন্দ্রীয় শহীদ মিনার, ঢাকা",
        imageUrl: "https://placehold.co/800x400/a1b2c3/FFFFFF?text=Ekushey+February",
        volunteers: 300,
        going: 6000,
        helpful: 4500,
        createdAt: new Date(),
      },
      {
        id: "7",
        titleBn: "স্বাধীনতা দিবস উদযাপন",
        titleEn: "Independence Day Celebration",
        descriptionBn: "জাতীয় স্মৃতিসৌধে পুষ্পস্তবক অর্পণ এবং দেশব্যাপী স্বাধীনতা দিবস পালন।",
        descriptionEn: "Placing wreaths at the National Martyrs' Memorial and celebrating Independence Day across the country.",
        category: "National",
        date: "মার্চ ২৬, ২০২৬",
        location: "জাতীয় স্মৃতিসৌধ, সাভার",
        imageUrl: "https://placehold.co/800x400/d3c2b1/000000?text=Independence+Day",
        volunteers: 120,
        going: 4000,
        helpful: 2800,
        createdAt: new Date(),
      },
    ];

    eventsData.forEach(event => this.events.set(event.id, event));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async upvoteProject(id: string): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (project) {
      const updatedProject = { ...project, upvotes: project.upvotes + 1 };
      this.projects.set(id, updatedProject);
      return updatedProject;
    }
    return undefined;
  }

  async getAllPolls(): Promise<Poll[]> {
    return Array.from(this.polls.values()).sort((a, b) => b.votes - a.votes);
  }

  async getPoll(id: string): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async voteForPoll(id: string): Promise<Poll | undefined> {
    const poll = this.polls.get(id);
    if (poll) {
      const updatedPoll = { ...poll, votes: poll.votes + 1 };
      this.polls.set(id, updatedPoll);
      return updatedPoll;
    }
    return undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    // Sort events by date
    return Array.from(this.events.values()).sort((a, b) => {
        // A simple date parsing logic for "Month Day, Year" format
        // This might need to be more robust depending on the actual date formats.
        const dateA = new Date(a.date.replace(/,/, '')).getTime();
        const dateB = new Date(b.date.replace(/,/, '')).getTime();
        return dateA - dateB;
    });
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async volunteerForEvent(id: string): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (event) {
      const updatedEvent = { ...event, volunteers: event.volunteers + 1 };
      this.events.set(id, updatedEvent);
      return updatedEvent;
    }
    return undefined;
  }

  async goingToEvent(id: string): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (event) {
      const updatedEvent = { ...event, going: event.going + 1 };
      this.events.set(id, updatedEvent);
      return updatedEvent;
    }
    return undefined;
  }

  async markEventHelpful(id: string): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (event) {
      const updatedEvent = { ...event, helpful: event.helpful + 1 };
      this.events.set(id, updatedEvent);
      return updatedEvent;
    }
    return undefined;
  }
}

class PgStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const rows = await db.insert(users).values(insertUser).returning();
    return rows[0];
  }

  async getAllProjects(): Promise<Project[]> {
    const rows = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
    return rows;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const rows = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    return rows[0];
  }

  async upvoteProject(id: string): Promise<Project | undefined> {
    const rows = await db
      .update(projectsTable)
      .set({ upvotes: dsql`${projectsTable.upvotes} + 1` as unknown as number })
      .where(eq(projectsTable.id, id))
      .returning();
    return rows[0];
  }

  async getAllPolls(): Promise<Poll[]> {
    const rows = await db.select().from(pollsTable).orderBy(desc(pollsTable.votes));
    return rows;
  }

  async getPoll(id: string): Promise<Poll | undefined> {
    const rows = await db.select().from(pollsTable).where(eq(pollsTable.id, id)).limit(1);
    return rows[0];
  }

  async voteForPoll(id: string): Promise<Poll | undefined> {
    const rows = await db
      .update(pollsTable)
      .set({ votes: dsql`${pollsTable.votes} + 1` as unknown as number })
      .where(eq(pollsTable.id, id))
      .returning();
    return rows[0];
  }

  async getAllEvents(): Promise<Event[]> {
    const rows = await db.select().from(eventsTable).orderBy(eventsTable.date);
    return rows;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const rows = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    return rows[0];
  }

  async volunteerForEvent(id: string): Promise<Event | undefined> {
    const rows = await db
      .update(eventsTable)
      .set({ volunteers: dsql`${eventsTable.volunteers} + 1` as unknown as number })
      .where(eq(eventsTable.id, id))
      .returning();
    return rows[0];
  }

  async goingToEvent(id: string): Promise<Event | undefined> {
    const rows = await db
      .update(eventsTable)
      .set({ going: dsql`${eventsTable.going} + 1` as unknown as number })
      .where(eq(eventsTable.id, id))
      .returning();
    return rows[0];
  }

  async markEventHelpful(id: string): Promise<Event | undefined> {
    const rows = await db
      .update(eventsTable)
      .set({ helpful: dsql`${eventsTable.helpful} + 1` as unknown as number })
      .where(eq(eventsTable.id, id))
      .returning();
    return rows[0];
  }
}

export const storage = process.env.DATABASE_URL ? new PgStorage() : new MemStorage();


