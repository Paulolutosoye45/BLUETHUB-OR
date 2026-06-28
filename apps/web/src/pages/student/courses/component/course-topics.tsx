import AllTopics from "./all-topics"
import type { CoursesTopic } from "./topic-card";



const CourseTopics = () => {

  const TOPICS: CoursesTopic[] = [
      {
          id: "t1",
          title: "Topic 1 — Living Things",
          icon: "🌿",
          iconBg: "bg-green-100",
          subtopicCount: 4,
          status: "Completed",
          progress: 100,
          subtopics: [
              { id: "s1", title: "Characteristics of Living Things", type: "Video", done: true },
              { id: "s2", title: "Cell Structure & Function", type: "Video", done: true },
              { id: "s3", title: "Photosynthesis", type: "Reading", done: true },
              { id: "s4", title: "Classification of Animals", type: "PDF", done: true },
          ],
      },
      {
          id: "t2",
          title: "Topic 2 — The Solar System",
          icon: "🌍",
          iconBg: "bg-blue-100",
          subtopicCount: 4,
          status: "In Progress",
          progress: 50,
          subtopics: [
              { id: "s5", title: "Introduction to the Solar System", type: "Video", done: true },
              { id: "s6", title: "The Planets", type: "Video", done: false },
              { id: "s7", title: "The Sun & Moon", type: "Reading", done: false },
              { id: "s8", title: "Space Exploration", type: "PDF", done: false },
          ],
      },
      {
          id: "t3",
          title: "Topic 3 — Matter & Materials",
          icon: "🪨",
          iconBg: "bg-gray-100",
          subtopicCount: 2,
          status: "Not Started",
          progress: 0,
      },
      {
          id: "t4",
          title: "Topic 4 — Energy",
          icon: "⚡",
          iconBg: "bg-yellow-100",
          subtopicCount: 3,
          status: "Not Started",
          progress: 0,
      },
      {
          id: "t5",
          title: "Topic 5 — The Environment",
          icon: "🌱",
          iconBg: "bg-green-100",
          subtopicCount: 2,
          status: "Not Started",
          progress: 0,
      },
      {
          id: "t6",
          title: "Topic 6 — Human Body System",
          icon: "🫀",
          iconBg: "bg-red-100",
          subtopicCount: 2,
          status: "Not Started",
          progress: 0,
      },
  ];
  return (
    <div className="min-h-screen">
      <AllTopics topics={TOPICS} totalLessons={7}/>
    </div>
  )
}

export default CourseTopics