import React from "react";

const Billing = () => {
  return (
    <div
      style={{
        marginTop: "100px",
        marginLeft: "290px",
        marginBottom: "30px",
        marginRight: "15px",
      }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-x-8">
          <div className="border rounded shadow">
            <p className="text-center border-b-2 mb-3 p-2">Invoice Number & Date</p>
            <div className="ml-5 mr-5">
              <div className="grid grid-cols-3 my-3 gap-5">
                <div>Candidate Name</div>
                <div className="text-center">:</div>
                <div>John Doe</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Job Position</div>
                <div className="text-center">:</div>

                <div>Marketing Manager</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Invoice</div>
                <div className="text-center">:</div>

                <div>INV2024001</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Payment Status</div>
                <div className="text-center">:</div>

                <div>Paid</div>
              </div>
              <div>
                <button type="button" className='mb-3 text-sm border shadow rounded p-2 float-end'>
                  view
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded shadow">
            <p className="text-center border-b-2 mb-3 p-2">Invoice Number & Date</p>
            <div className="ml-5 mr-5">
              <div className="grid grid-cols-3 my-3 gap-5">
                <div>Candidate Name</div>
                <div className="text-center">:</div>
                <div>John Doe</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Job Position</div>
                <div className="text-center">:</div>

                <div>Marketing Manager</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Invoice</div>
                <div className="text-center">:</div>

                <div>INV2024001</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Payment Status</div>
                <div className="text-center">:</div>

                <div>Paid</div>
              </div>
              <div>
                <button type="button" className='mb-3 text-sm border shadow rounded p-2 float-end'>
                  view
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded shadow">
            <p className="text-center border-b-2 mb-3 p-2">Invoice Number & Date</p>
            <div className="ml-5 mr-5">
              <div className="grid grid-cols-3 my-3 gap-5">
                <div>Candidate Name</div>
                <div className="text-center">:</div>
                <div>John Doe</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Job Position</div>
                <div className="text-center">:</div>

                <div>Marketing Manager</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Invoice</div>
                <div className="text-center">:</div>

                <div>INV2024001</div>
              </div>
              <div className="grid grid-cols-3 my-3">
                <div> Payment Status</div>
                <div className="text-center">:</div>

                <div>Paid</div>
              </div>
              <div>
                <button type="button" className='mb-3 text-sm border shadow rounded p-2 float-end'>
                  view
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" className='mt-5 text-sm border shadow rounded p-2 float-end'>View More</button>
    </div>
  );
};
export default Billing;