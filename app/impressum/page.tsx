import type { Metadata } from 'next'
import { LegalPage, LegalSection, LegalPlaceholder } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Legal disclosure and provider identification for Drift.',
}

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum" lastUpdated="7 September 2026">
      <LegalPlaceholder>
        This page is a placeholder. Disclosure of the provider is legally required
        under §5 ECG (Austria) / §5 TMG (Germany) and must be completed with real
        details before launch.
      </LegalPlaceholder>

      <LegalSection heading="Provider">
        <p>
          [Legal entity name]
          <br />
          [Street address]
          <br />
          [Postal code, city]
          <br />
          [Country]
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Email: [contact email]
          <br />
          Phone: [phone number]
        </p>
      </LegalSection>

      <LegalSection heading="Company details">
        <p>
          Commercial register number: [if applicable]
          <br />
          Register court: [if applicable]
          <br />
          VAT identification number: [if applicable]
          <br />
          Regulatory authority: [if applicable]
        </p>
      </LegalSection>

      <LegalSection heading="Responsible for content">
        <p>[Name and address of the person responsible for editorial content]</p>
      </LegalSection>

      <LegalSection heading="Dispute resolution">
        <p>
          The European Commission provides a platform for online dispute
          resolution at{' '}
          <a
            href="https://ec.europa.eu/consumers/odr"
            className="underline underline-offset-4 hover:text-white"
            rel="noopener noreferrer"
            target="_blank"
          >
            ec.europa.eu/consumers/odr
          </a>
          . We are neither obliged nor willing to participate in dispute
          resolution proceedings before a consumer arbitration board.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
