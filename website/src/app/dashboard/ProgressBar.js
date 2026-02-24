import { Progress, Typography } from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProgressBar() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [CurrentRisk, setCurrentRisk] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        if (session?.user?.email) {
          const email = session.user.email;
          const res = await fetch("/api/getuser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const data = await res.json();
          setUserData(data);
        } else {
          console.error("User email not found in session:", session);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserData();
  }, [session]);

  useEffect(() => {
    const postToPredictionEndpoint = async () => {
      try {
        if (userData && userData.personalInfo.data) {
          const genderValue =
            userData.personalInfo.data.gender.toLowerCase() === "female" ? 0 : 1;

          const dataList = [
            userData.personalInfo.data.selectedBP,
            userData.personalInfo.data.selectedChol,
            1,
            userData.personalInfo.data.bmi,
            userData.personalInfo.data.selectedSmoker,
            userData.personalInfo.data.selectedStroke,
            userData.personalInfo.data.selectedDiabetes,
            userData.personalInfo.data.physicalActivity,
            userData.personalInfo.data.vegetarian,
            userData.personalInfo.data.vegetarian,
            userData.personalInfo.data.heavyAlcohol,
            userData.personalInfo.data.genhealth,
            userData.personalInfo.data.selectedDifficultyWalking,
            genderValue,
            userData.personalInfo.data.age,
          ];

          const response = await fetch("https://hearthealth-g58.azurewebsites.net/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: dataList }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log("Prediction Result:", result);

            setCurrentRisk(result.probability * 100);
            setPredictionResult(result);
          } else {
            console.error(
              "Error posting data to prediction endpoint:",
              response.statusText
            );
          }
        }
      } catch (error) {
        console.error("Error posting data to prediction endpoint:", error);
      }
    };

    postToPredictionEndpoint();
  }, [userData]);

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%]  p-6">
        <div className="mb-4 flex items-center gap-4">
          <Typography color="" variant="h6">
            Current Risk
          </Typography>
        </div>
        <div className="flex mob:w-[85%] mb-4">
          <Progress color="deep-orange" value={CurrentRisk} className="mt-2 mr-4" />
          <Typography color="white" variant="h6">
            {CurrentRisk !== null ? `${CurrentRisk.toFixed(2)}%` : "Calculating..."}
          </Typography>
        </div>
        <Link href="/detailsform"
          className="mt-4 text-red-700 hover:text-white border border-red-700 hover:bg-red focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-200 ease-in-out">
          Predict Again
        </Link>
      </div>
    </div>
  );
}
