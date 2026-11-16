import Link from "next/link";

/** Viewfinder corners around a record dot, in one solid color. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`size-5 text-primary ${className}`}
    >
      <path
        d="M1.75 6V2.75a1 1 0 0 1 1-1H6M14 1.75h3.25a1 1 0 0 1 1 1V6M18.25 14v3.25a1 1 0 0 1-1 1H14M6 18.25H2.75a1 1 0 0 1-1-1V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}

export default function Logo({
  href = "/",
  onClick,
}: {
  href?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md text-[17px] font-medium leading-none text-base-content"
      aria-label="Frameflow home"
    >
      <LogoMark />
      Frameflow
    </Link>
  );
}
