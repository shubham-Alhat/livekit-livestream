import { getAllLiveAuctions } from "@/actions/show";
import { LivestreamCard } from "@/components/live-stream-card";
import { LoginForm } from "@/components/login-page";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/dal";

export default async function Home() {
  const res = await getSession();
  const liveAuctions = await getAllLiveAuctions();

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
            {!liveAuctions.success ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-foreground">
                  Something went wrong
                </p>
                <p className="text-muted-foreground mt-1">
                  {liveAuctions.message}
                </p>
              </div>
            ) : liveAuctions && liveAuctions.data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-foreground">
                  No live auctions right now
                </p>
                <p className="text-muted-foreground mt-1">
                  Check back later or explore past auctions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {liveAuctions.data &&
                  liveAuctions.data.map((show) => (
                    <LivestreamCard key={show.id} show={show} />
                  ))}
              </div>
            )}
          </main>
        </div>

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
