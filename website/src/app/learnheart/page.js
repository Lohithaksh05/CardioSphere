'use client'
import React from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
//i didnt use a js file for keeping the cards arranged because i wasnt in the mood , i will do it when i feel to :)
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
  } from "@material-tailwind/react";

  import dynamic from 'next/dynamic'
 
const Footer = dynamic(() => import('../components/Footer'), { ssr: false })

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
 
export default function LearnHeart(){
  const {data,status} = useSession();

  const router = useRouter();

  if(status === "unauthenticated"){
      router.push("/login");
  }
    return(
        <>
        <Navbar/>
        <div className=' relative w-full h-[500px] mt-10  ' >
        <Image src="/healthy.jpeg" 
        alt="Description of image" 
        layout='fill'
        objectFit='cover'
        className='opacity-70 h-[104vh]'
        />
         <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-pink-200 mob:text-5xl'>
         Your Journey to Cardiovascular Vitality Begins Here!
  </div>
        </div>
        <div className=' text-center text-3xl font-extrabold mt-[3%]'>
         General Exercises to keep your heart healthy ❤️
        </div>
        
           <div className='grid grid-cols-3 ml-8 mt-[2.5%] mob:grid-cols-1 mob:ml-[2%] mob:gap-5'>
           <iframe className='ml-3 mob:ml-0' width="400" height="215" src="https://www.youtube.com/embed/TjzwohzLJgA?si=-y7EBjQAuofQX5kB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
           <iframe width="400" height="215" src="https://www.youtube.com/embed/FxcsiHZvklA?si=PLtIO385la8t5Pdw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
           <iframe className='mr-0' width="400" height="215" src="https://www.youtube.com/embed/TjzwohzLJgA?si=-y7EBjQAuofQX5kB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
           </div>

           <h4 className='text-center text-3xl font-extrabold mt-[3%] '>
            Helpful Articles to keep you going ❤️
           </h4>
        <div className=' ml-12 grid grid-cols-3 mt-6 gap-y-5 mob:grid-cols-1 mob:ml-4'>
            
      
        <Card className="mt-6 w-96">
      <CardHeader color="blue-gray" className="relative h-56 mt-6">
        <img
          src="/2.jpg"
          alt="card-image"
          
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          Can High Cholestrol Lead To Blood Clots ?
        </Typography>
        <Typography>
        An important part of assessing heart health is a cholesterol screening, which is part of your annual physical. High cholesterol 
        specifically certain blood levels of cholesterol, 
        like LDLhas been linked to conditions such as heart attack and stroke.
        </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <a href="https://www.everydayhealth.com/high-cholesterol/can-high-cholesterol-cause-blood-clots/">
        <Button>Read More</Button>
        </a>
        
      </CardFooter>
    </Card>
    <Card className="mt-6 w-96">
      <CardHeader color="blue-gray" className="relative h-56 mt-6">
        <img
          src="/4.jpg"
          alt="card-image"
          
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          8 steps to prevent heart diesease
        </Typography>
        <Typography>
        Although you might know that eating certain foods can increase your heart disease risk, 
        changing your eating habits is often tough. Whether you have years of unhealthy eating under your belt 
        or you simply want to fine-tune your diet, being healthy is one of the best objectives , here are eight heart-healthy diet tips. 
        </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <a href="https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/heart-healthy-diet/art-20047702"> <Button>Read More</Button></a>
       
      </CardFooter>
    </Card>
    <Card className="mt-6 w-96">
      <CardHeader color="blue-gray" className="relative h-56 mt-6">
        <img
          src="/1.jpg"
          alt="card-image"
          
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          3 exercises that are best for your heart!
        </Typography>
        <Typography>
        Whatever your heart or circulatory condition, you’ll have something to gain 
        from exercise. Getting active could help to ease your symptoms, help you do more 
        in your daily life, and stop your disease from getting worse.
         </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <a href="https://www.bhf.org.uk/informationsupport/heart-matters-magazine/activity/exercises-heart-health"> <Button>Read More</Button></a>
       
      </CardFooter>
    </Card>
    <Card className="mt-6 w-96">
      <CardHeader color="blue-gray" className="relative h-56 mt-6">
        <img
          src="/5.jpg"
          alt="card-image"
          
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          The HEAD and the HEART
        </Typography>
        <Typography>
        Have you ever felt so stressed or anxious about something that your stomach begins to hurt? 
        I have. As it turns out, stomach problems are actually among the most common symptoms of stress 
        and anxiety. But are there other ways in which what we think affects how we feel physically or 
        psychologically, or vice versa?  
        </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <a href="https://medicine.yale.edu/news-article/the-head-and-the-heart-why-the-relationship-between-mental-health-and-heart-disease-matters/"> <Button>Read More</Button></a>
       
      </CardFooter>
    </Card>
    <Card className="mt-6 w-96">
      <CardHeader color="blue-gray" className="relative h-56 mt-6">
        <img
          src="/11.jpg"
          alt="card-image"
          
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          Food and Heart a long distance relation
        </Typography>
        <Typography>
        Everyone should aim for a well-balanced diet. Strict diets are hard to sustain long term and 
        may not provide the balance of nutrients you need.
        Healthy eating isn’t about cutting out or focusing on individual foods or nutrients. 
        It’s thinking about your whole diet and eating a variety of foods 
        in the right amounts to give your body what it needs.
        </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <a href="https://www.bhf.org.uk/informationsupport/support/healthy-living/healthy-eating"><Button>Read More</Button></a>
   
      </CardFooter>
    </Card>
    <Card className="mt-6 w-96">
      <CardHeader color="blue-gray" className="relative h-56 mt-6">
        <img
          src="/10.jpg"
          alt="card-image"
          
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          Prevention better than cure 
        </Typography>
        <Typography>
        Your lifestyle is your best defense against heart disease and stroke. 
        By following these simple steps you can reduce the modifiable risk 
        factors for heart disease, heart attack and stroke.
        </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <a href="https://www.heart.org/en/health-topics/heart-attack/life-after-a-heart-attack/lifestyle-changes-for-heart-attack-prevention"> <Button>Read More</Button></a>
       
      </CardFooter>
    </Card>
 
        </div>

        <Footer/>
        </>
    )
}



