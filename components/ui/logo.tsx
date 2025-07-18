import Link from "next/link";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center w-full text-center ${className}`}>
      <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity mb-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-orange-600 tracking-tight">
          rSearch
        </h1>
      </Link>
    </div>
  );
} 