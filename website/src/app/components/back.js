import { IconButton } from "@material-tailwind/react";
import Image from "next/image";
import Link from "next/link";

export default function BackButton() {
  return (
    <div className="flex items-center gap-4 mt-5 ml-4">
    <Link href="/">
     <IconButton variant="outlined" className="rounded-full" color="white" size="lg">
      <Image src="/back.svg" width={34} height={34}/>
        </IconButton>
        </Link> 
    </div>
  );
}