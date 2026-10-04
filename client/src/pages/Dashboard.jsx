import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import CreationItem from '../components/CreationItem'
import { useUser } from '@clerk/react'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'
import { useIsPremium } from '../hooks/useIsPremium'
import { errorMessage } from '../lib/api'

const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const { user } = useUser();
  const api = useApi()
  const isPremium = useIsPremium()

  const getDashboardData = async () => {
    try {
      const data = await api.get('/api/user/creations')
      setCreations(data.creations)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  // Handle deletion of a creation from state and database
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/user/creations/${id}`)
      setCreations((prev) => prev.filter((item) => item.id !== id))
      toast.success('Creation deleted successfully')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  useEffect(()=>{
    if (user) getDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className='h-full overflow-y-scroll p-6'>
        <div className='flex justify-start gap-4 flex-wrap'>
          {/*Total Creations Card */}
          <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
              <div className='text-slate-600'>
                <p className='text-sm'>Total Creations</p>
                <h2 className='text-xl font-semibold'>{creations.length}</h2>
              </div>
              <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
                <Sparkles className='w-5 text-white'/>
              </div>
          </div>

          
          {/*Active Plan Card */}
          <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
              <div className='text-slate-600'>
                <p className='text-sm'>Active Plan</p>
                <h2 className='text-xl font-semibold'>
                  {isPremium ? "Premium" : "Free"}
                </h2>
              </div>
              <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
                <Gem className='w-5 text-white'/>
              </div>
          </div>

        </div>


      <div className='space-y-3'>
        <p className='mt-6 mb-4'>Recent Creations</p>
        {
          creations.map((item)=> <CreationItem key={item.id} item={item} onDelete={handleDelete}/>)
        }
      </div>

    </div>
  )
}

export default Dashboard