"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  CheckCircle,
  Clock,
  Building,
} from "lucide-react";

const iconMap = {
  users: Users,
  home: Home,
  calendar: Calendar,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  star: Star,
  "check-circle": CheckCircle,
  clock: Clock,
  building: Building,
} as const;

type IconName = keyof typeof iconMap;

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: IconName;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  const Icon = iconMap[icon];
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {trend && trendUp !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    trendUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && trendUp === undefined && (
              <p className="text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

