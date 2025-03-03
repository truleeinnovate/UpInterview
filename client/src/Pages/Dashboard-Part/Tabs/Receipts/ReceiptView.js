import { FiMaximize2 } from 'react-icons/fi';

const ReceiptView = ({ show, onClose, record }) => {


  
  const handleClose = () => {
    onClose();
  
  };

  return (
    <div className="relative ">
    {show && (
      <div className="fixed top-0 left-0 w-[50%] h-full bg-black opacity-50 z-10"></div>
    )}
    <div
      className={`fixed top-0 right-0 w-[50%] h-full  bg-white shadow-lg transform transition-transform duration-300 ${show ? "translate-x" : "translate-x-full"
        }`}
      style={{ overflowY: "auto" }}
    >

        <div className="flex bg-[#217989] h-16 text-white justify-between items-center pt-2 pb-2 ps-6 border-b">
                <h1 className="text-xl  text-center font-semibold">Receipt Details </h1>
                <div className='flex items-center gap-6 mr-4'>
                  <FiMaximize2 className='text-xl' />
                  <button onClick={handleClose} className=" w-6 text-2xl hover:text-red-500">
                    &times;
                  </button>
                </div>
              </div>



        </div>
        </div>
  )
}

export default ReceiptView