"use client"
import Image from 'next/image'
import { useSession,getSession } from "next-auth/react"
import { Spinner } from '@material-tailwind/react';
import ComplexNavbar from '../components/Navbar';
import ProgressBar from "./ProgressBar"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import ProfileCard from '../components/Card'

export default function Home() {
  const {data,status} = useSession();
  const router = useRouter();

  if(status === "unauthenticated"){
      router.push("/login");
  }

  const [factors, setFactors] = useState(["factor1", "factor2"])
  const [CurrentRisk, setCurrentRisk] = useState(0);


  // create function to pass CurrentRisk value from database
  useEffect(() => {
    setCurrentRisk(90)
  })

  if(status === "loading"){
    return (
      <div className="w-[100vw] h-[100vh] flex justify-center" style={{ alignItems: "center" }}>
            <Spinner className="h-16 w-16 text-white" />
      </div>
    )
  }
  
  // if (session.status === "unauthenticated"){
  //   const router = useRouter();
  //   router.push("/login");
  // }

  else{
    
  return (
    <div className="dashboard">
        <ComplexNavbar />
        <div className='pb'>
          <ProgressBar />
        
        </div>
        
        <ProfileCard />
           {/* <div className='grid grid-cols-3 ml-8 mt-[2.5%]'>
           <iframe className='ml-3' width="400" height="215" src="https://www.youtube.com/embed/TjzwohzLJgA?si=-y7EBjQAuofQX5kB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
           <iframe width="400" height="215" src="https://www.youtube.com/embed/FxcsiHZvklA?si=PLtIO385la8t5Pdw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
           <iframe className='mr-0' width="400" height="215" src="https://www.youtube.com/embed/TjzwohzLJgA?si=-y7EBjQAuofQX5kB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
           </div> */}
           <Footer/>
     </div>
  )
  }
  
}
