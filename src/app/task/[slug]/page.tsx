import { TaskPageClient } from "./TaskPageClient";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TaskPageClient slug={slug} />;
}
