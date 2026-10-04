import { useUser } from '@clerk/react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'
import { errorMessage } from '../lib/api'

const Community = () => {

  const [creations, setCreations] = useState([])
  const {user} = useUser()
  const api = useApi()

  const fetchCreations = async()=>{
    try {
      const data = await api.get('/api/user/published-creations')
      setCreations(data.creations)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const toggleLike = async (id) => {
    const previous = creations
    // optimistic update, rolled back if the request fails
    setCreations(creations.map((c) => c.id !== id ? c : {
      ...c,
      likes: c.likes.includes(user.id) ? c.likes.filter((l) => l !== user.id) : [...c.likes, user.id],
    }))
    try {
      await api.post('/api/user/toggle-like-creation', { id })
    } catch (error) {
      setCreations(previous)
      toast.error(errorMessage(error))
    }
  }

  useEffect(()=>{
    if(user){
      fetchCreations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user])

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
       Creations 
       <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
          {creations.map((creation,index)=>(
            <div key={index} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
              <img src={creation.content} alt='' className='w-full h-full object-cover rounded-lg'/>

              <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
                <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
                <div className='flex gap-1 items-center'>
                  <p>{creation.likes.length}</p>
                  <Heart onClick={()=> toggleLike(creation.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${creation.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`}/>
                </div>
              </div>
            </div>
          ))}
        </div> 
    </div>
  )
}

export default Community