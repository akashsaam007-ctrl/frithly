import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProofPageView } from "@/components/marketing/proof-page";
import { getProofPage, proofPages } from "@/lib/proof-pages";
import { buildPublicMetadata } from "@/lib/seo";

type ProofRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return proofPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: ProofRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getProofPage(slug);

  if (!page) {
    return {};
  }

  return buildPublicMetadata({
    description: page.description,
    keywords: [
      "outbound case study",
      "lead research proof page",
      "B2B sales intelligence proof",
      page.slug.replaceAll("-", " "),
    ],
    path: `/proof/${page.slug}`,
    title: `${page.title} | Frithly`,
  });
}

export default async function ProofPage({ params }: ProofRouteProps) {
  const { slug } = await params;
  const page = getProofPage(slug);

  if (!page) {
    notFound();
  }

  return <ProofPageView page={page} />;
}
