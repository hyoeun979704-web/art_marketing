import { ArtistForm } from "@/app/admin/_components/artist-form";

export const dynamic = "force-dynamic";

export default function NewArtistPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">새 작가</h1>
      <ArtistForm mode="create" />
    </div>
  );
}
