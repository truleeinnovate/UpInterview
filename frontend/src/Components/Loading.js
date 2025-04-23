import React from 'react'

const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center mt-5">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-blue"></div>
            </div>
        </div>
    )
}

export default Loading