import Link from "next/link";

export function LegalFooter() {
  return (
    <nav
      aria-label="Footer links"
      className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
    >
      <Link href="/privacy" className="font-medium text-primary hover:underline">
        Privacy Policy
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/terms" className="font-medium text-primary hover:underline">
        Terms of Service
      </Link>
      <span aria-hidden="true">·</span>
      <a
        href="https://www.linkedin.com/in/junghyunhao/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary hover:underline"
      >
        Contact
      </a>
    </nav>
  );
}
