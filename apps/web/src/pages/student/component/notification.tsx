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
    <div className="overflow-hidden rounded-md border border-white/75 bg-white/82 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="font-poppins text-sm font-semibold text-slate-900 capitalize">
          Notification
        </h2>
          <p className="mt-0.5 text-xs text-slate-500">Updates from your teachers and courses.</p>
        </div>
        <button type="button" className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#e5e7eb]">View all</button>
      </div>
      <section className="px-4 py-3">
        <div className="space-y-2">
          {Notifications.map((notification, idx) => (
            <div key={idx} className="flex items-center gap-2 justify-between rounded-[16px] border border-slate-100 bg-slate-50/85 px-3 py-2.5 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-2.5 capitalize">
                <div
                  className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="space-y-0.5">
                  <h3 className="font-poppins text-xs font-semibold text-slate-800">
                    {notification.name}
                  </h3>
                  <p className="font-poppins text-[10px] font-medium text-slate-500">
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
