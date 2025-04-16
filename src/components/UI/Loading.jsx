import { createPortal } from "react-dom";
const Loading = ({ isLoading }) => {
  if (!isLoading) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60">
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <div className="border-t-main-bold flex h-23 w-23 animate-spin items-center justify-center rounded-full border-6 border-transparent">
          <div className="border-t-emphasis flex h-16 w-16 animate-spin items-center justify-center rounded-full border-6 border-transparent" />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Loading;
