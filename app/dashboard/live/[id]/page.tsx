import DashboardPage from "@/components/dashboard-page";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("stream Id : ", id);

  return (
    <>
      <DashboardPage />
    </>
  );
}
