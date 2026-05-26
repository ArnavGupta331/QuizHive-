export const initialUsers = [
  // Admin
  {
    id: "admin-1",
    role: "admin",
    username: "admin",
    password: "admin123",
    name: "Dr. Amanda Waller",
    email: "admin@school.com"
  },
  // Teachers
  {
    id: "T1",
    role: "teacher",
    username: "smith",
    password: "teacher123",
    name: "Mr. John Smith",
    email: "smith@school.com",
    subject: "Science & Mathematics (Primary)",
    classes: [1, 2, 3, 4, 5, 6]
  },
  {
    id: "T2",
    role: "teacher",
    username: "davis",
    password: "teacher123",
    name: "Mrs. Sarah Davis",
    email: "davis@school.com",
    subject: "Advanced STEM (Secondary)",
    classes: [7, 8, 9, 10, 11, 12]
  },
  // Students
  {
    id: "S1",
    role: "student",
    username: "alex",
    password: "student123",
    name: "Alex Johnson",
    rollNumber: "S-501",
    class: 5,
    parentId: "P1",
    email: "alex@school.com"
  },
  {
    id: "S2",
    role: "student",
    username: "emma",
    password: "student123",
    name: "Emma Watson",
    rollNumber: "S-502",
    class: 5,
    parentId: "P2",
    email: "emma@school.com"
  },
  {
    id: "S3",
    role: "student",
    username: "michael",
    password: "student123",
    name: "Michael Brown",
    rollNumber: "S-1001",
    class: 10,
    parentId: "P3",
    email: "michael@school.com"
  },
  {
    id: "S4",
    role: "student",
    username: "sophia",
    password: "student123",
    name: "Sophia Miller",
    rollNumber: "S-1002",
    class: 10,
    parentId: "P4",
    email: "sophia@school.com"
  },
  {
    id: "S5",
    role: "student",
    username: "daniel",
    password: "student123",
    name: "Daniel Wilson",
    rollNumber: "S-1201",
    class: 12,
    parentId: "P5",
    email: "daniel@school.com"
  },
  // Parents
  {
    id: "P1",
    role: "parent",
    username: "robert",
    password: "parent123",
    name: "Robert Johnson",
    studentId: "S1",
    email: "robert@mail.com"
  },
  {
    id: "P2",
    role: "parent",
    username: "helen",
    password: "parent123",
    name: "Helen Watson",
    studentId: "S2",
    email: "helen@mail.com"
  },
  {
    id: "P3",
    role: "parent",
    username: "james",
    password: "parent123",
    name: "James Brown",
    studentId: "S3",
    email: "james@mail.com"
  },
  {
    id: "P4",
    role: "parent",
    username: "mary",
    password: "parent123",
    name: "Mary Miller",
    studentId: "S4",
    email: "mary@mail.com"
  },
  {
    id: "P5",
    role: "parent",
    username: "charles",
    password: "parent123",
    name: "Charles Wilson",
    studentId: "S5",
    email: "charles@mail.com"
  }
];
export const initialQuizzes = [
  {
    id: "Q1",
    title: "Introduction to Fractions",
    description: "Learn the basics of numerator, denominator, and basic additions of fractions.",
    class: 5,
    subject: "Mathematics",
    timeLimit: 10, // 10 minutes
    creatorId: "T1",
    questions: [
      {
        id: "q1_1",
        text: "What is the top number of a fraction called?",
        options: ["Numerator", "Denominator", "Integer", "Decimal"],
        correctAnswer: "Numerator"
      },
      {
        id: "q1_2",
        text: "What is 1/2 + 1/4?",
        options: ["3/4", "2/4", "1/6", "2/6"],
        correctAnswer: "3/4"
      },
      {
        id: "q1_3",
        text: "Which of the following is equivalent to 2/4?",
        options: ["1/2", "1/4", "3/4", "4/2"],
        correctAnswer: "1/2"
      },
      {
        id: "q1_4",
        text: "In the fraction 3/8, what is the denominator?",
        options: ["8", "3", "11", "5"],
        correctAnswer: "8"
      },
      {
        id: "q1_5",
        text: "What is 1 whole minus 1/3?",
        options: ["2/3", "1/3", "3/3", "1/2"],
        correctAnswer: "2/3"
      },
      {
        id: "q1_6",
        text: "Which fraction is the largest?",
        options: ["3/4", "1/2", "1/4", "5/8"],
        correctAnswer: "3/4"
      },
      {
        id: "q1_7",
        text: "What is 2/5 + 1/5?",
        options: ["3/5", "3/10", "2/25", "1/5"],
        correctAnswer: "3/5"
      },
      {
        id: "q1_8",
        text: "Convert 0.5 into a fraction in its simplest form.",
        options: ["1/2", "5/10", "2/4", "1/5"],
        correctAnswer: "1/2"
      },
      {
        id: "q1_9",
        text: "If a pizza has 8 slices and you eat 3, what fraction is left?",
        options: ["5/8", "3/8", "1/2", "8/3"],
        correctAnswer: "5/8"
      },
      {
        id: "q1_10",
        text: "What is 4/8 simplified?",
        options: ["1/2", "1/4", "2/3", "2/8"],
        correctAnswer: "1/2"
      }
    ]
  },
  {
    id: "Q2",
    title: "Plants & Photosynthesis",
    description: "Understand how plants make their food using sunlight, water, and carbon dioxide.",
    class: 5,
    subject: "Science",
    timeLimit: 8,
    creatorId: "T1",
    questions: [
      {
        id: "q2_1",
        text: "What green pigment do plants use to trap sunlight?",
        options: ["Chlorophyll", "Carotenoid", "Hemoglobin", "Melanin"],
        correctAnswer: "Chlorophyll"
      },
      {
        id: "q2_2",
        text: "What gas do plants absorb from the air for photosynthesis?",
        options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correctAnswer: "Carbon Dioxide"
      },
      {
        id: "q2_3",
        text: "What gas do plants release into the air as a product of photosynthesis?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"],
        correctAnswer: "Oxygen"
      },
      {
        id: "q2_4",
        text: "Which part of the plant absorbs water from the soil?",
        options: ["Roots", "Leaves", "Stem", "Flower"],
        correctAnswer: "Roots"
      },
      {
        id: "q2_5",
        text: "What is the main source of energy for plants?",
        options: ["Sunlight", "Water", "Soil nutrients", "Wind"],
        correctAnswer: "Sunlight"
      },
      {
        id: "q2_6",
        text: "What carbohydrate (sugar) do plants produce during photosynthesis?",
        options: ["Glucose", "Sucrose", "Lactose", "Starch"],
        correctAnswer: "Glucose"
      },
      {
        id: "q2_7",
        text: "In which part of the plant does photosynthesis mostly take place?",
        options: ["Leaves", "Roots", "Stems", "Seeds"],
        correctAnswer: "Leaves"
      },
      {
        id: "q2_8",
        text: "Tiny pores on the underside of leaves are called:",
        options: ["Stomata", "Chloroplasts", "Veins", "Roots"],
        correctAnswer: "Stomata"
      },
      {
        id: "q2_9",
        text: "Photosynthesis cannot happen without which of the following?",
        options: ["Sunlight", "Soil", "Worms", "Oxygen"],
        correctAnswer: "Sunlight"
      },
      {
        id: "q2_10",
        text: "What color are chloroplasts?",
        options: ["Green", "Brown", "Yellow", "Red"],
        correctAnswer: "Green"
      }
    ]
  },
  {
    id: "Q3",
    title: "Quadratic Equations",
    description: "Solving equations of degree 2, factoring, and using the quadratic formula.",
    class: 10,
    subject: "Mathematics",
    timeLimit: 15,
    creatorId: "T2",
    questions: [
      {
        id: "q3_1",
        text: "What is the standard form of a quadratic equation?",
        options: [
          "ax² + bx + c = 0",
          "ax + b = 0",
          "ax³ + bx² + cx + d = 0",
          "y = mx + c"
        ],
        correctAnswer: "ax² + bx + c = 0"
      },
      {
        id: "q3_2",
        text: "What is the quadratic formula?",
        options: [
          "x = (-b ± √(b² - 4ac)) / 2a",
          "x = (b ± √(b² - 4ac)) / 2a",
          "x = (-b ± √(b² + 4ac)) / 2a",
          "x = -b / 2a"
        ],
        correctAnswer: "x = (-b ± √(b² - 4ac)) / 2a"
      },
      {
        id: "q3_3",
        text: "If the discriminant (b² - 4ac) is positive, the roots are:",
        options: [
          "Real and distinct",
          "Real and equal",
          "Complex / Imaginary",
          "No roots exist"
        ],
        correctAnswer: "Real and distinct"
      },
      {
        id: "q3_4",
        text: "What are the roots of x² - 5x + 6 = 0?",
        options: ["2, 3", "-2, -3", "1, 6", "-1, -6"],
        correctAnswer: "2, 3"
      },
      {
        id: "q3_5",
        text: "If the discriminant is equal to zero, the roots are:",
        options: [
          "Real and equal",
          "Real and distinct",
          "Complex",
          "Non-real"
        ],
        correctAnswer: "Real and equal"
      },
      {
        id: "q3_6",
        text: "Find the discriminant of 2x² - 4x + 3 = 0.",
        options: ["-8", "8", "4", "-4"],
        correctAnswer: "-8"
      },
      {
        id: "q3_7",
        text: "What is the sum of roots for the equation ax² + bx + c = 0?",
        options: ["-b/a", "c/a", "b/a", "-c/a"],
        correctAnswer: "-b/a"
      },
      {
        id: "q3_8",
        text: "What is the product of roots for the equation ax² + bx + c = 0?",
        options: ["c/a", "-b/a", "b/a", "-c/a"],
        correctAnswer: "c/a"
      },
      {
        id: "q3_9",
        text: "Solve x² - 9 = 0.",
        options: ["±3", "3 only", "-3 only", "±9"],
        correctAnswer: "±3"
      },
      {
        id: "q3_10",
        text: "What is the shape of the graph of a quadratic function?",
        options: ["Parabola", "Straight line", "Circle", "Hyperbola"],
        correctAnswer: "Parabola"
      }
    ]
  },
  {
    id: "Q4",
    title: "Chemical Reactions",
    description: "Types of chemical reactions, balancing equations, and catalysts.",
    class: 10,
    subject: "Chemistry",
    timeLimit: 12,
    creatorId: "T2",
    questions: [
      {
        id: "q4_1",
        text: "A reaction in which two or more substances combine to form a single substance is called:",
        options: [
          "Combination reaction",
          "Decomposition reaction",
          "Displacement reaction",
          "Double displacement"
        ],
        correctAnswer: "Combination reaction"
      },
      {
        id: "q4_2",
        text: "What is the balanced equation for the formation of water?",
        options: [
          "2H₂ + O₂ -> 2H₂O",
          "H₂ + O₂ -> H₂O",
          "H + O -> HO",
          "2H + O -> H₂O"
        ],
        correctAnswer: "2H₂ + O₂ -> 2H₂O"
      },
      {
        id: "q4_3",
        text: "A substance that increases the rate of a chemical reaction without undergoing permanent change is a:",
        options: ["Catalyst", "Reactant", "Product", "Inhibitor"],
        correctAnswer: "Catalyst"
      },
      {
        id: "q4_4",
        text: "What type of reaction is: Zn + CuSO₄ -> ZnSO₄ + Cu?",
        options: [
          "Displacement reaction",
          "Combination reaction",
          "Decomposition reaction",
          "Double displacement"
        ],
        correctAnswer: "Displacement reaction"
      },
      {
        id: "q4_5",
        text: "Rusting of iron is an example of:",
        options: ["Oxidation", "Reduction", "Decomposition", "Neutralisation"],
        correctAnswer: "Oxidation"
      },
      {
        id: "q4_6",
        text: "What gas is evolved when zinc reacts with dilute hydrochloric acid?",
        options: ["Hydrogen", "Oxygen", "Chlorine", "Carbon Dioxide"],
        correctAnswer: "Hydrogen"
      },
      {
        id: "q4_7",
        text: "A chemical reaction that releases heat is described as:",
        options: ["Exothermic", "Endothermic", "Reversible", "Isothermal"],
        correctAnswer: "Exothermic"
      },
      {
        id: "q4_8",
        text: "A reaction that absorbs heat energy is called:",
        options: ["Endothermic", "Exothermic", "Combustion", "Precipitation"],
        correctAnswer: "Endothermic"
      },
      {
        id: "q4_9",
        text: "What is the color of copper sulfate solution?",
        options: ["Blue", "Green", "Colorless", "Red"],
        correctAnswer: "Blue"
      },
      {
        id: "q4_10",
        text: "In a redox reaction, oxidation involves:",
        options: [
          "Loss of electrons",
          "Gain of electrons",
          "Loss of protons",
          "Gain of protons"
        ],
        correctAnswer: "Loss of electrons"
      }
    ]
  },
  {
    id: "Q5",
    title: "Calculus & Limits",
    description: "Advanced calculus covering limits, derivatives, and simple integration.",
    class: 12,
    subject: "Mathematics",
    timeLimit: 15,
    creatorId: "T2",
    questions: [
      {
        id: "q5_1",
        text: "What is the limit of (sin x) / x as x approaches 0?",
        options: ["1", "0", "Undefined", "Infinity"],
        correctAnswer: "1"
      },
      {
        id: "q5_2",
        text: "What is the derivative of x^n with respect to x?",
        options: ["n * x^(n-1)", "x^(n+1) / (n+1)", "n * x^n", "1 / x"],
        correctAnswer: "n * x^(n-1)"
      },
      {
        id: "q5_3",
        text: "What is the derivative of e^x?",
        options: ["e^x", "x * e^(x-1)", "1 / e^x", "ln(x)"],
        correctAnswer: "e^x"
      },
      {
        id: "q5_4",
        text: "What is the derivative of ln(x)?",
        options: ["1/x", "e^x", "1", "x * ln(x) - x"],
        correctAnswer: "1/x"
      },
      {
        id: "q5_5",
        text: "The derivative of sin(x) is:",
        options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
        correctAnswer: "cos(x)"
      },
      {
        id: "q5_6",
        text: "The derivative of cos(x) is:",
        options: ["-sin(x)", "sin(x)", "cos(x)", "-cos(x)"],
        correctAnswer: "-sin(x)"
      },
      {
        id: "q5_7",
        text: "What is the integral of 2x dx?",
        options: ["x² + C", "2 + C", "x²", "2x² + C"],
        correctAnswer: "x² + C"
      },
      {
        id: "q5_8",
        text: "What is the slope of the tangent line to the curve y = x² at the point (2, 4)?",
        options: ["4", "2", "8", "1"],
        correctAnswer: "4"
      },
      {
        id: "q5_9",
        text: "A function is continuous at x = a if:",
        options: [
          "lim (x->a) f(x) = f(a)",
          "f(a) is defined",
          "lim (x->a) f(x) exists",
          "All of the above"
        ],
        correctAnswer: "All of the above"
      },
      {
        id: "q5_10",
        text: "What is the limit of (x² - 4)/(x - 2) as x approaches 2?",
        options: ["4", "2", "0", "Undefined"],
        correctAnswer: "4"
      }
    ]
  }
];
export const initialAttempts = [
  // March Attempts
  {
    id: "att-m1",
    studentId: "S1",
    studentName: "Alex Johnson",
    class: 5,
    quizId: "Q1",
    quizTitle: "Introduction to Fractions",
    subject: "Mathematics",
    score: 6,
    totalQuestions: 10,
    percentage: 60,
    timeTaken: 360,
    date: "2026-03-10",
    remark: "Good"
  },
  {
    id: "att-m2",
    studentId: "S2",
    studentName: "Emma Watson",
    class: 5,
    quizId: "Q1",
    quizTitle: "Introduction to Fractions",
    subject: "Mathematics",
    score: 4,
    totalQuestions: 10,
    percentage: 40,
    timeTaken: 480,
    date: "2026-03-12",
    remark: "Needs Improvement"
  },
  {
    id: "att-m3",
    studentId: "S3",
    studentName: "Michael Brown",
    class: 10,
    quizId: "Q3",
    quizTitle: "Quadratic Equations",
    subject: "Mathematics",
    score: 5,
    totalQuestions: 10,
    percentage: 50,
    timeTaken: 720,
    date: "2026-03-15",
    remark: "Average"
  },
  
  // April Attempts
  {
    id: "att-a1",
    studentId: "S1",
    studentName: "Alex Johnson",
    class: 5,
    quizId: "Q2",
    quizTitle: "Plants & Photosynthesis",
    subject: "Science",
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    timeTaken: 250,
    date: "2026-04-05",
    remark: "Good"
  },
  {
    id: "att-a2",
    studentId: "S2",
    studentName: "Emma Watson",
    class: 5,
    quizId: "Q2",
    quizTitle: "Plants & Photosynthesis",
    subject: "Science",
    score: 5,
    totalQuestions: 10,
    percentage: 50,
    timeTaken: 300,
    date: "2026-04-08",
    remark: "Average"
  },
  {
    id: "att-a3",
    studentId: "S4",
    studentName: "Sophia Miller",
    class: 10,
    quizId: "Q3",
    quizTitle: "Quadratic Equations",
    subject: "Mathematics",
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    timeTaken: 450,
    date: "2026-04-12",
    remark: "Excellent"
  },
  // May Attempts
  // Student 1 (Alex, Class 5)
  {
    id: "att-1",
    studentId: "S1",
    studentName: "Alex Johnson",
    class: 5,
    quizId: "Q1",
    quizTitle: "Introduction to Fractions",
    subject: "Mathematics",
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    timeTaken: 320, // 5 min 20 sec
    date: "2026-05-20",
    remark: "Excellent"
  },
  {
    id: "att-2",
    studentId: "S1",
    studentName: "Alex Johnson",
    class: 5,
    quizId: "Q2",
    quizTitle: "Plants & Photosynthesis",
    subject: "Science",
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    timeTaken: 210, // 3 min 30 sec
    date: "2026-05-22",
    remark: "Excellent"
  },
  // Student 2 (Emma, Class 5)
  {
    id: "att-3",
    studentId: "S2",
    studentName: "Emma Watson",
    class: 5,
    quizId: "Q1",
    quizTitle: "Introduction to Fractions",
    subject: "Mathematics",
    score: 5,
    totalQuestions: 10,
    percentage: 50,
    timeTaken: 450, // 7 min 30 sec
    date: "2026-05-21",
    remark: "Average"
  },
  {
    id: "att-4",
    studentId: "S2",
    studentName: "Emma Watson",
    class: 5,
    quizId: "Q2",
    quizTitle: "Plants & Photosynthesis",
    subject: "Science",
    score: 6,
    totalQuestions: 10,
    percentage: 60,
    timeTaken: 280, // 4 min 40 sec
    date: "2026-05-23",
    remark: "Good"
  },
  // Student 3 (Michael, Class 10)
  {
    id: "att-5",
    studentId: "S3",
    studentName: "Michael Brown",
    class: 10,
    quizId: "Q3",
    quizTitle: "Quadratic Equations",
    subject: "Mathematics",
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    timeTaken: 680,
    date: "2026-05-19",
    remark: "Good"
  },
  {
    id: "att-6",
    studentId: "S3",
    studentName: "Michael Brown",
    class: 10,
    quizId: "Q4",
    quizTitle: "Chemical Reactions",
    subject: "Chemistry",
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    timeTaken: 510,
    date: "2026-05-22",
    remark: "Excellent"
  },
  // Student 4 (Sophia, Class 10)
  {
    id: "att-7",
    studentId: "S4",
    studentName: "Sophia Miller",
    class: 10,
    quizId: "Q3",
    quizTitle: "Quadratic Equations",
    subject: "Mathematics",
    score: 10,
    totalQuestions: 10,
    percentage: 100,
    timeTaken: 400,
    date: "2026-05-20",
    remark: "Excellent"
  },
  {
    id: "att-8",
    studentId: "S4",
    studentName: "Sophia Miller",
    class: 10,
    quizId: "Q4",
    quizTitle: "Chemical Reactions",
    subject: "Chemistry",
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    timeTaken: 430,
    date: "2026-05-23",
    remark: "Excellent"
  }
];
export const defaultQuestionsBank = {
  Mathematics: [
    { text: "What is 9 x 8?", options: ["72", "81", "64", "73"], correctAnswer: "72" },
    { text: "Solve for x: 3x - 5 = 10", options: ["5", "3", "15", "6"], correctAnswer: "5" },
    { text: "How many degrees are in a triangle?", options: ["180", "360", "90", "270"], correctAnswer: "180" }
  ],
  Science: [
    { text: "What is the closest planet to the Sun?", options: ["Mercury", "Venus", "Earth", "Mars"], correctAnswer: "Mercury" },
    { text: "What state of matter has a fixed volume but no fixed shape?", options: ["Liquid", "Solid", "Gas", "Plasma"], correctAnswer: "Liquid" },
    { text: "Which organ pumps blood in the human body?", options: ["Heart", "Brain", "Lungs", "Liver"], correctAnswer: "Heart" }
  ],
  English: [
    { text: "Which word is a noun?", options: ["Dog", "Run", "Beautiful", "Quickly"], correctAnswer: "Dog" },
    { text: "What is the past tense of 'go'?", options: ["Went", "Gone", "Going", "Goes"], correctAnswer: "Went" }
  ]
};
