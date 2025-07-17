import { notFound } from "next/navigation";
import staticData from "@/data/static.json";
import { Logo } from "@/components/ui/logo";

type StaticPage = "terms" | "privacy" | "about";

export async function generateStaticParams() {
  return [
    { page: "terms" },
    { page: "privacy" },
    { page: "about" },
  ];
}

export default async function StaticPage({ 
  params 
}: { 
  params: Promise<{ page: StaticPage }> 
}) {
  const resolvedParams = await params;
  const pageData = staticData[resolvedParams.page];

  if (!pageData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          <Logo />
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-8">
          {pageData.title}
        </h1>
        
        {"lastUpdated" in pageData && (
          <p className="text-orange-500/60 dark:text-orange-400/60 mb-8 ">
            Last updated: {pageData.lastUpdated}
          </p>
        )}

        <div className="space-y-8">
          {pageData.sections.map((section: { heading: string; content: string }) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                {section.heading}
              </h2>
                              <p className="text-foreground leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
