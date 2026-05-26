"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Shield, Trash2, XCircle, CheckCircle2 } from "lucide-react";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
}

const variantConfig: Record<ConfirmVariant, { icon: typeof AlertTriangle; iconBg: string; iconColor: string; btnClass: string }> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-500/10 ring-1 ring-red-500/20",
    iconColor: "text-red-400",
    btnClass: "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500/30",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10 ring-1 ring-amber-500/20",
    iconColor: "text-amber-400",
    btnClass: "bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500/30",
  },
  info: {
    icon: CheckCircle2,
    iconBg: "bg-blue-500/10 ring-1 ring-blue-500/20",
    iconColor: "text-blue-400",
    btnClass: "bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500/30",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 rounded-2xl max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-base font-semibold">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 text-sm mt-1">{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:text-white rounded-xl h-10 px-5 text-sm"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className={`rounded-xl h-10 px-5 text-sm font-semibold ${config.btnClass} ${loading ? "opacity-50" : ""}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
