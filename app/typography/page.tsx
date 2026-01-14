import {
  H1,
  H2,
  H3,
  H4,
  P,
  Lead,
  Large,
  Small,
  Muted,
  Blockquote,
  InlineCode,
  List,
} from "@/components/ui/typography";

export default function TypographyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12">
        <H1>Typography System</H1>
        <Lead>
          A comprehensive typography system using Geist Sans and shadcn/ui patterns.
          All components follow consistent spacing, sizing, and color standards.
        </Lead>
      </div>

      <div className="space-y-16">
        {/* Headings Section */}
        <section>
          <H2>Headings</H2>
          <div className="space-y-6 mt-6">
            <div>
              <Small className="text-muted-foreground mb-2 block">H1 - Large page titles</Small>
              <H1>The quick brown fox jumps over the lazy dog</H1>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">H2 - Section headings</Small>
              <H2>The quick brown fox jumps over the lazy dog</H2>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">H3 - Subsection headings</Small>
              <H3>The quick brown fox jumps over the lazy dog</H3>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">H4 - Card/component titles</Small>
              <H4>The quick brown fox jumps over the lazy dog</H4>
            </div>
          </div>
        </section>

        {/* Body Text Section */}
        <section>
          <H2>Body Text</H2>
          <div className="space-y-6 mt-6">
            <div>
              <Small className="text-muted-foreground mb-2 block">Paragraph - Standard body text</Small>
              <P>
                This is a standard paragraph with proper line height and spacing. It demonstrates how body text should appear across the application. The leading and margin spacing ensure optimal readability.
              </P>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">Lead - Introduction/highlight text</Small>
              <Lead>
                This is lead text, typically used for introductions or highlighting important information at the start of a section.
              </Lead>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">Large - Emphasized text</Small>
              <Large>
                This is large text for emphasis and callouts.
              </Large>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">Small - Secondary/supporting text</Small>
              <Small>This is small text for secondary information, captions, or footnotes.</Small>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">Muted - De-emphasized text</Small>
              <Muted>
                This is muted text with reduced visual emphasis, ideal for helper text or less important information.
              </Muted>
            </div>
          </div>
        </section>

        {/* Special Elements Section */}
        <section>
          <H2>Special Elements</H2>
          <div className="space-y-6 mt-6">
            <div>
              <Small className="text-muted-foreground mb-2 block">Blockquote</Small>
              <Blockquote>
                "Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs
              </Blockquote>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">Inline Code</Small>
              <P>
                Use the <InlineCode>className</InlineCode> prop to customize component styles.
                Components accept standard HTML attributes like <InlineCode>id</InlineCode> and <InlineCode>data-*</InlineCode>.
              </P>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">Unordered List</Small>
              <List>
                <li>First item in the list</li>
                <li>Second item with more content to demonstrate wrapping</li>
                <li>Third item</li>
                <li>Fourth item</li>
              </List>
            </div>
            <div>
              <Small className="text-muted-foreground mb-2 block">Ordered List</Small>
              <List ordered>
                <li>First step in the process</li>
                <li>Second step with detailed instructions</li>
                <li>Third step</li>
                <li>Final step</li>
              </List>
            </div>
          </div>
        </section>

        {/* Usage Section */}
        <section>
          <H2>Usage</H2>
          <P>
            Import typography components from <InlineCode>@/components/ui/typography</InlineCode>:
          </P>
          <div className="bg-muted rounded-lg p-4 mt-4 font-mono text-sm">
            <code className="text-foreground">
              {`import { H1, H2, P, Lead } from "@/components/ui/typography";`}
            </code>
          </div>
          <P>
            All components accept standard HTML attributes and support className for custom styling:
          </P>
          <div className="bg-muted rounded-lg p-4 mt-4 font-mono text-sm">
            <code className="text-foreground">
              {`<H1 className="text-blue-500">Custom Heading</H1>
<P className="max-w-prose">Paragraph with width constraint</P>`}
            </code>
          </div>
        </section>

        {/* Best Practices Section */}
        <section>
          <H2>Best Practices</H2>
          <List>
            <li>Use semantic HTML hierarchy (H1 → H2 → H3 → H4)</li>
            <li>Only one H1 per page</li>
            <li>Don't skip heading levels</li>
            <li>Use Lead for page/section introductions</li>
            <li>Use Muted for de-emphasized content</li>
            <li>Prefer typography components over custom styles</li>
            <li>Use InlineCode for technical references</li>
            <li>Keep line lengths readable (max-w-prose for long text)</li>
          </List>
        </section>
      </div>
    </div>
  );
}
