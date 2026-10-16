import type { ClassSyllabusRecord, SyllabusModule } from './types'

export const MOCK_SYLLABUS_MODULES_DSA: SyllabusModule[] = [
  {
    id: 'mod-dsa-1',
    moduleNumber: 1,
    title: 'Introduction to Algorithms & Complexity',
    description: 'Asymptotic notation, Big-O analysis, recurrence relations, and algorithm design paradigms.',
    topics: [
      { id: 'top-dsa-101', title: 'Algorithm Complexity & Asymptotic Notation', status: 'completed' },
      { id: 'top-dsa-102', title: 'Master Theorem & Recurrence Relations', status: 'completed' },
      { id: 'top-dsa-103', title: 'Space vs Time Tradeoffs', status: 'completed' },
      { id: 'top-dsa-104', title: 'Divide and Conquer Strategies', status: 'completed' },
    ],
  },
  {
    id: 'mod-dsa-2',
    moduleNumber: 2,
    title: 'Linear Data Structures',
    description: 'Arrays, singly & doubly linked lists, stacks, and queues with real-world applications.',
    topics: [
      { id: 'top-dsa-201', title: 'Array Representations & Dynamic Resizing', status: 'completed' },
      { id: 'top-dsa-202', title: 'Singly and Doubly Linked Lists', status: 'completed' },
      { id: 'top-dsa-203', title: 'Stack Implementation & Postfix Evaluation', status: 'completed' },
      { id: 'top-dsa-204', title: 'Circular Queues & Priority Queues', status: 'completed' },
    ],
  },
  {
    id: 'mod-dsa-3',
    moduleNumber: 3,
    title: 'Non-Linear Data Structures: Trees',
    description: 'Binary trees, binary search trees (BST), AVL balanced trees, and tree traversals.',
    topics: [
      { id: 'top-dsa-301', title: 'Binary Tree Representation & Inorder/Preorder Traversals', status: 'completed' },
      { id: 'top-dsa-302', title: 'Binary Search Tree Operations (Insert, Delete, Search)', status: 'completed' },
      { id: 'top-dsa-303', title: 'AVL Tree Rotations & Self-Balancing', status: 'completed' },
      { id: 'top-dsa-304', title: 'Binary Heap & Heap Sort', status: 'completed' },
    ],
  },
  {
    id: 'mod-dsa-4',
    moduleNumber: 4,
    title: 'Graph Algorithms',
    description: 'Graph representations, BFS/DFS traversals, minimum spanning trees, and shortest path algorithms.',
    topics: [
      { id: 'top-dsa-401', title: 'Adjacency Matrix & Adjacency List Representations', status: 'completed' },
      { id: 'top-dsa-402', title: 'Breadth-First Search (BFS) & Depth-First Search (DFS)', status: 'completed' },
      { id: 'top-dsa-403', title: 'Dijkstra’s Shortest Path Algorithm', status: 'completed' },
      { id: 'top-dsa-404', title: 'Prim’s & Kruskal’s Minimum Spanning Tree', status: 'completed' },
    ],
  },
  {
    id: 'mod-dsa-5',
    moduleNumber: 5,
    title: 'Hashing & Dynamic Programming',
    description: 'Hash tables, collision resolution, memoization, and classic dynamic programming problems.',
    topics: [
      { id: 'top-dsa-501', title: 'Hash Functions & Collision Handling Techniques', status: 'completed' },
      { id: 'top-dsa-502', title: 'Memoization vs Tabulation Principles', status: 'completed' },
      { id: 'top-dsa-503', title: '0/1 Knapsack Problem & Optimal Substructure', status: 'completed' },
      { id: 'top-dsa-504', title: 'Longest Common Subsequence (LCS)', status: 'completed' },
    ],
  },
]

