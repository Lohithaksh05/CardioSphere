import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

import { useSession } from "next-auth/react";
import Link from "next/link";

import LocationComponent from './Locationfinder';

export default async function ProfileCard() {
  const { data: session } = useSession();

  // Make a post request to /api/getuser with email as body to get user details
  const getUser = async () => {
    const res = await fetch("/api/getuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: session?.user?.email }),
    });

    const data = await res.json();
    return data;
  };

  // Use await or .then() to get the result
  const person = await getUser();

  // Function to get BMI color based on conditions
  const getBMIColor = (bmi) => {
    if (bmi > 30) {
      return 'text-red-500';
    } else if (bmi > 25) {
      return 'text-orange-500';
    } else {
      return 'text-green-500';
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-[48rem] flex-row my-20 mob:my-8 mob:max-w-[95vw] ">
        <CardHeader
          shadow={false}
          floated={false}
          className="m-0 w-[25%]  shrink-0 rounded-r-none mob:w-[45%]"
        >
          <img
            src={session?.user?.image}
            alt="card-image"
            className="h-full w-full object-cover"
            referrerpolicy="no-referrer"
          />
        </CardHeader>
        <CardBody>
          <Typography variant="h6" color="gray" className="mb-4 uppercase mob:text-sm">
            Personal Details
          </Typography>
          <Typography variant="h4" color="blue-gray" className="mb-2 mob:text-sm ">
            {session?.user?.name}
          </Typography>
          <Typography color="gray" className="mb-1 font-normal mob:text-sm mob:hidden">
           <span className="font-semibold">Email:</span>  <span className="mob:text-[10px] mob:font-bold">{session?.user?.email}</span>
          </Typography>
          <Typography color="gray" className="mb-1 font-normal">
          <span className="font-semibold">Number:</span> {person.personalInfo.data.emergencyContact}
          </Typography>
          <Typography color="gray" className="mb-1 font-normal">
          <span className="font-semibold">Gender: </span>{person.personalInfo.data.gender}
          </Typography>
          <Typography color="gray" className="mb-1 font-normal">
          <span className="font-semibold">Age: </span>{person.personalInfo.data.age}
          </Typography>
          <Typography color="gray" className={`mb-1 font-normal ${getBMIColor(person.personalInfo.data.bmi)}`}>
            BMI: {person.personalInfo.data.bmi}
          </Typography>
          <div className="flex mob:flex-col">
          <LocationComponent />
          <Link href="/ai-planner"
          className="mt-4 text-red-700 hover:text-white border border-red-700 hover:bg-red focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-200 ease-in-out mob:px-4">
          Get exercise Routine
        </Link>
        </div>
        </CardBody>
      </Card>
    </div>
  );
}
