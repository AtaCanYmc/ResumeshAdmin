import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  url?: string;
  image?: string;
  twitterHandle?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  name = "Ata Can Yaymacı",
  type = "website",
  url = "https://resumesh.dev",
  image = "https://resumesh.dev/images/profile_pic.jpeg",
  twitterHandle = "@x",
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "url": url,
    "image": image,
    "sameAs": [
      "https://github.com/atacan",
      "https://linkedin.com/in/atacanyucel",
      "https://twitter.com/atacanyucel"
    ],
    "jobTitle": "Full Stack Software Engineer"
  };
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook / LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ResuMesh" />

      {/* Twitter (X) tags */}
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
