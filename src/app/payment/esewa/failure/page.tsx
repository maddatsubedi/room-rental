import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function EsewaFailurePage() {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-stone-200">
        <CardHeader>
          <CardTitle className="text-center">eSewa Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <XCircle className="h-10 w-10 text-red-600" />
            <p className="text-stone-900 font-medium">Payment was not completed</p>
            <p className="text-sm text-stone-600">
              The transaction was cancelled or could not be processed. You can try again from your bookings.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/dashboard/bookings" className="w-full">
              <Button className="w-full">Go to My Bookings</Button>
            </Link>
            <Link href="/rooms" className="w-full">
              <Button variant="outline" className="w-full">Browse Rooms</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}