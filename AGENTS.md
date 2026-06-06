<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:global-rules -->
# Global Engineering Rules — Auto-loaded via ~/.config/opencode/skills/global-rules/SKILL.md

All projects follow the same premium production standards:
- **Design**: Apple-level polish, Linear-inspired, Vercel simplicity, Stripe professionalism
- **Animations**: Framer Motion + GSAP + Lenis (GPU-accelerated, meaningful motion)
- **UI**: shadcn/ui Nova style, TailwindCSS v4, Lucide icons
- **Backend**: Supabase, PostgreSQL, Node.js, secure APIs
- **Code**: Type-safe, production-ready, no placeholders

## Shared Kit

Use `prism-kit` npm package for reusable components across all projects:
```bash
npm install prism-kit
```

Exports:
- Animation variants (fadeIn, fadeInUp, staggerContainer, scaleIn, etc.)
- Pre-typed motion components (MotionDiv, MotionSection, etc.)
- `cn()` utility (clsx + tailwind-merge)
- Design tokens (darkTheme, lightTheme)

## Animation Reference Library

For advanced animation patterns, sliders, and hooks, reference the animation library at:
`prism-animations/src/`

| Path | Contents |
|------|----------|
| `variants/` | 9 categories of animation variants (entry, scale, slide, stagger, scroll, text, hover, page, micro) |
| `sliders/` | HorizontalCarousel, SnapSlider, InfiniteSlider |
| `components/` | AnimatedSection, FadeInView, GlassCard, StaggerGrid, ParallaxSection, TextReveal, Typewriter, CountingNumber, MagneticButton, TiltCard, GradientText, LoadingScreen |
| `hooks/` | useInView, useScrollProgress, useParallax, useCountUp, useDraggable, useMousePosition |
| `utils/` | cn(), easing curves |
| `motion/` | Pre-typed motion components |

Tell AI to read files from this library as a reference for consistent animation patterns.
<!-- END:global-rules -->
