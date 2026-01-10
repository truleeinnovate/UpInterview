import { useUpdateRoundStatus } from "../../../../apiHooks/useMockInterviews";

const ScheduleCancelPopup = ({ onClose, row }) => {
  const updateRoundStatus = useUpdateRoundStatus();

  console.log(row, "row");
  const handlePopupConfirm = async (e, _id) => {
    e.preventDefault();
    try {
      const payload = {
        action: "Cancelled",
      };
      await updateRoundStatus.mutateAsync({
        mockInterviewId: row?._id,
        roundId: row?.rounds[0]?._id,
        payload,
      });
      //   let result = await deleteMockInterview.mutateAsync(row._id);
      //   console.log(result, "result");
      onClose();
    } catch (error) {
      console.error(
        "Error updating interview status or posting notification:",
        error
      );
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white p-5 rounded shadow-lg">
        <p>Are you sure you want to cancel this scheduled round?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handlePopupConfirm}
            className="bg-red-500 text-white px-4 py-1 rounded"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="border border-custom-blue px-4 py-1 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCancelPopup;
