const Notification = () => {
  const Notifications = [
    {
      name: "new Basic Science Assignment Posted ",
      duedate: "30 Mintues ago",
    },
    {
      name: "mathematics Live Class ongoing ",
      duedate: "1 Hours Ago",
    },
    {
      name: " New Computer  Assignment Posted ",
      duedate: "1 Hours Ago",
    },
  ];

  return (
    <div className="border border-blck-b2/20 rounded-[10px] bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]">
      <div className="flex items-center justify-between p-6 border-b border-blck-b2/20 pb-7">
        <h2 className="font-poppins font-medium text-base text-blck-b2 capitalize">
          Notification{" "}
        </h2>
        <p className="font-poppins font-medium text-sm leading-[100%] text-student-chestnut">
          View all{" "}
        </p>
      </div>
      <section className="px-5 py-7">
        <div className="space-y-4">
          {Notifications.map((notification, idx) => (
            <div key={idx} className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3 capitalize">
                <div
                  className="p-1 rounded-full bg-red-500"></div>
                <div className="space-y-1">
                  <h3 className="font-poppins font-medium text-sm text-blck-b2">
                    {notification.name}
                  </h3>
                  <p className="font-poppins font-medium text-xs text-blck-b2">
                    {notification.duedate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Notification;
