interface ClassSubmissionSummaryProps {
  title: string;
  topic: string;
  subject: string;
  aim: string[];
  media: { videos: number; pdfs: number };
  submittedOn: string;
  dateTime: string;
  status: "Pending" | "Approved" | "Rejected";
}

export const ClassSubmissionSummary = ({
  title,
  topic,
  subject,
  aim,
  media,
  submittedOn,
  dateTime,
  status,
}: ClassSubmissionSummaryProps) => {
  // Format media string
  const mediaString = `${media.videos} Video${media.videos !== 1 ? 's' : ''}, ${media.pdfs} PDF${media.pdfs !== 1 ? 's' : ''}`;
  
  // Format aim array into string with line breaks
  const aimText = aim.join('\n');

  // Status styling
  const statusConfig = {
    Pending: { 
      bgColor: 'bg-orange-500', 
      textColor: 'text-orange-600',
      icon: '!'
    },
    Approved: { 
      bgColor: 'bg-green-500', 
      textColor: 'text-green-600',
      icon: '✓'
    },
    Rejected: { 
      bgColor: 'bg-red-500', 
      textColor: 'text-red-600',
      icon: '✕'
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="bg-white rounded-lg  p-6 max-w-4xl">
      {/* Header */}
      <h2 className="text-lg font-semibold  mb-6 text-chestnut">
        Class Submission Summary
      </h2>

      {/* Content Grid */}
      <div className="space-y-6">
        {/* Row 1: Class Title and Topic */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-[#292382BF] mb-1">
              Class Title
            </label>
            <p className="text-sm font-medium text-chestnut">
              {title}
            </p>
          </div>
          <div>
            <label className="block text-sm text-[#292382BF] mb-1">
              Topic
            </label>
            <p className="text-sm font-medium text-chestnut">
              {topic}
            </p>
          </div>
        </div>

        {/* Row 2: Subject and Topic/Aim & Objectives */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-[#292382BF] mb-1">
              Subject
            </label>
            <p className="text-sm font-medium text-chestnut">
              {subject}
            </p>
          </div>
          <div>
            <label className="block text-sm text-chestnut mb-1">
              Topic (Aim & Objectives)
            </label>
            <p className="text-sm font-medium text-chestnut leading-relaxed whitespace-pre-line">
              {aimText}
            </p>
          </div>
        </div>

        {/* Row 3: Media Attached */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-chestnut mb-1">
              Media Attached
            </label>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-chestnut">
                {mediaString}
              </p>
            </div>
          </div>
        </div>

        {/* Row 4: Submitted On, Date & Time, and Status */}
        <div className="grid grid-cols-3 gap-8">
          <div>
            <label className="block text-sm text-[#292382BF] mb-1">
              Submitted On
            </label>
            <p className="text-sm font-medium text-chestnut">
              {submittedOn}
            </p>
          </div>
          <div>
            <label className="block text-sm text-[#292382BF] mb-1">
              Date & Time
            </label>
            <p className="text-sm font-medium text-chestnut">
              {dateTime}
            </p>
          </div>
          <div>
            <label className="block text-sm text-[#292382BF] mb-1">
              Status
            </label>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${currentStatus.bgColor} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">
                  {currentStatus.icon}
                </span>
              </div>
              <p className={`text-sm font-medium ${currentStatus.textColor}`}>
                {status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};