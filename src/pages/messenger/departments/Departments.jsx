import React, { useState, useEffect, useCallback } from 'react'
import api from '../../../api/base'

const departmentEnhancedData = {
    Marketing: {
        icon: '⚔️',
        tagline:
            'Hunters of M Company — they open channels, capture attention, and scale our vision worldwide.',
        features: [
            '🔰 Expanding reach and awareness',
            '🔰 Turning strategy into global impact',
            '🔰 Scaling every idea to its full potential',
        ],
        buttonText: 'Enter Battlefield',
        theme: 'battlefield',
    },
    'M Sales': {
        icon: '💼',
        tagline:
            'The backbone. Every client, every deal, every dollar flows through their hands.',
        features: [
            '🔰 Closing deals with precision',
            '🔰 Turning conversations into revenue',
            '🔰 Driving unstoppable growth',
        ],
        buttonText: 'Enter Battlefield',
    },
    'M Tech': {
        icon: '⚙️',
        tagline:
            'The builders of systems, products, and automation that move businesses to global scale.',
        features: [
            '🔰 Creating tools that multiply growth',
            '🔰 Innovating to save resources',
            '🔰 Building engines of automation',
        ],
        buttonText: 'Enter Workshop',
    },
    Media: {
        icon: '🎨',
        tagline:
            'The face of M Company — shaping identity, trust, and perception through creativity.',
        features: [
            '🔰 Defining how the world sees us',
            '🔰 Turning ideas into powerful visuals',
            '🔰 Making the invisible visible',
        ],
        buttonText: 'Enter Workshop',
    },
    Falco: {
        icon: '🦅',
        tagline:
            'Youth power. A hub for ambitious talent, competitions, and startups.',
        features: [
            '🔰 Connecting young visionaries',
            '🔰 Building startups from scratch',
            '🔰 Preparing teams for global arenas',
        ],
        buttonText: 'Enter Arena',
    },
    'M Academy': {
        icon: '🎓',
        tagline: 'The school of mastery — where knowledge transforms into power.',
        features: [
            '🔰 Educating for mastery',
            '🔰 Creating content that changes lives',
            '🔰 Raising a generation of experts',
        ],
        buttonText: 'Enter Arena',
        theme: 'arena',
    },
    Operations: {
        icon: '⚡️',
        tagline:
            'The force of execution. They ensure speed, precision, and delivery.',
        features: [
            '🔰 Guiding large-scale projects',
            '🔰 Driving efficiency at every step',
            '🔰 Making big goals achievable',
        ],
        buttonText: 'Enter Command',
    },
    Finance: {
        icon: '💰',
        tagline:
            'Guardians of wealth — managing, protecting, and multiplying resources.',
        features: [
            '🔰 Controlling cash flow with discipline',
            '🔰 Growing capital strategically',
            '🔰 Fueling long-term scaling',
        ],
        buttonText: 'Enter Command',
    },
    HR: {
        icon: '👥',
        tagline:
            'The architects of people — finding talent, developing loyalty, and building culture.',
        features: [
            '🔰 Recruiting loyalty and skill',
            '🔰 Growing people to reach their dreams',
            '🔰 Creating a culture of excellence',
        ],
        buttonText: 'Enter Command',
    },
    Soon: {
        icon: '🕳',
        tagline:
            'Every structure has its crown. This is ours — the final piece that will complete M Company.',
        features: [
            'Not just a department, but the force that will transform us into something greater.',
        ],
        buttonText: ['⏳ Awakened only when the company is ready.'],
    },
}

const DepartmentSkeleton = () => (
    <div className='flex flex-col items-center p-5 bg-white shadow-md rounded-xl animate-pulse max-w-[350px] w-full'>
        <div className='w-full h-48 bg-gray-300 rounded-[10px]'></div>
        <div className='w-3/4 h-6 bg-gray-300 rounded mt-5'></div>
        <div className='w-full h-4 bg-gray-200 rounded mt-2'></div>
        <div className='w-5/6 h-4 bg-gray-200 rounded mt-1'></div>
        <div className='space-y-2 mt-4 w-full'>
            <div className='w-full h-3 bg-gray-200 rounded'></div>
            <div className='w-full h-3 bg-gray-200 rounded'></div>
            <div className='w-3/4 h-3 bg-gray-200 rounded'></div>
        </div>
        <div className='w-full h-10 bg-gray-300 rounded-lg mt-4'></div>
    </div>
)

