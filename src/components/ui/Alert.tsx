import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

export function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border p-4 text-sm",
        {
          "border-blue-200 bg-blue-50 text-blue-800": variant === "info",
          "border-green-200 bg-green-50 text-green-800": variant === "success",
          "border-yellow-200 bg-yellow-50 text-yellow-800": variant === "warning",
          "border-red-200 bg-red-50 text-red-800": variant === "danger",
        },
        className
      )}
      {...props}
    >
      {title && <p className="font-medium mb-1">{title}</p>}
      {children}
    </div>
  );
}
