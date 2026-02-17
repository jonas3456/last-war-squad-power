import { formatPower } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, TrendingUp, Users, Zap } from "lucide-react";

interface SummaryCardsProps {
  totalPower: number;
  averagePower: number;
  submissionRate: number;
  playerCount: number;
  strongestSquad: string;
  weakestSquad: string;
}

export function SummaryCards({
  totalPower,
  averagePower,
  submissionRate,
  playerCount,
  strongestSquad,
  weakestSquad,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Power</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPower(totalPower)}</div>
          <p className="text-xs text-muted-foreground">
            {playerCount} player{playerCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Power</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPower(averagePower)}</div>
          <p className="text-xs text-muted-foreground">per player</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Submission Rate</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{submissionRate}%</div>
          <p className="text-xs text-muted-foreground">
            players with data
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Squads</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{strongestSquad}</div>
          <p className="text-xs text-muted-foreground">
            strongest | weakest: {weakestSquad}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