const ErrorState = ({ onRetry }) => (
    <div className='col-span-full flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl'>
        <div className='text-red-500 text-6xl mb-4'>⚠️</div>
        <h3 className='text-lg font-semibold text-red-700 mb-2'>
            An error occurred while loading data
        </h3>
        <p className='text-red-600 mb-4 text-center'>
            Please check your internet connection and try again
        </p>
        <button
            onClick={onRetry}
            className='px-6 py-2 bg-red-600 text-white font-medium rounded-lg 
                 hover:bg-red-700 transition-colors duration-200'
        >
            Retry
        </button>
    </div>
)

const DepartmentCard = React.memo(({ user }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const imageUrl = imageError ? '/placeholder-image.jpg' : user?.photo
    const enhancedData = departmentEnhancedData[user?.name] || {}
    const themeColors = {
        border: 'border-gray-200',
        shadow: 'shadow-gray-200',
    }

    return (
        <div
            className={`flex flex-col w-full max-w-[300px] h-[500px] p-6 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 text-center transform hover:scale-105 mx-auto ${themeColors.border} border-2 ${themeColors.shadow}`}
        >
            <div className='relative w-full h-[180px] mb-4'>
                {!imageLoaded && (
                    <div className='absolute inset-0 bg-gray-300 rounded-[10px] animate-pulse'></div>
                )}
                <img
                    src={imageUrl || '/placeholder-image.jpg'}
                    alt={user?.name || 'Department photo'}
                    className={`w-full h-full object-contain bg-[#f7f5f2] rounded-[10px] 
            transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading='lazy'
                />
                <div className='absolute inset-0 bg-gradient-to-t opacity-20 rounded-[10px]'></div>
            </div>
            <div className='flex items-center justify-center mb-4'>
                <span className='text-xl mr-1'>{enhancedData.icon || '🏢'}</span>
                <h3 className='text-xl font-bold text-gray-800 break-words leading-tight'>
                    {user?.name || 'Unknown Department'}
                </h3>
            </div>

            <p className='text-sm text-left text-gray-700 leading-relaxed mb-4 font-medium'>
                {enhancedData.tagline ||
                    user?.description ||
                    'No description available'}
            </p>

            {enhancedData.features && (
                <div className='space-y-1 mb-5 text-left'>
                    {enhancedData.features.map((feature, index) => (
                        <p key={index} className='text-xs text-gray-600 leading-relaxed'>
                            {feature}
                        </p>
                    ))}
                </div>
            )}

            <div className='w-full flex justify-center mt-auto'>
                <a
                    href={user?.link || '#'}
                    target={user?.link ? '_blank' : '_self'}
                    rel={user?.link ? 'noopener noreferrer' : ''}
                    className={`flex items-center justify-center w-full gap-2 px-4 py-3 text-white 
            text-sm font-semibold rounded-lg shadow-md hover:shadow-lg 
            focus:ring-4 focus:ring-opacity-20 transition-all duration-300 min-h-[44px] 
            ${
                            user?.name === 'Soon'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    onClick={user?.name === 'Soon' ? e => e.preventDefault() : undefined}
                >
                    <span className='truncate'>
                        {enhancedData.buttonText ||
                            (user?.link ? 'Go to group' : 'No link available')}
                    </span>
                </a>
            </div>
        </div>
    )
})

DepartmentCard.displayName = 'DepartmentCard'

const Departments = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const { data } = await api.get('messenger/departments/')
            setUsers(Array.isArray(data) ? data : data?.results || [])
        } catch (err) {
            setError(
                err.response?.status === 404
                    ? 'Data not found'
                    : err.response?.status >= 500
                    ? 'Server error. Please try again later'
                    : err.request
                    ? 'Network error. Please check your connection'
                    : 'An error occurred while fetching data'
            )
        } finally {
            setLoading(false)
        }
    }, [])
    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])
    if (loading) {
        return (
            <div className='p-4 flex flex-wrap justify-center gap-6'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <DepartmentSkeleton key={i} />
                ))}
            </div>
        )
    }
    if (error) {
        return <ErrorState onRetry={fetchUsers} />
    }

    if (!users.length) {
        return (
            <div className='flex flex-col items-center justify-center p-8 text-center'>
                <div className='text-gray-400 text-6xl mb-4'>📂</div>
                <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                    No departments available yet
                </h3>
                <p className='text-gray-500 mb-4'>New departments will be added soon</p>
                <button
                    onClick={fetchUsers}
                    className='px-6 py-2 bg-blue-600 text-white font-medium rounded-lg 
                     hover:bg-blue-700 transition-colors duration-200'
                >
                    Refresh
                </button>
            </div>
        )
    }

    return (
        <section className='p-4'>
            <div className='flex flex-wrap justify-center gap-6'>
                {users.map((user, index) => (
                    <div
                        key={user?.id || index}
                        className='flex-shrink-0 w-full sm:w-[45%] lg:w-[30%]'
                    >
                        <DepartmentCard user={user} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Departments


