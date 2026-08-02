import { Leaf } from "lucide-react";
import { useSettings } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  logoOnly?: boolean;
};

export function BrandMark({ className, logoClassName = "h-8 sm:h-9", textClassName }: Props) {
  const settings = useSettings();
  const name = settings.storeName || "PUREBENGAL";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      {settings.logoUrl ? (
        <span className={cn("shrink-0 overflow-hidden rounded-md", logoClassName)}>
          <img src={settings.logoUrl} alt={name} className="h-full w-full object-cover" />
        </span>
      ) : (
        <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B2E13] text-[#7CB342] shadow-xs">
          <Leaf className="h-5 w-5 fill-[#7CB342]/20" />
        </span>
      )}
      <div className="flex flex-col justify-center min-w-0">
        <span
          className={cn(
            "truncate text-base sm:text-lg font-black tracking-tight text-[#0B2E13] uppercase leading-none dark:text-white",
            textClassName,
          )}
        >
          {name}
        </span>
        <span className="text-[9px] font-bold tracking-widest text-[#7CB342] uppercase leading-tight">
          NATURE'S GOODNESS
        </span>
      </div>
    </span>
  );
}

export function useStoreName() {
  return useSettings().storeName;
}