export const MOCK_SYLLABUS_MODULES_WEB: SyllabusModule[] = [
  {
    id: 'mod-web-1',
    moduleNumber: 1,
    title: 'HTML5 Semantic Architecture & Modern CSS',
    description: 'Semantic tags, accessible form controls, Flexbox, CSS Grid layouts, and responsive design.',
    topics: [
      { id: 'top-web-101', title: 'HTML5 Semantic Document Structure & SEO', status: 'completed' },
      { id: 'top-web-102', title: 'CSS3 Flexbox Mastery & Alignments', status: 'completed' },
      { id: 'top-web-103', title: 'CSS Grid Layouts & Responsive Breakpoints', status: 'completed' },
      { id: 'top-web-104', title: 'CSS Variables & Modern Theme Switching', status: 'completed' },
    ],
  },
  {
    id: 'mod-web-2',
    moduleNumber: 2,
    title: 'Modern JavaScript (ES6+) Fundamentals',
    description: 'Arrow functions, destructuring, modules, promises, async/await, and DOM manipulation.',
    topics: [
      { id: 'top-web-201', title: 'ES6 Syntax, Destructuring & Spread Operators', status: 'completed' },
      { id: 'top-web-202', title: 'DOM Traversal, Event Delegation & Listeners', status: 'completed' },
      { id: 'top-web-203', title: 'Promises, Fetch API & Async/Await Error Handling', status: 'completed' },
      { id: 'top-web-204', title: 'Local Storage, Session Storage & Cookies', status: 'completed' },
    ],
  },
  {
    id: 'mod-web-3',
    moduleNumber: 3,
    title: 'React.js Component Architecture',
    description: 'JSX, functional components, props, state management with useState and useEffect.',
    topics: [
      { id: 'top-web-301', title: 'React JSX Syntax, Rendering & Virtual DOM', status: 'completed' },
      { id: 'top-web-302', title: 'Props Validation & Component Composition', status: 'completed' },
      { id: 'top-web-303', title: 'useState & Controlled Form Inputs', status: 'completed' },
      { id: 'top-web-304', title: 'useEffect Lifecycle & API Side Effects', status: 'completed' },
    ],
  },
  {
    id: 'mod-web-4',
    moduleNumber: 4,
    title: 'Advanced React: Hooks & Global State',
    description: 'useCallback, useMemo, useRef, Context API, and custom hooks architecture.',
    topics: [
      { id: 'top-web-401', title: 'Custom Hooks Development & Code Reuse', status: 'completed' },
      { id: 'top-web-402', title: 'React Context API for Global Auth & Theme', status: 'completed' },
      { id: 'top-web-403', title: 'useMemo & useCallback Performance Tuning', status: 'in_progress' },
      { id: 'top-web-404', title: 'Zustand / Redux Toolkit State Stores', status: 'in_progress' },
    ],
  },
  {
    id: 'mod-web-5',
    moduleNumber: 5,
    title: 'Full Stack Integration & REST APIs',
    description: 'Node.js Express backend integration, Axios client, token authentication, and protected routes.',
    topics: [
      { id: 'top-web-501', title: 'React Router v6 Nested Routing & Route Guards', status: 'completed' },
      { id: 'top-web-502', title: 'Axios Interceptors & JWT Bearer Tokens', status: 'in_progress' },
      { id: 'top-web-503', title: 'Formik & Zod Client-Side Schema Validation', status: 'not_started' },
      { id: 'top-web-504', title: 'File Upload & Multipart Form Handling', status: 'not_started' },
    ],
  },
  {
    id: 'mod-web-6',
    moduleNumber: 6,
    title: 'Production Optimization, Testing & Deployment',
    description: 'Vite build tooling, Lighthouse audits, unit testing with Vitest, and Vercel cloud deployment.',
    topics: [
      { id: 'top-web-601', title: 'Code Splitting, Lazy Loading & Bundle Analysis', status: 'not_started' },
      { id: 'top-web-602', title: 'Vitest & React Testing Library Unit Tests', status: 'not_started' },
      { id: 'top-web-603', title: 'CI/CD Pipeline Setup & Cloud Production Deployment', status: 'not_started' },
    ],
  },
]

