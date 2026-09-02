// Static topic -> study-plan config used to build roadmap items.
// Every URL here is a real, well-known public resource.

export type RoadmapResource = { label: string; url: string };

export type TopicPlan = {
  title: string;
  action: string;
  resources: [RoadmapResource, RoadmapResource];
};

export const TOPIC_PLANS: Record<string, TopicPlan> = {
  basic: {
    title: "Rebuild language fundamentals",
    action:
      "Spend 45 minutes a day writing small programs from scratch — loops, strings, recursion and file I/O — without copy-pasting.",
    resources: [
      { label: "LeetCode — Easy problem set", url: "https://leetcode.com/problemset/?difficulty=EASY" },
      { label: "GeeksforGeeks — Programming basics", url: "https://www.geeksforgeeks.org/basic-coding-problems-in-dsa-for-beginners/" },
    ],
  },
  dsa: {
    title: "Close the data structures & algorithms gap",
    action:
      "Work the NeetCode 150 in order — arrays, two pointers, stacks, trees, graphs — and re-solve every problem you failed after 48 hours.",
    resources: [
      { label: "NeetCode 150 roadmap", url: "https://neetcode.io/roadmap" },
      { label: "LeetCode — Blind 75 study plan", url: "https://leetcode.com/studyplan/top-interview-150/" },
    ],
  },
  dbms: {
    title: "Strengthen database fundamentals",
    action:
      "Revise normalisation, indexing, transactions and ACID, then write 5 joins/aggregations a day until query writing is automatic.",
    resources: [
      { label: "LeetCode — SQL 50 study plan", url: "https://leetcode.com/studyplan/top-sql-50/" },
      { label: "PostgreSQL official tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html" },
    ],
  },
  os: {
    title: "Master operating systems concepts",
    action:
      "Cover processes vs threads, scheduling, deadlocks, paging and virtual memory, and explain each aloud in under 90 seconds.",
    resources: [
      { label: "GeeksforGeeks — Operating Systems", url: "https://www.geeksforgeeks.org/operating-systems/" },
      { label: "MIT 6.1810 Operating System Engineering", url: "https://pdos.csail.mit.edu/6.828/2023/schedule.html" },
    ],
  },
};

export const ROADMAP_MAX_ITEMS = 5;
