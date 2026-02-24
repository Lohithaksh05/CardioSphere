import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/AuthProvider/AuthProvider'
import localFont from "next/font/local";


const myFont = localFont({
  src: "../../fonts/CalSans-SemiBold.woff2"
});


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HeartHealth',
  description: 'Cherish every beat, for within each pulse lies the rhythm of life. Guard your heart, the silent maestro orchestrating the symphony of your existence. ❤️ #HeartHealth ',
  icons:{
    icon : "/favicon.jpg",
  }
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={myFont.className}>
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  )
  }