export const MOCK_SYLLABUS_MODULES_DBMS: SyllabusModule[] = [
  {
    id: 'mod-db-1',
    moduleNumber: 1,
    title: 'Database Architecture & ER Modeling',
    description: '3-tier database architecture, entity-relationship diagrams, keys, and ER-to-relational mapping.',
    topics: [
      { id: 'top-db-101', title: 'DBMS Architecture & Data Independence', status: 'completed' },
      { id: 'top-db-102', title: 'Entity-Relationship (ER) Modeling Concepts', status: 'completed' },
      { id: 'top-db-103', title: 'Primary, Candidate, Composite & Foreign Keys', status: 'completed' },
      { id: 'top-db-104', title: 'Converting ER Diagrams to Relational Tables', status: 'completed' },
    ],
  },
  {
    id: 'mod-db-2',
    moduleNumber: 2,
    title: 'Relational Algebra & Structured Query Language (SQL)',
    description: 'DDL, DML, DQL statements, aggregate functions, and nested subqueries.',
    topics: [
      { id: 'top-db-201', title: 'SQL Data Definition (CREATE, ALTER, DROP)', status: 'completed' },
      { id: 'top-db-202', title: 'SQL Queries with WHERE, ORDER BY, GROUP BY & HAVING', status: 'completed' },
      { id: 'top-db-203', title: 'Inner, Left, Right & Full Outer Joins', status: 'completed' },
      { id: 'top-db-204', title: 'Correlated Subqueries & Common Table Expressions', status: 'completed' },
    ],
  },
  {
    id: 'mod-db-3',
    moduleNumber: 3,
    title: 'Normalization & Schema Optimization',
    description: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, and dependency preservation.',
    topics: [
      { id: 'top-db-301', title: 'Anomalies in Unnormalized Relations', status: 'completed' },
      { id: 'top-db-302', title: 'First, Second & Third Normal Forms (1NF, 2NF, 3NF)', status: 'completed' },
      { id: 'top-db-303', title: 'Boyce-Codd Normal Form (BCNF) Decomposition', status: 'completed' },
      { id: 'top-db-304', title: 'Lossless-Join & Dependency Preservation', status: 'completed' },
    ],
  },
  {
    id: 'mod-db-4',
    moduleNumber: 4,
    title: 'Transaction Management & Concurrency Control',
    description: 'ACID properties, serializability, lock-based protocols, and deadlock handling.',
    topics: [
      { id: 'top-db-401', title: 'Transaction Lifecycle & ACID Properties', status: 'in_progress' },
      { id: 'top-db-402', title: 'Conflict & View Serializability', status: 'in_progress' },
      { id: 'top-db-403', title: 'Two-Phase Locking (2PL) Protocol', status: 'in_progress' },
      { id: 'top-db-404', title: 'Deadlock Detection, Prevention & Recovery', status: 'in_progress' },
    ],
  },
  {
    id: 'mod-db-5',
    moduleNumber: 5,
    title: 'Indexing, Storage & PostgreSQL Administration',
    description: 'B-Trees, B+ Trees, hash indexes, query execution plans, and PostgreSQL setup.',
    topics: [
      { id: 'top-db-501', title: 'B-Tree & B+ Tree File Organization', status: 'not_started' },
      { id: 'top-db-502', title: 'Creating and Optimizing Indexes in PostgreSQL', status: 'not_started' },
      { id: 'top-db-503', title: 'EXPLAIN ANALYZE & Query Cost Optimization', status: 'not_started' },
      { id: 'top-db-504', title: 'Database Backups, Replication & Security Grants', status: 'not_started' },
    ],
  },
]

