import enginerring from "@/assets/png/engineering.png"
import VideoLessonCard from "./video-card";


const lessons = [
    {
        thumbnail: enginerring,
        title: "Linear Equation: Solving For X",
        description:
            "Learn the fundamentals of solving linear equations with step-by-step examples and practice problems.",
        date: "Tuesday, 27 July 2025",
        duration: "8:45",
        level: "Beginner",
    },
    {
        thumbnail: enginerring,
        title: "Quadratic Equations and Graphing",
        description:
            "Master quadratic equations and understand how to graph parabolas with real-world applications.",
        date: "Tuesday, 27 July 2025",
        duration: "7:45",
        level: "Beginner",
    },

    {
        thumbnail: enginerring,
        title: "Polynomial Functions Deep Dive",
        description:
            "Explore polynomial functions, their properties, and how to factor complex expressions effectively.",
        date: "Tuesday, 27 July 2025",
        duration: "10:45",
        level: "Beginner",
    },

    {
        thumbnail: enginerring,
        title: "Polynomial Functions Deep Dive II",
        description:
            "Explore polynomial functions, their properties, and how to factor complex expressions effectively.",
        date: "Tuesday, 27 July 2025",
        duration: "9:45",
        level: "Beginner",
    },
];

const VideoLessonList = () => {
    return (
        <div className="space-y-7">
            {lessons.map((lesson, index) => (
                <VideoLessonCard key={index} {...lesson} />
            ))}
        </div>
    );
};

export default VideoLessonList;
