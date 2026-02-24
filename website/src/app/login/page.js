"use client"

import Image from 'next/image';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react'; // Import getSession for server-side authentication
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import "./page.css"
import { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignIn = async () => {
    await signIn('google'); // Replace 'google' with your preferred authentication method.
  };

  const getUser = async () => {
    const res = await fetch("/api/getuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: session?.user?.email } || { email: null }),
    });

    const data = await res.json();
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      // If the user is already authenticated, redirect to the protected page.
      if (status === 'authenticated') {
        console.log(session);
        const person = await getUser();
        console.log(person);
        if (person.personalInfo && person.personalInfo.data) {
          router.push('/dashboard');
        } else {
          router.push('/detailsform');
        }
      }
    };

    fetchData();
  }, [status, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Your logic for handling the form submission, including fetching user data
    // using the /api/getuser route.

    // Example:
    const res = await fetch("/api/getuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (status === 'authenticated') {
      if (data.personalInfo.data) {
        router.push('/dashboard');
      } else {
        router.push('/detailsform');
      }
    }
  };
    return (
        <div className='flex h-screen '>
            <div className="form ml-5">
                <form className='form-actual mt-5'>
                    <div className="flex-column">
                        <label>Email </label>
                    </div>
                    <div className="inputForm">
                        <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" className='email-svg'>
                            <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                        </svg>
                        <input type="text" className="input" placeholder="Enter your Email" />
                    </div>

                    <div className="flex-column">
                        <label>Password </label>
                    </div>
                    <div className="inputForm">
                        <Image
                            src="/password.svg"
                            alt="password Logo"
                            width={25}
                            height={25}
                            priority
                        />
                        <input type="password" className="input" placeholder="Enter your Password" />
                        <svg viewBox="0 0 576 512" height="18" xmlns="http://www.w3.org/2000/svg" style={{ margin: '10px' }}>
                            <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
                        </svg>
                    </div>

                    <div className="flex-row">
                        <div>
                            <input type="checkbox" />
                            <label>Remember me</label>
                        </div>
                        {/* <span className="span">Forgot password?</span> */}
                    </div>

                    <button className="button-submit text-white " style={{color:"white"}}>Sign In</button>

                    {/* <p className="p">
                        Don't have an account? <Link href="/signup" legacyBehavior><a className="span">Sign Up</a></Link>
                    </p> */}
                    <p className="p line font-bold">Or With</p>
                    <div className="flex-row" >

                    </div>
                    
                </form>
                <div className="flex-row">
                    <button className='btn input flex-row top-4' onClick={handleSignIn}>
                        <Image
                            src="/google.svg"
                            alt="Google Logo"
                            width={25}
                            height={25}
                            priority
                            className='google'
                        />
                        Sign in with Google
                    </button>
                </div>
            </div>
            <div className='flex-1 flex items-center justify-center heartImage mob:flex-col-reverse'>
                <Image
                    src="/1.jpg"
                    alt="heart Image"
                    width={500}
                    height={500}
                    className='rounded-full'
                />
            </div>
        </div>
    );
};

export default LoginPage;
