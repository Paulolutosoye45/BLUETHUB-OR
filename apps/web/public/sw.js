const CACHE_NAME = "bluethub-pwa-v1";
const OFFLINE_URL = "/offline";

const assetsToCache = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
  "/src/utility-types.css",
  "/src/routing.tsx",
  "/src/contexts/auth-context.tsx",
  "/src/services/index.ts",
  "/src/services/auth.ts",
  "/src/services/school.ts",
  "/src/services/lesson.ts",
  "/src/services/student.ts",
  "/src/services/question.ts",
  "/src/services/quiz.ts",
  "/src/services/board-session.ts",
  "/src/services/class-media.ts",
  "/src/services/media-upload.ts",
  "/src/services/assessment.ts",
  "/src/services/student-board.ts",
  "/src/services/admin.ts",
  "/src/services/approval.ts",
  "/src/services/user.ts",
  "/src/services/question-job.ts",
  "/src/services/question-scan.ts",
  "/src/services/teacher.ts",
  "/src/services/admin-permissions.ts",
  "/src/utils/db.ts",
  "/src/utils/tenant.ts",
  "/src/utils/Hashing.ts",
  "/src/utils/index.ts",
  "/src/utils/localData.ts",
  "/src/utils/token.ts",
  "/src/utils/getDeviceType.ts",
  "/src/components/",
  "/src/layouts/",
  "/src/pages/",
  "/src/routes/",
  "/src/store/",
  "/public/vite.svg",
  "/public/android-chrome-192x192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      });
    })
  );
});