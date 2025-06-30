'use client';

import Script from 'next/script';

interface GoogleAdsenseProps {
  ADSENSE_CLIENT_ID: string;
}

export default function GoogleAdsense({ ADSENSE_CLIENT_ID }: GoogleAdsenseProps) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

// Ad unit component for display ads
interface AdUnitProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AdUnit({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
}: AdUnitProps) {
  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
      <Script
        id={`ad-${adSlot}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              try {
                (adsbygoogle = window.adsbygoogle || []).push({});
              } catch (error) {
                console.error('AdSense error:', error);
              }
            }
          `,
        }}
      />
    </div>
  );
}