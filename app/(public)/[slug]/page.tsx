import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntentGuidePage } from "@/components/marketing/intent-guide-page";
import { getIntentGuide, intentGuides } from "@/lib/intent-guides";
import { buildPublicMetadata } from "@/lib/seo";

type IntentGuideRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return intentGuides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: IntentGuideRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getIntentGuide(slug);

  if (!guide) {
    return {};
  }

  return buildPublicMetadata({
    description: guide.description,
    keywords: [
      guide.kicker,
      guide.slug.replace(/-/g, " "),
      "Frithly",
      "B2B sales intelligence",
    ],
    path: `/${guide.slug}`,
    title: `${guide.title} | Frithly`,
  });
}

export default async function IntentGuideRoute({ params }: IntentGuideRouteProps) {
  const { slug } = await params;
  const guide = getIntentGuide(slug);

  if (!guide) {
    notFound();
  }

  return <IntentGuidePage guide={guide} />;
}
