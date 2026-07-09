# InvoicePro

**Generate professional invoices in minutes.**

InvoicePro is a full-stack invoicing application built with vanilla HTML, CSS, and JavaScript, powered by Supabase for authentication and data management. It is designed for freelancers and small businesses who need a simple, reliable way to create, send, and track invoices.

**Live Demo:** [invoice-pro-saas.netlify.app](https://invoice-pro-saas.netlify.app/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

---

## Screenshots

| Landing Page | Dashboard | Invoice Preview |
|---|---|---|
| *Add screenshot* | *Add screenshot* | *Add screenshot* |

---

## Features

### For Users

| Feature | Description |
|---|---|
| Create Invoices | Enter client details, hours, and rate — the total is calculated automatically |
| Download PDF | Generate a professional invoice PDF with one click |
| Track Status | Follow invoices through Draft, Sent, and Paid stages |
| Dark Mode | Toggle between light and dark themes |
| Email Invoices | Send invoices directly to clients |
| Mark as Sent | Update invoice status instantly |
| Mobile Responsive | Fully usable on any device |

### Admin Features

| Feature | Description |
|---|---|
| Secure Login | Email/password authentication plus Google OAuth |
| Dashboard | View all invoices along with summary statistics |
| CRUD Operations | Create, read, update, and delete invoices |
| Profile Management | Update account name and password |
| Responsive Admin Panel | Fully functional on mobile devices |

### Security

| Feature | Description |
|---|---|
| Row Level Security | Ensures users can only access their own data |
| Authentication | Secure login handled via Supabase Auth |
| Protected Routes | Dashboard and admin pages require authentication |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + Google OAuth |
| PDF Generation | html2pdf.js |
| Hosting | Netlify |
| Version Control | Git + GitHub |
| Fonts | Google Fonts (Inter) |

---

## Project Structure

```
Invoice generator/
├── index.html              # Landing page
├── login.html               # Login page
├── signup.html               # Signup page
├── dashboard.html             # User dashboard
├── new-invoice.html            # Create invoice
├── edit-invoice.html            # Edit invoice
├── invoice-preview.html          # Invoice preview / PDF
├── profile.html               # User profile
├── about.html                # About page
├── contact.html               # Contact page
├── privacy.html               # Privacy policy
├── terms.html                # Terms of service
├── 404.html                  # Custom 404 page
├── admin.html                 # Admin panel
│
├── css/
│   ├── style.css              # Main styles
│   └── admin.css              # Admin styles
│
├── js/
│   ├── supabase-client.js       # Supabase connection
│   ├── auth.js                # Authentication logic
│   ├── invoices.js             # Invoice CRUD operations
│   ├── dashboard.js             # Dashboard rendering
│   ├── new-invoice.js            # Create invoice logic
│   ├── edit-invoice.js           # Edit invoice logic
│   ├── preview.js              # Invoice preview logic
│   ├── profile.js              # Profile management
│   ├── utils.js               # Shared utilities
│   └── transitions.js           # Page transitions
│
├── assets/
│   └── images/                # Image assets
│
├── .env                     # Environment variables (not committed)
├── .env.example                # Environment variables template
├── .gitignore                 # Git ignore rules
├── netlify.toml                # Netlify deployment config
└── README.md                  # Project documentation
```

---

## Getting Started

### Prerequisites

| Requirement | Description |
|---|---|
| Supabase Account | Free tier is sufficient |
| Netlify Account | Required for deployment |
| Git | Required for version control |
| VS Code | Recommended editor |

### 1. Clone the Repository

```bash
git clone https://github.com/almuyed-saad/invoicepro-saas.git
cd invoicepro-saas
```

### 2. Set Up Supabase

Create a new Supabase project, then run the following SQL to create the `invoices` table:

```sql
CREATE TABLE invoices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  project TEXT,
  hours DECIMAL(10,2),
  rate DECIMAL(10,2),
  total DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own invoices"
ON invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
ON invoices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
ON invoices FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON invoices FOR DELETE
USING (auth.uid() = user_id);
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
APP_URL=http://localhost:5500
```

### 4. Run Locally

1. Open the project in VS Code
2. Right-click `index.html` and select "Open with Live Server"
3. Visit `http://localhost:5500`

---

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click **Add new site** → **Import from GitHub**
4. Select your repository
5. Configure the following settings:

   | Setting | Value |
   |---|---|
   | Branch | `main` |
   | Build command | *(leave empty)* |
   | Publish directory | `.` |

6. Add the required environment variables:

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | Your Supabase anon key |

7. Click **Deploy**

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `APP_URL` | Your app URL, used for redirects | No |

---

## Database Schema

### Invoices Table

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key, auto-increment |
| `user_id` | UUID | References `auth.users` |
| `client_name` | TEXT | Client's name |
| `client_email` | TEXT | Client's email |
| `project` | TEXT | Project description |
| `hours` | DECIMAL | Hours worked |
| `rate` | DECIMAL | Rate per hour |
| `total` | DECIMAL | Auto-calculated total |
| `status` | TEXT | `draft`, `sent`, or `paid` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Almuyed Saad**

- GitHub: [@almuyed-saad](https://github.com/almuyed-saad)
- Portfolio: [almuyed-saad.netlify.app](https://almuyed-saad.netlify.app)
- Email: iamsaad236@gmail.com

---

## Acknowledgments

- Built with [Supabase](https://supabase.com)
- Hosted on [Netlify](https://netlify.com)
- Fonts from [Google Fonts](https://fonts.google.com)

---

If you found this project useful, please consider giving it a star on GitHub.
