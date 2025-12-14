export default function NotificationLoader() {
  return (
    <div className="bg-white dark:bg-audino-midnight w-full animate-pulse">
      <div role="status" className="max-w-md space-y-4 animate-pulse">
        <div className="notifications-list space-y-4">
          {[...Array(5).keys()].map((load) => (
            <div
              className="notification-item"
              key={`notification-loader-${load}`}
            >
              <div className="header flex flex-col">
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
