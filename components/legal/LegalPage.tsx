import { H1 } from '@/components/ui/typography'

interface LegalPageProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

/**
 * Shared shell for the legal pages. Narrower than the content pages because
 * these are long-form prose - line length matters more than grid width here.
 */
export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-24">
        <H1 variant="display" className="mb-4">
          {title}
        </H1>

        <p className="text-sm text-white/50 mb-16">Last updated: {lastUpdated}</p>

        <div className="space-y-12">{children}</div>
      </div>
    </div>
  )
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight mb-4">{heading}</h2>
      <div className="space-y-4 text-white/70 leading-7">{children}</div>
    </section>
  )
}

/**
 * Marks copy that still needs review by a qualified professional. Deliberately
 * visible: shipping placeholder legal text unnoticed is worse than an ugly page.
 */
export function LegalPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-amber-500/50 pl-4 text-amber-200/80">
      {children}
    </p>
  )
}
