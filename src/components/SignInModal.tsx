interface SignInModalProps {
  onClose: () => void;
  onSignIn: () => void;
}

export const SignInModal = ({ onClose, onSignIn }: SignInModalProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div 
        role="alertdialog" 
        aria-describedby="signin-description" 
        aria-labelledby="signin-title" 
        data-state="open" 
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg" 
        tabIndex={-1}
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 id="signin-title" className="text-lg font-semibold">Please Sign In</h2>
          <p id="signin-description" className="text-sm text-gray-600">Please sign in to reply</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <button 
            type="button" 
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2 mt-2 sm:mt-0"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onSignIn}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            <img src="/google.webp" alt="Google Logo" className="h-6 w-6" />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 