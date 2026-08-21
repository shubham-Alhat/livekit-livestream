import { LivestreamCard } from "@/components/live-stream-card";
import { LoginForm } from "@/components/login-page";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function Home() {
  const res = await getSession();

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="flex">
          <main className="flex-1 p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Live streams
              </h1>
              <p className="text-muted-foreground">
                Explore your favourite streamers here..
              </p>
            </div>

            {/* Grid of Auction Cards */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <LivestreamCard key={crypto.randomUUID()} />
            </div>
          </main>
        </div>
        {/* login pop up */}
        {!res && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4">
              <LoginForm />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
