import Image from "next/image";
import { CalendarView } from "@/components/calendar-view";

// Ship calendar background.
import ShipBackground from "@/assets/jfe-n1.jpg";

export interface Staff {
  id: string;
  name: string;
  schedules: string[];
  role: string;
}

export default async function Home() {
  return (
    <div className="-mt-32">
      <Image
        src={ShipBackground}
        alt="Okamoto Kaiun Ship"
        className="w-full max-h-[400px] object-cover mask-b-from-0% mask-b-to-90%"
      />

      <div className="relative z-10 -mt-12">
        <CalendarView />
      </div>
    </div>
  );
}
