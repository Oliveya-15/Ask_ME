import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Trash2 } from 'lucide-react'

const CreationItem = ({ item, onDelete }) => {

    const [expanded, setExpanded] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = async (e) => {
        e.stopPropagation() // Prevent toggling the expand/collapse accordion when clicking delete
        if (window.confirm('Are you sure you want to delete this creation?')) {
            setIsDeleting(true)
            await onDelete(item.id)
            setIsDeleting(false)
        }
    }

  return (
    <div onClick={()=> setExpanded(!expanded)} className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors'>
        <div className='flex justify-between items-center gap-4'>
            <div>
                <h2>{item.prompt}</h2>
                <p className='text-gray-500'>{item.type} • {new Date(item.created_at).toLocaleDateString()}</p>
            </div>
            <div className='flex items-center gap-3'>
                <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>
                    {item.type}
                </button>
                <button 
                    onClick={handleDeleteClick} 
                    disabled={isDeleting}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                    title='Delete creation'
                >
                    <Trash2 className='w-4 h-4' />
                </button>
            </div>
        </div>
        {
            expanded && (
                <div>
                    {item.type === 'image' ? (
                        <div>
                            <img src={item.content} alt='image' className='mt-3 w-full max-w-md rounded-md'/>
                        </div>
                    ) : (
                        <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
                            <div className='reset-tw'>
                                <Markdown>{item.content}</Markdown>
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    </div>
  )
}

export default CreationItem