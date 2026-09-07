import type { Metadata } from 'next'
import { LegalPage, LegalSection, LegalPlaceholder } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of Drift.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="7 September 2026">
      <LegalPlaceholder>
        Draft for review. The structure reflects how the platform actually works,
        but the governing law, liability, and termination clauses must be
        confirmed by a qualified professional before launch.
      </LegalPlaceholder>

      <LegalSection heading="Acceptance">
        <p>
          By creating an account or using Drift, you agree to these terms. If you
          do not agree, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection heading="Accounts and roles">
        <p>
          You must provide accurate information and keep your credentials secure.
          Every account starts as a fan account. Artist, promoter, and venue owner
          roles are granted only through our verification process, and we may
          decline or revoke a role where the supporting evidence is insufficient.
        </p>
        <p>
          You are responsible for all activity under your account.
        </p>
      </LegalSection>

      <LegalSection heading="Your content">
        <p>
          You retain ownership of the reviews, listings, images, and messages you
          submit. You grant us a non-exclusive, worldwide licence to host,
          display, and distribute that content for the purpose of operating and
          promoting the service.
        </p>
        <p>
          You confirm that you hold the necessary rights to everything you upload,
          including images of venues, events, and performers.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>post unlawful, hateful, harassing, or deliberately misleading content</li>
          <li>submit reviews you know to be false, or manipulate ratings</li>
          <li>impersonate another person, artist, venue, or organisation</li>
          <li>upload malware or attempt to disrupt or probe the service</li>
          <li>scrape or bulk-extract content without our written permission</li>
          <li>use the service to send unsolicited promotional messages</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Moderation">
        <p>
          Content may be checked automatically before publication and reviewed by
          our team afterwards. We may remove content or suspend accounts that
          breach these terms. Where we take action against your content, we will
          tell you the reason and you may ask us to reconsider.
        </p>
      </LegalSection>

      <LegalSection heading="Reviews and ratings">
        <p>
          Reviews must reflect genuine first-hand experience. We do not accept
          payment for favourable reviews, and venues, artists, and promoters may
          not review their own listings or those of direct competitors.
        </p>
      </LegalSection>

      <LegalSection heading="Availability">
        <p>
          The service is provided on an &ldquo;as is&rdquo; basis. We do not
          guarantee uninterrupted availability and may change or discontinue
          features. We will give reasonable notice of material changes where we
          can.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          [Liability limitations, to be drafted for the applicable jurisdiction.
          Note that statutory consumer rights under EU and national law cannot be
          excluded.]
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          You may delete your account at any time from your account settings. We
          may suspend or terminate accounts that seriously or repeatedly breach
          these terms.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and governing law">
        <p>
          We may update these terms and will post the revised version here with a
          new date. Continued use after a change means you accept the updated
          terms. [Specify governing law and competent courts.]
        </p>
      </LegalSection>
    </LegalPage>
  )
}
