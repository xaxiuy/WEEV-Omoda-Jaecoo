# WEEV - Brand Community Platform

WEEV is a modern brand community platform that connects users with their favorite brands, enabling exclusive benefits, events, and member experiences.

## Features

- **User Authentication** - Secure sign-up and login with Supabase
- **Brand Communities** - Join and interact with multiple brand communities
- **Events Management** - Discover and RSVP to exclusive brand events
- **Digital Wallet** - Manage loyalty cards and member benefits
- **Social Feed** - Share experiences and connect with other members
- **Real-time Chat** - Get instant support from brand teams
- **Brand Dashboard** - Full analytics and management panel for brand admins

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── react-app/           # React frontend
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   └── lib/            # Utility functions
├── worker/             # Cloudflare Worker API
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth and CORS middleware
│   └── lib/            # Database and utility functions
└── shared/             # Shared types and interfaces
```

## Available Pages

- `/` - Home page
- `/login` - User login
- `/signup` - User registration
- `/profile` - User profile management
- `/dashboard` - User dashboard
- `/events` - Browse and RSVP to events
- `/wallet` - Digital wallet and loyalty cards
- `/feed` - Social feed
- `/chat` - Chat support
- `/brand` - Brand dashboard (for brand admins)
- `/admin` - Admin panel (for super admins)

## Development

### Code Organization

- All components use TypeScript
- Tailwind CSS for styling
- Mobile-first responsive design
- Lucide React for icons

### Authentication

This app uses Supabase for authentication. Update your Supabase credentials in `src/supabaseClient.ts`

## Deployment

The app is designed for deployment on Cloudflare Pages + Cloudflare Workers.

Refer to `SETUP.md` for detailed deployment instructions.

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Built with ❤️ using React, Cloudflare, and Supabase**
