/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';


const EmailSetting = ({onClose}) => {
    let emailData = {
        FromEmail:"kumarp908@gmail.io",
        OwnEmail : ""
    }
    const [showEdit, setShowEdit] = useState(false);
    const [useOwnEmail, setUseOwnEmail] = useState(false);
    const [ownEmail, setOwnEmail] = useState(emailData.OwnEmail || "");
   

    const handleEdit = () => {
        if (showEdit) {
            emailData.OwnEmail = ownEmail;
            setShowEdit(false);
            
        } else {
            setShowEdit(true);
            setUseOwnEmail(false);
        }
    };

    const toggleUseOwnEmail = () => {
        setUseOwnEmail(prevState => !prevState);
    };

    const handleChange = (e) => {
        setOwnEmail(e.target.value);
    };

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h4 className="text-xl text-[#217989] font-semibold">Basic Settings</h4>
                <button
                    onClick={handleEdit}
                    className="bg-[#217989] text-white px-4 py-2 rounded">
                    {showEdit ? "Save" : "Edit"}
                </button>
            </div>

            {showEdit ? (
                <div className='space-y-6 border rounded-md p-4 border-[#217989] mt-4'>
                    <h4 className='text-xl font-semibold'>From Address</h4>
                    <div className='w-full flex text-lg'>
                        <label className='w-3/12'>Company Email</label>
                        <input 
                            type="text"
                            value={emailData.FromEmail || ""}
                            className='block border-b-2 text-gray-400 cursor-not-allowed focus:outline-none'
                            readOnly    
                        />
                    </div>

                    <div className='flex items-center'>
                        <span className='w-3/12'>Use Own Email</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={useOwnEmail}
                                onChange={toggleUseOwnEmail} 
                            />
                            <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-[#217989] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                    </div>

                    {useOwnEmail && (
                        <div className='w-full flex text-lg'>
                            <label className='w-3/12'>Own Email</label>
                            <input 
                                type="text"
                                value={ownEmail}
                                className='block border-b-2  focus:outline-none'
                                onChange={handleChange}    
                            />
                        </div>
                    )}
                </div>
            ) : 
            (
                <div className='space-y-6 border rounded-md p-4 border-[#217989] mt-4'>
                    <h4 className='text-xl font-semibold'>From Address</h4>
                    <div className='w-full flex text-lg'>
                        <span className='w-2/12'>From Address</span>
                        <span className='font-medium'>{emailData.OwnEmail === "" ? emailData.FromEmail : emailData.OwnEmail}</span>
                    </div>
                </div>
            )
            }
        </div>
    );
};

export default EmailSetting;
