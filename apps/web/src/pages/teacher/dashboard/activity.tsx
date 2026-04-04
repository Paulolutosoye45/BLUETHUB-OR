
const cardData = [
  {
    label: "Total Students",
    count: 128,
    change: "+5 this week",
    icon: (
      <svg width="40" height="40" viewBox="0 0 51 51" fill="none">
        <path d="M50.6544 25.2792C50.6544 39.2222 39.3514 50.5251 25.4085 50.5251C11.4656 50.5251 0.162598 39.2222 0.162598 25.2792C0.162598 11.3363 11.4656 0.0333252 25.4085 0.0333252C39.3514 0.0333252 50.6544 11.3363 50.6544 25.2792ZM4.11765 25.2792C4.11765 37.0378 13.6499 46.5701 25.4085 46.5701C37.1671 46.5701 46.6993 37.0378 46.6993 25.2792C46.6993 13.5206 37.1671 3.98838 25.4085 3.98838C13.6499 3.98838 4.11765 13.5206 4.11765 25.2792Z" fill="#D9D9D9"/>
        <path d="M0.162598 25.2792C0.162597 29.8987 1.43009 34.4297 3.82705 38.3787C6.22401 42.3277 9.65853 45.5433 13.7566 47.6754C17.8547 49.8075 22.4592 50.7743 27.0687 50.4705C31.6782 50.1667 36.1161 48.604 39.8989 45.9525C43.6817 43.301 46.6645 39.6625 48.5225 35.4331C50.3804 31.2036 51.0423 26.5455 50.436 21.966C49.8298 17.3864 47.9786 13.061 45.0841 9.46069C42.1896 5.86043 38.3628 3.12336 34.0203 1.54756L32.6712 5.2654C36.3333 6.59433 39.5607 8.90261 42.0017 11.9388C44.4427 14.9751 46.0039 18.6229 46.5152 22.485C47.0265 26.3471 46.4683 30.2755 44.9014 33.8424C43.3345 37.4092 40.819 40.4777 37.6288 42.7138C34.4386 44.9499 30.696 46.2678 26.8086 46.524C22.9212 46.7802 19.0381 45.9649 15.582 44.1668C12.1259 42.3687 9.22948 39.6569 7.20803 36.3265C5.18658 32.9962 4.11765 29.175 4.11765 25.2792H0.162598Z" fill="#292382"/>
        <path d="M30.3836 12.6567H37.1821C37.4074 12.6567 37.6236 12.7463 37.783 12.9056C37.9423 13.065 38.0319 13.2812 38.0319 13.5065V20.305C38.0322 20.4732 37.9825 20.6378 37.8891 20.7779C37.7958 20.9179 37.6629 21.0271 37.5075 21.0915C37.352 21.1559 37.1809 21.1728 37.0159 21.1399C36.8508 21.1069 36.6993 21.0258 36.5804 20.9066L33.7829 18.1074L13.9893 37.9026L12.786 36.6993L32.5812 16.9057L29.782 14.1082C29.6628 13.9893 29.5817 13.8378 29.5487 13.6727C29.5158 13.5077 29.5327 13.3366 29.5971 13.1811C29.6615 13.0257 29.7707 12.8928 29.9107 12.7995C30.0508 12.7061 30.2154 12.6564 30.3836 12.6567Z" fill="#292382"/>
      </svg>
    ),
  },
  {
    label: "Active Classes",
    count: 8,
    change: "+1 this week",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#D9D9D9"/>
        <rect x="7" y="7" width="10" height="10" rx="2" fill="#292382"/>
      </svg>
    ),
  },
  {
    label: "New Assessments",
    count: 15,
    change: "+3 this week",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#D9D9D9"/>
        <path d="M12 7v5l3 3" stroke="#292382" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Attendance Rate",
    count: "92%",
    change: "2% this week",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#D9D9D9"/>
        <path d="M12 16v-4" stroke="#292382" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 8h0" stroke="#292382" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Staff On Duty",
    count: 24,
    change: "None this week",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="8" rx="6" ry="4" fill="#D9D9D9"/>
        <ellipse cx="12" cy="16" rx="8" ry="5" fill="#292382" fillOpacity="0.2"/>
      </svg>
    ),
  },
];

const Activity = () => (
 <div className="w-full my-4">
    <div className="flex gap-4 overflow-x-auto  [&::-webkit-scrollbar]:hidden scrollbar-none snap-x snap-mandatory scroll-smooth py-2 px-1">
      {cardData.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-[13.75px] shadow flex justify-between items-start px-6 py-6 min-w-55 max-w-60 snap-start transition hover:shadow-lg"
        >
          <div className="space-y-2.5">
            <h3 className="font-medium text-xs leading-none text-[#9CA3AF] capitalize">{card.label}</h3>
            <h4 className="font-semibold text-2xl leading-[100%] text-[#23255D]">{card.count}</h4>
            <div className="bg-chestnut/10 py-1 px-3 rounded-md">
              <p className="text-chestnut font-normal text-sm">{card.change}</p>
            </div>
          </div>
          <div className="mt-4  flex items-center justify-center">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Activity;
