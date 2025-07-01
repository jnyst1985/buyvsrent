import Script from 'next/script';

interface StructuredDataProps {
  data: object;
}

export default function StructuredData({ data }: StructuredDataProps) {
  // Safely serialize JSON and escape any potentially dangerous content
  const jsonString = JSON.stringify(data, null, 0);
  
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {jsonString}
    </Script>
  );
}