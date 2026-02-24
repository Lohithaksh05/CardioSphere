'use client'
import React, { useState } from "react"
import PrelineScript from "../components/PrelineScript";
import LocationFinder from "../components/Locationfinder"
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
  Radio,
  Select,
  Option,
} from "@material-tailwind/react";
//Here , i have used Preline UI + Material Tailwind , you need to see the functionality of buttons there are many bugs only in that case.

import axios from "axios";
import { useSession,getSession } from "next-auth/react"
import { useRouter } from "next/navigation";

export default function Page() {


  const router = useRouter();

  function flattenObject(obj, parentKey = '') {
    let result = {};
  
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let newKey = parentKey ? `${key}` : key;
        let value = obj[key];
  
        if (typeof value === 'object' && value !== null) {
          Object.assign(result, flattenObject(value, newKey));
        } else {
          // Convert "no" to 0 and "yes" to 1
          result[newKey] = value === 'yes' ? 1 : value === 'no' ? 0 : value;
        }
      }
    }
  
    return result;
  }
  
  const {data,status} = useSession();
  if(status === "unauthenticated"){
      router.push("/login");
  }
  

  const email = data?.user?.email;

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    bloodGroup: "",
    emergencyContact: "",
    gender: "",
    age: "",
  });

  const handleInputChange1 = (name, value) => {
    setPersonalInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState({
    selectedDifficultyWalking: null,
    selectedBP: null,
    selectedChol: null,
    selectedSmoker: null,
    selectedStroke: null,
    bmi: "",
    genhealth: "",
    selectedDiabetes: null,
    heavyAlcohol: null,
    physicalActivity: null,
    vegetarian: null,
  });

  const handleRadioChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  
  const resetForm = () => {
    setPersonalInfo({
      name: '',
      bloodGroup: '',
      emergencyContact: '',
      gender: '',
      age: '',
    });

    setFormData({
      selectedDifficultyWalking: null,
      selectedBP: null,
      selectedChol: null,
      selectedSmoker: null,
      selectedStroke: null,
      bmi: '',
      genhealth: '',
      selectedDiabetes: null,
      heavyAlcohol: null,
      physicalActivity: null,
      vegetarian: null,
    });
  };

  const postData = async () => {
    try {
      const flattenedData = flattenObject({ email, personalInfo, formData });
      const response = await axios.post(
        '/api/detailsform',
        JSON.stringify(flattenedData),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Data saved successfully:', response.data);
      router.push('/dashboard');

      // Reset the form after successful submission
      // resetForm();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <>

      <div data-hs-stepper>


        <div class="mt-5 sm:mt-8">

          <div data-hs-stepper-content-item='{"index": 1}'>
            <div className="p-4 h-[60%]  flex justify-center items-center rounded-xl">
              <Card color="transparent" shadow={false}>
                <Typography variant="h4" color="white">
                  Personal Information
                </Typography>
                <Typography color="white" className="mt-1 font-normal">
                  Nice to meet you! Please enter your accurate details.
                </Typography>
                <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
                  <div className="mb-1 flex flex-col gap-6">
                    <Typography variant="h6" color="white" className="-mb-3">
                      Your Name
                    </Typography>
                    <Input
                      size="lg"
                      placeholder="Rahul Oberoi"
                      className="text-light-blue-200 !border-t-blue-gray-200 focus:!border-white !placeholder-blue-gray-300"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      value={personalInfo.name}
                      onChange={(e) => handleInputChange1("name", e.target.value)}
                    />
                    <Typography variant="h6" color="white" className="-mb-3">
                      Blood Group
                    </Typography>
                    <Input
                      size="lg"
                      placeholder="B+VE"
                      className="text-light-blue-200 !border-t-blue-gray-200 focus:!border-white"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      value={personalInfo.bloodGroup}
                      onChange={(e) => handleInputChange1("bloodGroup", e.target.value)}
                    />
                    <Typography variant="h6" color="white" className="-mb-3">
                      Emergency Contact Number
                    </Typography>
                    <Input
                      size="lg"
                      placeholder="6305297926"
                      className="text-light-blue-200 !border-t-blue-gray-200 focus:!border-white"
                      maxLength={10}
                      minLength={10}
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      value={personalInfo.emergencyContact}
                      onChange={(e) => handleInputChange1("emergencyContact", e.target.value)}
                    />
                    <Typography variant="h6" color="white" className="-mb-3">
                      Gender
                    </Typography>
                    <Select
                      size="lg"
                      placeholder="Select Gender"
                      className="text-light-blue-200 !border-t-blue-gray-200 focus:!border-white"
                      value={personalInfo.gender}
                      onChange={(value) => handleInputChange1("gender",value)}
                    >
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                    </Select>


                    <Typography variant="h6" color="white" className="-mb-3">
                      Age
                    </Typography>
                    <Input
                      size="lg"
                      placeholder="Enter Age"
                      className="text-light-blue-200 !border-t-blue-gray-200 focus:!border-white"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      value={personalInfo.age}
                      onChange={(e) => handleInputChange1("age", e.target.value)}
                    />
                  </div>
                  <div className="mb-1 flex flex-col gap-6">

                    <Typography variant="h6" color="white" className="-mb-3">
                      Difficulty in walking ?
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="selectedDifficultyWalking"
                        label={<span className={formData.selectedDifficultyWalking === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('selectedDifficultyWalking', 'yes')}
                        checked={formData.selectedDifficultyWalking === 'yes'}
                      />
                      <Radio
                        name="selectedDifficultyWalking"
                        label={<span className={formData.selectedDifficultyWalking === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('selectedDifficultyWalking', 'no')}
                        checked={formData.selectedDifficultyWalking === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      High Blood Pressure (HighBP)
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="selectedBP"
                        label={<span className={formData.selectedBP === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('selectedBP', 'yes')}
                        checked={formData.selectedBP === 'yes'}
                      />
                      <Radio
                        name="selectedBP"
                        label={<span className={formData.selectedBP === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('selectedBP', 'no')}
                        checked={formData.selectedBP === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      High Cholesterol (HighChol)
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="selectedChol"
                        label={<span className={formData.selectedChol === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('selectedChol', 'yes')}
                        checked={formData.selectedChol === 'yes'}
                      />
                      <Radio
                        name="selectedChol"
                        label={<span className={formData.selectedChol === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('selectedChol', 'no')}
                        checked={formData.selectedChol === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      BMI (Body Mass Index)
                    </Typography>
                    <Input
                      size="lg"
                      placeholder="Enter BMI"
                      className="text-light-blue-200 !border-t-blue-gray-200 focus:!border-white"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      value={formData.bmi}
                      onChange={(e) => handleInputChange('bmi', e.target.value)}
                    />
                    <Typography variant="h6" color="white" className="-mb-3">
                      Do you have diabetes?
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="selectedDiabetes"
                        label={<span className={formData.selectedDiabetes === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('selectedDiabetes', 'yes')}
                        checked={formData.selectedDiabetes === 'yes'}
                      />
                      <Radio
                        name="selectedDiabetes"
                        label={<span className={formData.selectedDiabetes === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('selectedDiabetes', 'no')}
                        checked={formData.selectedDiabetes === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      Smoker
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="selectedSmoker"
                        label={<span className={formData.selectedSmoker === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('selectedSmoker', 'yes')}
                        checked={formData.selectedSmoker === 'yes'}
                      />
                      <Radio
                        name="selectedSmoker"
                        label={<span className={formData.selectedSmoker === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('selectedSmoker', 'no')}
                        checked={formData.selectedSmoker === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      Have you had a heart stroke in the past?
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="selectedStroke"
                        label={<span className={formData.selectedStroke === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('selectedStroke', 'yes')}
                        checked={formData.selectedStroke === 'yes'}
                      />
                      <Radio
                        name="selectedStroke"
                        label={<span className={formData.selectedStroke === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('selectedStroke', 'no')}
                        checked={formData.selectedStroke === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      Heavy Alcohol Consumption
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="heavyAlcohol"
                        label={<span className={formData.heavyAlcohol === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('heavyAlcohol', 'yes')}
                        checked={formData.heavyAlcohol === 'yes'}
                      />
                      <Radio
                        name="heavyAlcohol"
                        label={<span className={formData.heavyAlcohol === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('heavyAlcohol', 'no')}
                        checked={formData.heavyAlcohol === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      Do you exercise frequently?
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="physicalActivity"
                        label={<span className={formData.physicalActivity === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('physicalActivity', 'yes')}
                        checked={formData.physicalActivity === 'yes'}
                      />
                      <Radio
                        name="physicalActivity"
                        label={<span className={formData.physicalActivity === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('physicalActivity', 'no')}
                        checked={formData.physicalActivity === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      Are you a vegetarian?
                    </Typography>
                    <div className="flex gap-10">
                      <Radio
                        name="vegetarian"
                        label={<span className={formData.vegetarian === 'yes' ? 'text-red-500' : 'text-white'}>Yes</span>}
                        onClick={() => handleRadioChange('vegetarian', 'yes')}
                        checked={formData.vegetarian === 'yes'}
                      />
                      <Radio
                        name="vegetarian"
                        label={<span className={formData.vegetarian === 'no' ? 'text-green-400' : 'text-white'}>No</span>}
                        onClick={() => handleRadioChange('vegetarian', 'no')}
                        checked={formData.vegetarian === 'no'}
                      />
                    </div>
                    <Typography variant="h6" color="white" className="-mb-3">
                      Rate your general health on scale of 1 to 5 <br /><span className=" font-bold">(1 being the highest and 5 being the lowest)</span>
                    </Typography>
                    <Input
                      size="lg"
                      placeholder="Enter Rating"
                      className="text-light-blue-200 !border-t-blue-gray-200 focus:!border-white"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      value={formData.genhealth}
                      onChange={(e) => handleInputChange('genhealth', e.target.value)}
                    />

                  </div>
                </form>
              </Card>
            </div>
          </div>

         

          
            
            <button onClick={postData} type="button" className="mt-4 text-red-700 hover:text-white border border-red-700 hover:bg-red focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-200 ease-in-out mob:ml-[35vw] des:ml-[45vw]" >
              Finish
            </button>


          </div>

        </div>


      {/* <PrelineScript /> */}




    </>
  )
}