export const MOCK_SYLLABUS_MODULES_JAVA: SyllabusModule[] = [
  {
    id: 'mod-java-1',
    moduleNumber: 1,
    title: 'Java Fundamentals & Control Flow',
    description: 'JVM architecture, bytecode, primitives, operators, and looping constructs.',
    topics: [
      { id: 'top-java-101', title: 'JDK, JRE & JVM Architecture Overview', status: 'completed' },
      { id: 'top-java-102', title: 'Data Types, Type Casting & Operators', status: 'completed' },
      { id: 'top-java-103', title: 'Conditional Statements & Switch Expressions', status: 'completed' },
      { id: 'top-java-104', title: 'Looping Constructs & Enhanced For-Each', status: 'completed' },
    ],
  },
  {
    id: 'mod-java-2',
    moduleNumber: 2,
    title: 'Object-Oriented Programming Core',
    description: 'Classes, objects, constructors, this keyword, encapsulation, and access modifiers.',
    topics: [
      { id: 'top-java-201', title: 'Class Definitions, Object Instantiation & Memory Layout', status: 'completed' },
      { id: 'top-java-202', title: 'Constructors, Overloading & Constructor Chaining', status: 'completed' },
      { id: 'top-java-203', title: 'Encapsulation with Private Fields & Getters/Setters', status: 'completed' },
      { id: 'top-java-204', title: 'Static Variables, Methods & Static Initialization Blocks', status: 'completed' },
    ],
  },
  {
    id: 'mod-java-3',
    moduleNumber: 3,
    title: 'Inheritance, Polymorphism & Interfaces',
    description: 'Super keyword, method overriding, abstract classes, and interface contracts.',
    topics: [
      { id: 'top-java-301', title: 'Single & Multilevel Inheritance using extends', status: 'completed' },
      { id: 'top-java-302', title: 'Method Overriding & Dynamic Method Dispatch', status: 'completed' },
      { id: 'top-java-303', title: 'Abstract Classes vs Interfaces', status: 'completed' },
      { id: 'top-java-304', title: 'Default & Static Methods in Java Interfaces', status: 'in_progress' },
    ],
  },
  {
    id: 'mod-java-4',
    moduleNumber: 4,
    title: 'Exception Handling & Multithreading',
    description: 'Checked/unchecked exceptions, try-with-resources, Thread class, and synchronization.',
    topics: [
      { id: 'top-java-401', title: 'Exception Hierarchy & Custom Exception Classes', status: 'in_progress' },
      { id: 'top-java-402', title: 'try-catch-finally & AutoCloseable Resources', status: 'in_progress' },
      { id: 'top-java-403', title: 'Creating Threads via Thread and Runnable', status: 'not_started' },
      { id: 'top-java-404', title: 'Thread Synchronization & Inter-Thread Communication', status: 'not_started' },
    ],
  },
  {
    id: 'mod-java-5',
    moduleNumber: 5,
    title: 'Java Collections Framework',
    description: 'List, Set, Map hierarchies, Generics, Comparable/Comparator, and Streams API.',
    topics: [
      { id: 'top-java-501', title: 'ArrayList, LinkedList & Vector Implementations', status: 'not_started' },
      { id: 'top-java-502', title: 'HashSet, TreeSet & LinkedHashSet Mechanics', status: 'not_started' },
      { id: 'top-java-503', title: 'HashMap Internals & ConcurrentHashMap', status: 'not_started' },
      { id: 'top-java-504', title: 'Java 8 Streams, Lambdas & Filters', status: 'not_started' },
    ],
  },
  {
    id: 'mod-java-6',
    moduleNumber: 6,
    title: 'File I/O, JDBC & Database Connectivity',
    description: 'Java NIO, file reading/writing, JDBC DriverManager, PreparedStatement, and transactions.',
    topics: [
      { id: 'top-java-601', title: 'Byte and Character Streams in java.io', status: 'not_started' },
      { id: 'top-java-602', title: 'JDBC Driver Registration & Connection Setup', status: 'not_started' },
      { id: 'top-java-603', title: 'Executing PreparedStatement Queries & ResultSets', status: 'not_started' },
      { id: 'top-java-604', title: 'Transaction Commit & Rollback with JDBC', status: 'not_started' },
    ],
  },
]

