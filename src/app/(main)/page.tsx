import Image from "next/image";
import { CalendarView } from "@/components/calendar-view";
import Ship1 from "@/assets/jfe-n1.jpg";

export interface Staff {
  id: string;
  name: string;
  schedules: string[];
}

const staff: Staff[] = [
  { id: "1", name: "Dhavidy", schedules: ["1", "3"] },
  { id: "2", name: "Hiroko", schedules: ["2"] },
  { id: "3", name: "Senoo", schedules: ["2"] },
  { id: "4", name: "Scooby", schedules: ["1", "4", "5"] },
];

export default async function Home() {
  return (
    <div className="relative -mt-32">
      <div className="relative z-10 mask-b-from-20% mask-b-to-80%">
        <Image src={Ship1} alt="Ship 1" className="w-full max-h-[400px] object-cover" />
      </div>
      <div className="relative z-20 flex items-center gap-3 -mt-32 mb-9 max-w-5xl px-12">
        <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          JFE N1/清丸
        </div>

        <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          JFE N3/第三清丸
        </div>

        <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          扇鳳丸
        </div>
      </div>
      <div>
        <CalendarView staff={staff} />
      </div>
    </div>
  );
}
