import './EmptyState.css';

const EmptyState = ({ 
  icon = '📭', 
  title = 'No Data Found', 
  message = 'There is nothing to display at the moment.',
  actionText,
  onAction 
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionText && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
