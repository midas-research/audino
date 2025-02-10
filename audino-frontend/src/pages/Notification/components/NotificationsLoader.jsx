export default function NotificationLoader() {
  return (
    <div className="bg-white dark:bg-audino-midnight w-[300px] animate-pulse">
      <div
        role="status"
        className="max-w-md p-4 space-y-4 animate-pulse md:p-6"
      >
        <div className="header flex flex-col">
          <div className="h-3 bg-gray-200 rounded w-3/5 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-1/4"></div>
        </div>

        <div className="notifications-list space-y-4">
          {[...Array(10).keys()].map((load) => (
            <div
              className="notification-item"
              key={`notification-loader-${load}`}
            >
              <div className="header flex flex-col">
                <div className="h-3 bg-gray-200 rounded w-3/5 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
