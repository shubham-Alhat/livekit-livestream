export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("stream Id : ", id);

  return (
    <>
      <div>
        <div>dashboard live</div>
      </div>
    </>
  );
}
