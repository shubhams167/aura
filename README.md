# Aura 📈

A modern, beautiful stock market dashboard built with Next.js 16, featuring real-time market insights and portfolio management.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **Beautiful UI** - Modern, premium design with glassmorphism effects and smooth animations
- **Dark/Light Mode** - System-aware theme switching with localStorage persistence
- **Authentication** - Login/Signup pages with email/password and OAuth (Google, Microsoft)
- **Form Validation** - Robust validation using React Hook Form + Zod
- **Responsive Design** - Fully responsive across desktop, tablet, and mobile
- **Error Handling** - Custom 404 and 500 error pages
- **shadcn/ui Components** - Beautiful, accessible UI components

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Fonts**: [Geist](https://vercel.com/font)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shubhams167/aura.git
   cd aura
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
aura/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── error.tsx          # Error boundary
│   ├── global-error.tsx   # Global error boundary
│   ├── not-found.tsx      # 404 page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── ui/                # shadcn/ui components
│   ├── navbar.tsx         # Navigation bar
│   ├── hero.tsx           # Hero section
│   ├── footer.tsx         # Footer
│   ├── logo.tsx           # Animated logo
│   └── ...
├── lib/                   # Utility functions
│   ├── utils.ts           # Helper utilities
│   └── validations/       # Zod schemas
└── public/                # Static assets
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎨 Customization

### Theme Colors

The app uses a custom emerald/teal color palette. You can customize colors in `app/globals.css`:

```css
:root {
  --primary: oklch(0.21 0.006 285.885);
  /* ... other variables */
}
```

### Adding Components

Add new shadcn/ui components using:

```bash
npx shadcn@latest add <component-name>
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shubham Singh**

- GitHub: [@shubhams167](https://github.com/shubhams167)

---

<p align="center">
  Made with ❤️ using Next.js and shadcn/ui
</p>
