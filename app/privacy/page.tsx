import type { Metadata } from 'next'
import { LegalPage, LegalSection, LegalPlaceholder } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Drift collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="7 September 2026">
      <LegalPlaceholder>
        Draft for review. The processing activities and processors below reflect
        what the application actually does, but the controller details, legal
        bases, and retention periods must be confirmed by a qualified
        professional before launch.
      </LegalPlaceholder>

      <LegalSection heading="Controller">
        <p>
          [Legal entity name, address, and contact email of the data controller].
          See our <a href="/impressum" className="underline underline-offset-4 hover:text-white">Impressum</a> for
          provider identification.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>
          <strong className="text-white/90">Account data.</strong> Email address,
          display name, and role. Provided when you register, or received from
          Google if you sign in with a Google account.
        </p>
        <p>
          <strong className="text-white/90">Profile data.</strong> Avatar image,
          biography, location, genre preferences, and social media links —
          whatever you choose to add.
        </p>
        <p>
          <strong className="text-white/90">Content you create.</strong> Reviews
          and ratings, favourites, venue, event and artist listings, and direct
          messages to other users.
        </p>
        <p>
          <strong className="text-white/90">Verification data.</strong> If you
          apply for an artist, promoter, or venue owner role, the documents and
          links you submit in support of that application.
        </p>
        <p>
          <strong className="text-white/90">Usage data.</strong> Activity records
          and profile view counts used to operate the platform, plus server logs.
        </p>
      </LegalSection>

      <LegalSection heading="Why we process it">
        <p>
          To provide the service and perform our contract with you (Art. 6(1)(b)
          GDPR): account creation, authentication, publishing your content, and
          delivering messages.
        </p>
        <p>
          On the basis of legitimate interests (Art. 6(1)(f) GDPR): keeping the
          platform safe, moderating content, preventing abuse and spam, and
          understanding aggregate usage.
        </p>
        <p>
          On the basis of consent (Art. 6(1)(a) GDPR), where applicable: optional
          cookies and any marketing communications. You may withdraw consent at
          any time.
        </p>
      </LegalSection>

      <LegalSection heading="Automated content moderation">
        <p>
          Images and text you upload may be sent to OpenAI for automated
          moderation before publication, to detect content that breaches our
          rules. This check informs whether content is published; it does not
          produce legal effects concerning you. You can contact us to have any
          moderation decision reviewed by a person.
        </p>
      </LegalSection>

      <LegalSection heading="Processors and recipients">
        <p>
          <strong className="text-white/90">Supabase</strong> — database,
          authentication, and file storage.
        </p>
        <p>
          <strong className="text-white/90">Vercel</strong> — application hosting
          and delivery.
        </p>
        <p>
          <strong className="text-white/90">OpenAI</strong> — automated content
          moderation, as described above.
        </p>
        <p>
          <strong className="text-white/90">Mapbox</strong> — rendering venue
          maps.
        </p>
        <p>
          <strong className="text-white/90">Google</strong> — only if you choose
          to sign in with a Google account.
        </p>
        <LegalPlaceholder>
          Confirm the hosting regions for each processor and complete the
          international transfer section below accordingly.
        </LegalPlaceholder>
      </LegalSection>

      <LegalSection heading="International transfers">
        <p>
          Some processors listed above may process data outside the European
          Economic Area. Where that is the case, transfers are made under the
          European Commission&apos;s Standard Contractual Clauses or another valid
          transfer mechanism. [Confirm and list per processor.]
        </p>
      </LegalSection>

      <LegalSection heading="Retention">
        <p>
          Account and profile data are kept for as long as your account exists.
          When you delete your account, personal data is erased and content you
          published is either removed or anonymised. Server logs are kept for a
          limited period for security purposes. [Confirm exact periods.]
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          Under the GDPR you have the right to access your data, to rectify it,
          to erase it, to restrict or object to processing, and to data
          portability. You can export your data and delete your account from your
          account settings, or contact us to exercise any of these rights.
        </p>
        <p>
          You also have the right to lodge a complaint with a supervisory
          authority. [Name the competent authority for your jurisdiction.]
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We use cookies that are strictly necessary to keep you signed in and to
          keep the service secure. These do not require consent. Any optional
          analytics or marketing cookies are only set if you agree, and you can
          change your choice at any time.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          For any privacy question or to exercise your rights, contact
          [privacy contact email].
        </p>
      </LegalSection>
    </LegalPage>
  )
}
