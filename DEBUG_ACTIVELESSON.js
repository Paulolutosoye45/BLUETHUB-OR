// Temporary debug file - paste into browser console to check activeLesson
const active = sessionStorage.getItem('activeLesson');
if (active) {
  const parsed = JSON.parse(active);
  console.log('✅ activeLesson found:');
  console.log('  topicName:', parsed.lesson?.topicName);
  console.log('  subTopic:', parsed.lesson?.subTopic);
  console.log('  durationMinutes:', parsed.lesson?.durationMinutes);
  console.log('  Full lesson object:', parsed.lesson);
} else {
  console.error('❌ NO activeLesson in sessionStorage!');
}
