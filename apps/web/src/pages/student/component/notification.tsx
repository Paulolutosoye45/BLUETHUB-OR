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
    <div className="overflow-hidden rounded-[26px] border border-white/75 bg-white/82 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="font-poppins text-lg font-semibold text-slate-900 capitalize">
          Notification{" "}
        </h2>
          <p className="mt-1 text-sm text-slate-500">Recent updates from your teachers and courses.</p>
        </div>
        <button type="button" className="rounded-full bg-[#f3f4f6] px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#e5e7eb]">View all</button>
      </div>
      <section className="px-5 py-5">
        <div className="space-y-4">
          {Notifications.map((notification, idx) => (
            <div key={idx} className="flex items-center gap-3 justify-between rounded-[20px] border border-slate-100 bg-slate-50/85 px-4 py-4 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-3 capitalize">
                <div
                  className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                <div className="space-y-1">
                  <h3 className="font-poppins text-sm font-semibold text-slate-800">
                    {notification.name}
                  </h3>
                  <p className="font-poppins text-xs font-medium text-slate-500">
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
