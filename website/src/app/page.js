"use client"
import Image from 'next/image'

import { useSession,getSession } from "next-auth/react"
import { Spinner } from '@material-tailwind/react'
import { useRouter } from 'next/navigation'
import { Motion } from "./components/framer-motion";
import Link from 'next/link'

export default function Home() {
  const session = useSession();
  if(session.status === "loading"){
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
    <>
    {/* <ComplexNavbar /> */}
    <div className='pt-16 sm:pt-10 sm:pb-0 lg:pt-40 lg:pb-48'>
    <div className='heart-image flex-1 flex items-center h-screen absolute right-[10vw] mob:right-0 transform translate-y-[3.5rem] des:translate-y-[-13.0rem]  mob:mr-[5%]'>
    <Image
    src="/heart.png"
    width={600}
    height={600}
    className='rounded-full animate-float mob:mt-32 mob:w-[90vw] mob:-z-10'
     />
      </div>
      <div className="sm:max-w-[19.5rem] md:max-w-[24.5rem] tab:max-w-[28rem] lg:max-w-[30rem] des:ml-16 mob:px-5">
     <Motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 110,
                delay: 0,
              }}
              className="text-4xl font-bold sm:text-[5vw] md:text-5xl lg:leading-[5.5rem] lg:text-[5rem]mob:text-center bg-transparent mob:text-center"
            >
              Welcome!
            </Motion.div>

            <Motion.p
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 110,
                delay: 0.1,
              }}
              className="mt-4 text-xl text-gray-400 tracking-wide mob:text-center"
            >
             Cherish every beat, for within each pulse lies the rhythm of life. Guard your heart, the silent maestro orchestrating the symphony of your existence. ❤️ #HeartHealth
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 110,
                delay: 0.2,
              }}
              className="mt-14 my-1 mob:text-center"
            >
              <Link
                href="/login"
                className="p-3 rounded-md border border-gray-600 hover:bg-pink-400 ease-in duration-200 text-white hover:text-white text-dark "
                type="button"
                style={{borderWidth:"2px"}}
                aria-label="link to projects section"
              >
                Get Started
              </Link>
              
            </Motion.div>
     </div>
     </div>
     </>
  )
  }
  
}
