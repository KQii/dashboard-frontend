import { ExternalLink as ExternalLinkIcon } from "lucide-react";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "prometheus" | "grafana" | "alertmanager";
}

const variantStyles = {
  default: "text-gray-700 bg-gray-100 hover:bg-gray-200",
  prometheus: "text-red-700 bg-red-50 hover:bg-red-100",
  grafana: "text-amber-700 bg-amber-50 hover:bg-amber-100",
  alertmanager: "text-gray-700 bg-gray-100 hover:bg-gray-200",
};

export function ExternalLink({
  href,
  children,
  variant = "default",
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${variantStyles[variant]}`}
    >
      {children} <ExternalLinkIcon className="w-3 h-3" />
    </a>
  );
}
