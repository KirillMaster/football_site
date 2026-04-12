// JsonLd — renders a JSON-LD <script> tag for structured data.
// Always rendered server-side; dangerouslySetInnerHTML is safe here because
// data is constructed from trusted server values, never from user input.

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
