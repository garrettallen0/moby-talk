interface SignInModalProps {
  onClose: () => void;
  onSignIn: () => void;
}

export const SignInModal = ({ onClose, onSignIn }: SignInModalProps) => {
  return (
    <div className="modal">
      <div className="modal-content sign-in-modal">
        <h2>Please Sign In</h2>
        <p>Sign in to add an idea</p>
        <div className="modal-buttons">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={onSignIn} className="google-sign-in-button">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
              alt="Google logo" 
              className="google-logo"
            />
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}; 