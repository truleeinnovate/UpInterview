/* eslint-disable react/prop-types */
import { useState } from 'react'
import EditEmailTemplate from './EditEmail'

const EmailTemplateViewPage = ({ onClose, record = {} }) => {
const [edit, setEdit] = useState(false);

    if (!record.name) {
        return (
            <div className="p-4">
                <h4 className="text-lg text-[#217989] font-semibold">Email Templates</h4>
                <div className="mt-4 text-gray-600">No template selected</div>
            </div>
        );
    }

    return (
       <>
        <div className=''>
            <div className="flex justify-between p-3">
                <h4 className="text-lg text-[#217989] font-semibold" onClick={onClose}>Email Templates / <span className="text-lg font-semibold text-black">{record.name}</span></h4>
                <button
                    onClick={() => setEdit(true)}
                    className="bg-[#217989] text-white px-4 py-2 rounded shadow "
                >
                    Edit
                </button>
            </div>

            <div className="bg-white mt-4">
                <div className="mb-4 flex gap-1 rounded-md flex-col border p-4">
                    <label className="text-lg font-semibold">Subject</label>
                    <div className="mt-1">{record.subject}</div>
                </div>
                <div className='border rounded-md p-4'>
                    <label className="text-lg font-semibold">Body</label>
                    <div className="mt-1 leading-6">
                        {record.body?.split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}

                        <p className="font-semibold mt-4">Best Regards,</p>
                        <p>upinterview</p>
                    </div>
                </div>
            </div>

            {edit && <EditEmailTemplate onClose={() => setEdit(false)} record={record} />}
        </div>
        </>
    )
}

export default EmailTemplateViewPage