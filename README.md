# CivicMoncho 🏛️

A comprehensive civic engagement platform that empowers citizens to participate in democratic processes, vote on community projects, and engage with local governance through a modern, bilingual web application.

![CivicMoncho Banner](https://img.shields.io/badge/CivicMoncho-Civic%20Engagement-blue?style=for-the-badge&logo=democracy&logoColor=white)

## 🌟 Features

### 🗳️ Democratic Participation
- **Project Voting**: Citizens can vote on community development projects
- **Event Participation**: Join community events as volunteers or attendees
- **Polling System**: Participate in community polls and surveys
- **Discussion Threads**: Engage in civic discussions and debates

### 👥 User Management
- **Dual Role System**: Separate interfaces for citizens and government officials
- **Account Approval**: Government officials approve citizen registrations
- **Profile Management**: Comprehensive user profiles with address verification
- **Authentication**: Secure login system with session management

### 🌐 Multilingual Support
- **Bengali & English**: Full bilingual support throughout the application
- **Dynamic Language Switching**: Toggle between languages seamlessly
- **Localized Content**: All content available in both languages

### 📊 Project Management
- **Project Proposals**: Government officials can create and manage projects
- **Category Filtering**: Projects organized by categories (Infrastructure, Education, Environment, etc.)
- **Budget Tracking**: Display project budgets and funding information
- **Status Updates**: Track project progress and completion

### 🎯 Event Management
- **Event Creation**: Government officials can create community events
- **Volunteer Registration**: Citizens can volunteer for events
- **Attendance Tracking**: Track event participation and engagement
- **Certificate Generation**: Automatic certificate generation for participants

### 🔔 Notification System
- **Targeted Notifications**: Send notifications to specific areas (thana-level or countrywide)
- **Read Status Tracking**: Track notification read status
- **Government Communications**: Official announcements and updates

### 📱 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Adaptive theming with system preferences
- **Interactive Components**: Modern UI components with smooth animations
- **Accessibility**: Built with accessibility best practices

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Wouter** - Lightweight routing solution
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database
- **Neon Database** - Serverless PostgreSQL hosting

### Authentication & Security
- **Passport.js** - Authentication middleware
- **Express Sessions** - Session management
- **bcrypt** - Password hashing
- **Zod** - Runtime type validation

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - Fast JavaScript bundler
- **Drizzle Kit** - Database migrations and introspection
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Neon account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/civicmoncho.git
   cd civicmoncho
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret_key
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Push database schema
   npm run db:push
   
   # Seed the database with initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000` to see the application.

## 📁 Project Structure

```
civicmoncho/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── ui/            # UI component library
├── server/                # Backend Express application
│   ├── routes.ts          # API route handlers
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   └── certificateGenerator.ts # Certificate generation
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and types
├── dist/                  # Production build output
└── public/                # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with initial data

## 🌍 Deployment

The application is designed to be deployed on modern cloud platforms. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:

- **Vercel** (Recommended)
- **Render**
- **Railway**
- **Heroku**

### Environment Variables for Production
```env
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_secure_session_secret
NODE_ENV=production
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users** - Citizen and government user accounts
- **Projects** - Community development projects
- **Events** - Community events and activities
- **Threads** - Discussion forums
- **Notifications** - Government announcements
- **Votes** - Project voting records
- **Participation** - Event participation tracking

## 🔐 User Roles

### Citizen Users
- Vote on community projects
- Participate in events (volunteer/attend)
- Create discussion threads
- Receive notifications
- View project and event details

### Government Users
- Create and manage projects
- Create and manage events
- Approve citizen registrations
- Send targeted notifications
- Manage community content

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/top` - Get top projects
- `POST /api/projects` - Create project (government only)
- `POST /api/projects/:id/upvote` - Vote on project

### Events
- `GET /api/events` - Get all events
- `GET /api/events/top` - Get top events
- `POST /api/events` - Create event (government only)
- `POST /api/events/:id/volunteer` - Volunteer for event
- `POST /api/events/:id/going` - Mark as going to event

### Threads
- `GET /api/threads` - Get discussion threads
- `POST /api/threads` - Create thread
- `POST /api/threads/:id/comments` - Add comment

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **Drizzle ORM** - For type-safe database operations
- **React Community** - For the amazing ecosystem

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@civicmoncho.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/civicmoncho/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/civicmoncho/wiki)

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with government systems
- [ ] Multi-language support expansion
- [ ] Real-time notifications
- [ ] Advanced reporting features

---

**CivicMoncho** - Empowering citizens through digital democracy 🏛️✨
