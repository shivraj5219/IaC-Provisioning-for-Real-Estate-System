import './Loading.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-leaf spinner-leaf-1">🌱</div>
        <div className="spinner-leaf spinner-leaf-2">🌿</div>
        <div className="spinner-leaf spinner-leaf-3">🍃</div>
        <div className="spinner-leaf spinner-leaf-4">🌾</div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default Loading;
