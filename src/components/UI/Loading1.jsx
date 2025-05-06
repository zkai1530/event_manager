import { createPortal } from "react-dom";
const Loading1 = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="border-t-main-bold flex h-23 w-23 animate-spin items-center justify-center rounded-full border-6 border-transparent">
      <div className="border-t-emphasis flex h-16 w-16 animate-spin items-center justify-center rounded-full border-6 border-transparent" />
    </div>
  );
};

export default Loading1;
