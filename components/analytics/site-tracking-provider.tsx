"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureEvent } from "@/lib/monitoring/posthog";

const SCROLL_MILESTONES = [25, 50, 75, 90] as const;
const DOWNLOAD_EXTENSIONS = [".pdf", ".csv", ".xlsx", ".docx", ".zip"] as const;

function getElementLabel(element: Element) {
  const explicitLabel =
    element.getAttribute("data-track-label") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("title");

  if (explicitLabel) {
    return explicitLabel.trim().slice(0, 120);
  }

  return (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120);
}

function isDownloadHref(href: string) {
  const normalizedHref = href.split("?")[0]?.toLowerCase() ?? "";
  return DOWNLOAD_EXTENSIONS.some((extension) => normalizedHref.endsWith(extension));
}

export function SiteTrackingProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const reachedMilestones = new Set<number>();

    function handleScroll() {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (documentHeight <= 0) {
        return;
      }

      const scrollDepth = Math.round((window.scrollY / documentHeight) * 100);
      const nextMilestone = SCROLL_MILESTONES.find(
        (milestone) => scrollDepth >= milestone && !reachedMilestones.has(milestone),
      );

      if (!nextMilestone) {
        return;
      }

      reachedMilestones.add(nextMilestone);
      captureEvent("scroll_depth_reached", {
        path: pathname,
        scroll_depth: nextMilestone,
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;

      if (!target) {
        return;
      }

      const actionableElement = target.closest<HTMLElement>("a, button, [role='button']");

      if (!actionableElement) {
        return;
      }

      const label = getElementLabel(actionableElement);
      const trackingSection =
        actionableElement.getAttribute("data-track-section") ||
        actionableElement.closest<HTMLElement>("[data-track-section]")?.getAttribute("data-track-section") ||
        undefined;

      if (actionableElement instanceof HTMLAnchorElement) {
        const href = actionableElement.href;
        const url = href ? new URL(href, window.location.href) : null;
        const isExternal = Boolean(url && url.origin !== window.location.origin);
        const downloadClicked =
          actionableElement.hasAttribute("download") || (url ? isDownloadHref(url.pathname) : false);

        if (downloadClicked) {
          captureEvent("file_download_clicked", {
            href: url?.pathname ?? href,
            label,
            path: pathname,
            section: trackingSection,
          });
          return;
        }

        if (isExternal) {
          captureEvent("outbound_link_clicked", {
            destination_host: url?.host,
            href: url?.href,
            label,
            path: pathname,
            section: trackingSection,
          });
          return;
        }
      }

      captureEvent("cta_clicked", {
        element_type: actionableElement.tagName.toLowerCase(),
        label,
        path: pathname,
        section: trackingSection,
      });
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  return null;
}
