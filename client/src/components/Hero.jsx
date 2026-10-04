import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Hero = () => {

    const navigate = useNavigate()

    const handleStartCreating = () => {
        navigate('/ai') // Layout renders Clerk's sign-in when the visitor is logged out
    }

  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>

        <div className='text-center mb-6'> 
            <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]'>Create amazing content <br /> with <span className='text-primary'>AI tools</span></h1>
            <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600'>Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.</p>
        </div>

        <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-sm'>
            {/* Updated onClick to show alert instead of navigating to a broken page */}
            <button onClick={handleStartCreating} className='bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer'>Start Creating Now</button>
            <button onClick={handleStartCreating} className='bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer'>Watch Demo</button>
        </div>

        {/* Added Notice Message for Frontend-Only Deployment */}
        <div className='mt-8 mx-auto max-w-2xl w-full px-4'>
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start sm:items-center gap-3 justify-center text-yellow-800 text-xs sm:text-sm shadow-sm'>
                <span className='text-lg'>⚠️</span>
                <p className='text-center'>
                    <strong>Note:</strong> This is currently a frontend-only deployment. The AI backend services are not connected. The buttons above are for UI demonstration purposes.
                </p>
            </div>
        </div>

        <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600'>
            <img src={assets.user_group} alt='' className='h-8'/>Trusted by 10k+ People
        </div>

    </div>
  )
}

export default Hero
