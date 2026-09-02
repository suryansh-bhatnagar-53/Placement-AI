// Static cheat-sheet content. No LLM calls are used to render this.
// Every link points at a real, well-known public resource.

export type CheatItem = { name: string; detail?: string; url?: string };
export type CheatSection = {
  key: string;
  title: string;
  topics?: string[]; // interview topic keys this section maps to (for weak-spot badges)
  items: CheatItem[];
};
export type CheatSheet = { role: "SE" | "ML" | "DA"; role_label: string; sections: CheatSection[] };

const SE: CheatSheet = {
  role: "SE",
  role_label: "Software Engineering",
  sections: [
    {
      key: "core",
      title: "Core Topics",
      topics: ["dsa", "dbms", "os", "basic"],
      items: [
        { name: "Arrays, strings & hashing", detail: "Two pointers, sliding window, prefix sums." },
        { name: "Linked lists, stacks & queues", detail: "Reversal, cycle detection, monotonic stack." },
        { name: "Trees & graphs", detail: "DFS/BFS, binary search trees, topological sort." },
        { name: "Dynamic programming", detail: "1D/2D tables, memoisation, knapsack family." },
        { name: "DBMS", detail: "Normalisation, indexing, transactions, ACID, joins." },
        { name: "Operating systems", detail: "Processes vs threads, scheduling, deadlocks, paging." },
        { name: "OOP & design", detail: "SOLID, composition over inheritance, common patterns." },
        { name: "Complexity analysis", detail: "Big-O of your own solution, stated before you code." },
      ],
    },
    {
      key: "problems",
      title: "Coding Problems",
      topics: ["dsa", "basic"],
      items: [
        { name: "Two Sum", url: "https://leetcode.com/problems/two-sum/" },
        { name: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/" },
        { name: "Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
        { name: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
        { name: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
        { name: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/" },
        { name: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
        { name: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/" },
        { name: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/" },
        { name: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
        { name: "Coin Change", url: "https://leetcode.com/problems/coin-change/" },
        { name: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/" },
      ],
    },
    {
      key: "concepts",
      title: "Interview Concepts",
      topics: ["os", "dbms"],
      items: [
        { name: "Explain your approach first", detail: "State brute force, then optimise, then code." },
        { name: "Trade-off talk", detail: "Time vs space, readability vs micro-optimisation." },
        { name: "Concurrency basics", detail: "Race conditions, locks, atomicity — with an example." },
        { name: "System design lite", detail: "Caching, load balancing, DB choice for a small service." },
        { name: "Behavioural STAR", detail: "Situation, Task, Action, Result — 90 seconds max." },
      ],
    },
    {
      key: "projects",
      title: "Project Ideas",
      items: [
        { name: "URL shortener", detail: "Pitch: shorten and track links at scale. Stack: Node/Postgres/Redis. Proves: hashing, caching, schema design." },
        { name: "Real-time chat app", detail: "Pitch: rooms with presence and history. Stack: React/WebSockets/Postgres. Proves: event-driven design." },
        { name: "Job board aggregator", detail: "Pitch: scrape and de-duplicate listings. Stack: Python/FastAPI/Postgres. Proves: ETL and data modelling." },
        { name: "File storage service", detail: "Pitch: upload, share and expire files. Stack: Node/S3-compatible store. Proves: streaming and auth." },
        { name: "CI dashboard", detail: "Pitch: visualise build health across repos. Stack: React/REST APIs. Proves: API integration and charts." },
      ],
    },
    {
      key: "timeline",
      title: "4-Week Timeline",
      items: [
        { name: "Week 1", detail: "Arrays, strings, hashing — 3 problems a day plus complexity drills." },
        { name: "Week 2", detail: "Linked lists, stacks, queues, trees — plus DBMS revision." },
        { name: "Week 3", detail: "Graphs and dynamic programming — plus OS revision." },
        { name: "Week 4", detail: "Timed mock interviews, project walkthroughs and behavioural answers." },
      ],
    },
    {
      key: "resources",
      title: "Resources",
      items: [
        { name: "NeetCode 150", url: "https://neetcode.io/practice" },
        { name: "LeetCode — Top Interview 150", url: "https://leetcode.com/studyplan/top-interview-150/" },
        { name: "GeeksforGeeks — DSA", url: "https://www.geeksforgeeks.org/data-structures/" },
        { name: "MIT 6.1810 — Operating System Engineering", url: "https://pdos.csail.mit.edu/6.828/2023/schedule.html" },
      ],
    },
  ],
};

const ML: CheatSheet = {
  role: "ML",
  role_label: "Machine Learning",
  sections: [
    {
      key: "core",
      title: "Core Topics",
      topics: ["dsa", "dbms", "basic"],
      items: [
        { name: "Probability & statistics", detail: "Bayes, distributions, hypothesis testing." },
        { name: "Linear algebra", detail: "Vectors, matrices, eigenvalues, SVD intuition." },
        { name: "Classical ML", detail: "Linear/logistic regression, trees, boosting, SVM, k-means." },
        { name: "Model evaluation", detail: "Precision/recall, ROC-AUC, cross-validation, leakage." },
        { name: "Bias-variance & regularisation", detail: "L1/L2, dropout, early stopping." },
        { name: "Deep learning", detail: "CNNs, RNNs, transformers, attention." },
        { name: "Feature engineering", detail: "Encoding, scaling, imbalanced data handling." },
        { name: "Python & SQL fluency", detail: "NumPy, pandas, and joins/aggregations." },
      ],
    },
    {
      key: "problems",
      title: "Coding Problems",
      topics: ["dsa", "basic", "dbms"],
      items: [
        { name: "Two Sum", url: "https://leetcode.com/problems/two-sum/" },
        { name: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
        { name: "K Closest Points to Origin", url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
        { name: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
        { name: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/" },
        { name: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/" },
        { name: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/" },
        { name: "Random Pick with Weight", url: "https://leetcode.com/problems/random-pick-with-weight/" },
        { name: "SQL — Rank Scores", url: "https://leetcode.com/problems/rank-scores/" },
        { name: "SQL — Department Top Three Salaries", url: "https://leetcode.com/problems/department-top-three-salaries/" },
        { name: "Titanic — Machine Learning from Disaster", url: "https://www.kaggle.com/competitions/titanic" },
        { name: "House Prices — Advanced Regression", url: "https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques" },
      ],
    },
    {
      key: "concepts",
      title: "Interview Concepts",
      topics: ["dbms"],
      items: [
        { name: "Frame the metric first", detail: "Tie the model metric to the business outcome." },
        { name: "Overfitting story", detail: "How you detected it and what you changed." },
        { name: "Data leakage", detail: "Concrete example from your own project." },
        { name: "Deployment reality", detail: "Batch vs real-time, monitoring, drift." },
        { name: "Explainability", detail: "Feature importance, SHAP, and when it matters." },
      ],
    },
    {
      key: "projects",
      title: "Project Ideas",
      items: [
        { name: "Churn prediction service", detail: "Pitch: flag at-risk customers weekly. Stack: pandas/scikit-learn/FastAPI. Proves: end-to-end ML." },
        { name: "Resume-to-job matcher", detail: "Pitch: rank jobs against a resume. Stack: sentence embeddings/FAISS. Proves: NLP retrieval." },
        { name: "Image defect classifier", detail: "Pitch: spot faulty parts from photos. Stack: PyTorch/CNN. Proves: computer vision." },
        { name: "Demand forecasting dashboard", detail: "Pitch: forecast weekly sales. Stack: statsmodels/Prophet/Streamlit. Proves: time series." },
        { name: "RAG document assistant", detail: "Pitch: answer questions over internal docs. Stack: embeddings/vector store/LLM API. Proves: modern LLM engineering." },
      ],
    },
    {
      key: "timeline",
      title: "4-Week Timeline",
      items: [
        { name: "Week 1", detail: "Stats, probability and pandas/SQL drills." },
        { name: "Week 2", detail: "Classical ML plus one full Kaggle notebook end to end." },
        { name: "Week 3", detail: "Deep learning fundamentals and one deployed model." },
        { name: "Week 4", detail: "Case-study mocks, project storytelling, coding refresh." },
      ],
    },
    {
      key: "resources",
      title: "Resources",
      items: [
        { name: "scikit-learn user guide", url: "https://scikit-learn.org/stable/user_guide.html" },
        { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
        { name: "Dive into Deep Learning", url: "https://d2l.ai/" },
        { name: "LeetCode — SQL 50", url: "https://leetcode.com/studyplan/top-sql-50/" },
      ],
    },
  ],
};

const DA: CheatSheet = {
  role: "DA",
  role_label: "Data Analytics",
  sections: [
    {
      key: "core",
      title: "Core Topics",
      topics: ["dbms", "basic"],
      items: [
        { name: "SQL depth", detail: "Joins, window functions, CTEs, aggregation." },
        { name: "Data modelling", detail: "Star schema, fact vs dimension, normalisation." },
        { name: "Statistics", detail: "Descriptives, A/B testing, confidence intervals." },
        { name: "Excel / spreadsheets", detail: "Pivot tables, lookups, cleaning workflows." },
        { name: "Visualisation", detail: "Chart choice, dashboard hierarchy, storytelling." },
        { name: "Python for analysis", detail: "pandas, matplotlib, notebook hygiene." },
        { name: "Business metrics", detail: "Retention, funnel conversion, cohort analysis." },
        { name: "ETL basics", detail: "Ingestion, cleaning, scheduling, data quality checks." },
      ],
    },
    {
      key: "problems",
      title: "Coding Problems",
      topics: ["dbms", "basic"],
      items: [
        { name: "SQL — Combine Two Tables", url: "https://leetcode.com/problems/combine-two-tables/" },
        { name: "SQL — Second Highest Salary", url: "https://leetcode.com/problems/second-highest-salary/" },
        { name: "SQL — Rank Scores", url: "https://leetcode.com/problems/rank-scores/" },
        { name: "SQL — Department Top Three Salaries", url: "https://leetcode.com/problems/department-top-three-salaries/" },
        { name: "SQL — Consecutive Numbers", url: "https://leetcode.com/problems/consecutive-numbers/" },
        { name: "SQL — Employees Earning More Than Their Managers", url: "https://leetcode.com/problems/employees-earning-more-than-their-managers/" },
        { name: "SQL — Duplicate Emails", url: "https://leetcode.com/problems/duplicate-emails/" },
        { name: "SQL — Trips and Users", url: "https://leetcode.com/problems/trips-and-users/" },
        { name: "LeetCode SQL 50 study plan", url: "https://leetcode.com/studyplan/top-sql-50/" },
        { name: "StrataScratch — analytics question bank", url: "https://www.stratascratch.com/" },
        { name: "Two Sum (Python warm-up)", url: "https://leetcode.com/problems/two-sum/" },
        { name: "Group Anagrams (Python warm-up)", url: "https://leetcode.com/problems/group-anagrams/" },
      ],
    },
    {
      key: "concepts",
      title: "Interview Concepts",
      topics: ["dbms"],
      items: [
        { name: "Start from the question", detail: "Clarify the decision the analysis supports." },
        { name: "A/B test reasoning", detail: "Hypothesis, sample size, significance, guardrails." },
        { name: "Data quality checks", detail: "Nulls, duplicates, outliers — say how you catch them." },
        { name: "Dashboard design", detail: "One headline metric, then breakdowns." },
        { name: "Insight over output", detail: "Finish every answer with a recommendation." },
      ],
    },
    {
      key: "projects",
      title: "Project Ideas",
      items: [
        { name: "Sales performance dashboard", detail: "Pitch: track revenue by region and product. Stack: SQL/Power BI. Proves: modelling and visualisation." },
        { name: "Customer cohort analysis", detail: "Pitch: measure retention by signup month. Stack: SQL/pandas. Proves: cohort logic." },
        { name: "A/B test report", detail: "Pitch: evaluate a pricing experiment. Stack: Python/statsmodels. Proves: inferential statistics." },
        { name: "Marketing funnel tracker", detail: "Pitch: find the biggest drop-off step. Stack: SQL/Looker Studio. Proves: funnel analytics." },
        { name: "Public data deep dive", detail: "Pitch: an insight report from an open dataset. Stack: pandas/matplotlib. Proves: storytelling." },
      ],
    },
    {
      key: "timeline",
      title: "4-Week Timeline",
      items: [
        { name: "Week 1", detail: "SQL joins and aggregations — 5 queries a day." },
        { name: "Week 2", detail: "Window functions, CTEs and one modelled dataset." },
        { name: "Week 3", detail: "Statistics, A/B testing and a dashboard build." },
        { name: "Week 4", detail: "Case-study mocks and presenting insights out loud." },
      ],
    },
    {
      key: "resources",
      title: "Resources",
      items: [
        { name: "LeetCode — SQL 50", url: "https://leetcode.com/studyplan/top-sql-50/" },
        { name: "StrataScratch", url: "https://www.stratascratch.com/" },
        { name: "Mode — SQL Tutorial", url: "https://mode.com/sql-tutorial/" },
        { name: "Kaggle Datasets", url: "https://www.kaggle.com/datasets" },
      ],
    },
  ],
};

export const CHEAT_SHEETS: Record<"SE" | "ML" | "DA", CheatSheet> = { SE, ML, DA };
