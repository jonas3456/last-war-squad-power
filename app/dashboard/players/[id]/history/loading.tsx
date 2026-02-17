import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-32" />
        </div>
      </div>
      <Skeleton className="h-[350px]" />
      <Skeleton className="h-64" />
    </div>
  );
}