export const MOCK_SYLLABUS_MODULES_NETWORKS: SyllabusModule[] = [
  {
    id: 'mod-net-1',
    moduleNumber: 1,
    title: 'Network Models & Physical Layer',
    topics: [
      { id: 'top-net-101', title: 'OSI Reference Model vs TCP/IP Suite', status: 'completed' },
      { id: 'top-net-102', title: 'Transmission Media (Twisted Pair, Fiber Optic, Wireless)', status: 'completed' },
      { id: 'top-net-103', title: 'Bandwidth, Latency & Throughput Metrics', status: 'completed' },
      { id: 'top-net-104', title: 'Multiplexing Techniques (FDM, TDM, WDM)', status: 'completed' },
    ],
  },
  {
    id: 'mod-net-2',
    moduleNumber: 2,
    title: 'Data Link Layer & MAC Sublayer',
    topics: [
      { id: 'top-net-201', title: 'Framing, Error Detection & CRC Codes', status: 'completed' },
      { id: 'top-net-202', title: 'Flow Control: Stop-and-Wait & Sliding Window', status: 'completed' },
      { id: 'top-net-203', title: 'CSMA/CD & Ethernet IEEE 802.3 Standard', status: 'completed' },
      { id: 'top-net-204', title: 'Wireless LAN Architecture (IEEE 802.11 Wi-Fi)', status: 'completed' },
    ],
  },
  {
    id: 'mod-net-3',
    moduleNumber: 3,
    title: 'Network Layer & Routing Protocols',
    topics: [
      { id: 'top-net-301', title: 'IPv4 Addressing, Subnetting & CIDR Notation', status: 'completed' },
      { id: 'top-net-302', title: 'IPv6 Address Architecture & Transition Mechanisms', status: 'completed' },
      { id: 'top-net-303', title: 'Distance Vector Routing & RIP Protocol', status: 'completed' },
      { id: 'top-net-304', title: 'Link State Routing & OSPF Hierarchical Areas', status: 'completed' },
    ],
  },
  {
    id: 'mod-net-4',
    moduleNumber: 4,
    title: 'Transport Layer Protocols',
    topics: [
      { id: 'top-net-401', title: 'Port Addressing & Socket Multiplexing', status: 'completed' },
      { id: 'top-net-402', title: 'UDP Datagram Protocol & Real-Time Applications', status: 'completed' },
      { id: 'top-net-403', title: 'TCP Three-Way Handshake & Connection Teardown', status: 'completed' },
      { id: 'top-net-404', title: 'TCP Congestion Control (Slow Start & AIMD)', status: 'completed' },
    ],
  },
  {
    id: 'mod-net-5',
    moduleNumber: 5,
    title: 'Application Protocols & Network Security',
    topics: [
      { id: 'top-net-501', title: 'DNS Resolution & HTTP/HTTPS Protocol Specs', status: 'completed' },
      { id: 'top-net-502', title: 'Symmetric & Asymmetric Cryptography Principles', status: 'completed' },
      { id: 'top-net-503', title: 'SSL/TLS Handshake & Digital Certificates', status: 'completed' },
      { id: 'top-net-504', title: 'Firewalls, Intrusion Detection & VPN Tunnels', status: 'completed' },
    ],
  },
]

export const MOCK_SYLLABUS_MODULES_CLOUD: SyllabusModule[] = [
  {
    id: 'mod-cld-1',
    moduleNumber: 1,
    title: 'Cloud Service Models & Infrastructure',
    topics: [
      { id: 'top-cld-101', title: 'IaaS, PaaS & SaaS Service Models Comparison', status: 'completed' },
      { id: 'top-cld-102', title: 'Public, Private & Hybrid Cloud Deployments', status: 'completed' },
      { id: 'top-cld-103', title: 'AWS Global Infrastructure: Regions & Availability Zones', status: 'completed' },
      { id: 'top-cld-104', title: 'Cloud Economics, TCO & Shared Responsibility Model', status: 'completed' },
    ],
  },
  {
    id: 'mod-cld-2',
    moduleNumber: 2,
    title: 'Compute & Storage Services',
    topics: [
      { id: 'top-cld-201', title: 'EC2 Virtual Machine Provisioning & Security Groups', status: 'completed' },
      { id: 'top-cld-202', title: 'Elastic Block Store (EBS) & Instance Store', status: 'completed' },
      { id: 'top-cld-203', title: 'S3 Object Storage, Bucket Policies & Lifecycle Rules', status: 'completed' },
      { id: 'top-cld-204', title: 'AWS Lambda Serverless Functions & Event Triggers', status: 'completed' },
    ],
  },
  {
    id: 'mod-cld-3',
    moduleNumber: 3,
    title: 'Containerization with Docker',
    topics: [
      { id: 'top-cld-301', title: 'Docker Architecture, Daemon & Container Lifecycle', status: 'completed' },
      { id: 'top-cld-302', title: 'Writing Multi-Stage Dockerfiles for Production', status: 'completed' },
      { id: 'top-cld-303', title: 'Docker Compose for Multi-Container Web Apps', status: 'completed' },
      { id: 'top-cld-304', title: 'Publishing Images to Docker Hub & AWS ECR', status: 'completed' },
    ],
  },
  {
    id: 'mod-cld-4',
    moduleNumber: 4,
    title: 'Container Orchestration with Kubernetes',
    topics: [
      { id: 'top-cld-401', title: 'Kubernetes Cluster Architecture: Control Plane & Nodes', status: 'completed' },
      { id: 'top-cld-402', title: 'Pods, ReplicaSets & Declarative Deployments', status: 'completed' },
      { id: 'top-cld-403', title: 'ClusterIP, NodePort & LoadBalancer Services', status: 'completed' },
      { id: 'top-cld-404', title: 'ConfigMaps, Secrets & PersistentVolumeClaims', status: 'completed' },
    ],
  },
  {
    id: 'mod-cld-5',
    moduleNumber: 5,
    title: 'DevOps & CI/CD Pipelines',
    topics: [
      { id: 'top-cld-501', title: 'Git Feature Branching Workflow & Pull Request Best Practices', status: 'completed' },
      { id: 'top-cld-502', title: 'GitHub Actions Workflows: Automated Testing & Linting', status: 'completed' },
      { id: 'top-cld-503', title: 'Automated Container Build & Deployment to Cloud', status: 'completed' },
      { id: 'top-cld-504', title: 'Prometheus & Grafana Cloud Monitoring & Alerting', status: 'completed' },
    ],
  },
]

