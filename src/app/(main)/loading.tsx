import Image from "next/image";

import Logo from "@/assets/company_logo.png";

export default function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-primary text-white">
      <div className="flex flex-col gap-6">
        <div>
          <Image src={Logo} alt="Okamoto Kaiun Logo" />
        </div>
        <p className="text-center">ページの読み込み中です...</p>
      </div>
    </div>
  );
}
