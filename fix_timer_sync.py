#!/usr/bin/env python3
"""
Insert timer sync into RAF frame loop in reply.tsx
"""

file_path = r'c:\Users\hp\Desktop\TechHubFE-V2\BLUETHUB-OR\apps\web\src\component\reply.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the exact section and insert timer update
old_section = """      // ✅ Session position derived from audio's own clock — never drifts
      const sessionMs = batchStartMsRef.current +
        (audioRef.current?.currentTime ?? 0) * 1000;

      // Media frames"""

new_section = """      // ✅ Session position derived from audio's own clock — never drifts
      const sessionMs = batchStartMsRef.current +
        (audioRef.current?.currentTime ?? 0) * 1000;

      // Update timer from same frame loop - keeps display perfectly synced with board
      setReplayMs(sessionMs + replayDisplayOffsetMsRef.current);

      // Media frames"""

if old_section in content:
    content = content.replace(old_section, new_section)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Timer sync inserted into RAF loop")
else:
    print("❌ Could not find the section to edit")
    print("Looking for:")
    print(repr(old_section[:80]))