export const CLASS_SYLLABUS_MODULES_MAP: Record<string, SyllabusModule[]> = {
  'cls-101': MOCK_SYLLABUS_MODULES_DSA,
  'cls-102': MOCK_SYLLABUS_MODULES_WEB,
  'cls-103': MOCK_SYLLABUS_MODULES_DBMS,
  'cls-104': MOCK_SYLLABUS_MODULES_JAVA,
  'cls-105': MOCK_SYLLABUS_MODULES_NETWORKS,
  'cls-106': MOCK_SYLLABUS_MODULES_CLOUD,
}

/**
 * Calculates structured syllabus records with real dynamic percentages, module counts, and topic counts.
 */
export function calculateClassSyllabusRecord(
  classId: string,
  className: string,
  courseCode: string,
  program: string,
  year: string,
  semester: string,
  modules: SyllabusModule[],
): ClassSyllabusRecord {
  let totalTopics = 0
  let completedTopics = 0
  let inProgressTopics = 0
  let notStartedTopics = 0

  let completedModules = 0
  let inProgressModules = 0
  let notStartedModules = 0

  modules.forEach((mod) => {
    const modTotal = mod.topics.length
    const modCompleted = mod.topics.filter((t) => t.status === 'completed').length
    const modInProgress = mod.topics.filter((t) => t.status === 'in_progress').length
    const modNotStarted = mod.topics.filter((t) => t.status === 'not_started').length

    totalTopics += modTotal
    completedTopics += modCompleted
    inProgressTopics += modInProgress
    notStartedTopics += modNotStarted

    if (modCompleted === modTotal && modTotal > 0) {
      completedModules += 1
    } else if (modCompleted > 0 || modInProgress > 0) {
      inProgressModules += 1
    } else {
      notStartedModules += 1
    }
  })

  const completionPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  let status: 'Completed' | 'On Track' | 'In Progress' | 'Behind' = 'On Track'
  let phaseText = 'Mid-Term Evaluation Phase'

  if (completionPercentage === 100) {
    status = 'Completed'
    phaseText = 'All Modules Completed'
  } else if (completionPercentage >= 90) {
    status = 'On Track'
    phaseText = 'Final Review & Wrap-up'
  } else if (completionPercentage >= 75) {
    status = 'On Track'
    phaseText = 'Advanced Modules Phase'
  } else if (completionPercentage >= 50) {
    status = 'In Progress'
    phaseText = 'Mid-Term Evaluation Phase'
  } else if (completionPercentage > 0) {
    status = 'Behind'
    phaseText = 'Foundation Modules Phase'
  } else {
    status = 'Behind'
    phaseText = 'Curriculum Not Started'
  }

  return {
    classId,
    className,
    courseCode,
    program,
    year,
    semester,
    totalTopics,
    completedTopics,
    inProgressTopics,
    notStartedTopics,
    totalModules: modules.length,
    completedModules,
    inProgressModules,
    notStartedModules,
    completionPercentage,
    status,
    phaseText,
    modules,
  }
}
