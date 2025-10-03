const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('./models/Quiz');
const Course = require('./models/Course');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const quizData = {
  'IFN580': {
    title: 'Machine Learning Final Assessment',
    description: 'Test your understanding of machine learning concepts and workflows',
    questions: [
      {
        id: 'ifn580-q1',
        question: 'What does CRISP-DM stand for in machine learning?',
        options: [
          { id: 'a', text: 'Cross-Industry Standard Process for Data Mining', isCorrect: true },
          { id: 'b', text: 'Computational Research in Statistical Processing for Data Modeling', isCorrect: false },
          { id: 'c', text: 'Critical System Process for Data Management', isCorrect: false },
          { id: 'd', text: 'Collaborative Research in Structured Process for Data Mining', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'CRISP-DM stands for Cross-Industry Standard Process for Data Mining, a widely used framework for ML projects.'
      },
      {
        id: 'ifn580-q2',
        question: 'Which algorithm is best suited for classification tasks with labeled categories?',
        options: [
          { id: 'a', text: 'k-Means clustering', isCorrect: false },
          { id: 'b', text: 'k-Nearest Neighbors (k-NN)', isCorrect: true },
          { id: 'c', text: 'Principal Component Analysis (PCA)', isCorrect: false },
          { id: 'd', text: 'Linear regression', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'k-NN is a supervised learning algorithm used for classification tasks with labeled data.'
      },
      {
        id: 'ifn580-q3',
        question: 'What is the purpose of the validation set in machine learning?',
        options: [
          { id: 'a', text: 'To train the model', isCorrect: false },
          { id: 'b', text: 'To tune hyperparameters and prevent overfitting', isCorrect: true },
          { id: 'c', text: 'To make final predictions', isCorrect: false },
          { id: 'd', text: 'To collect new data', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The validation set is used to tune hyperparameters and evaluate model performance during training to prevent overfitting.'
      },
      {
        id: 'ifn580-q4',
        question: 'Which regression metric measures the average magnitude of errors?',
        options: [
          { id: 'a', text: 'R-squared (R²)', isCorrect: false },
          { id: 'b', text: 'Mean Absolute Error (MAE)', isCorrect: true },
          { id: 'c', text: 'Confusion Matrix', isCorrect: false },
          { id: 'd', text: 'ROC-AUC', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'MAE (Mean Absolute Error) measures the average magnitude of errors in predictions.'
      },
      {
        id: 'ifn580-q5',
        question: 'What type of learning does k-Means clustering represent?',
        options: [
          { id: 'a', text: 'Supervised learning', isCorrect: false },
          { id: 'b', text: 'Unsupervised learning', isCorrect: true },
          { id: 'c', text: 'Reinforcement learning', isCorrect: false },
          { id: 'd', text: 'Semi-supervised learning', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'k-Means is an unsupervised learning algorithm that finds structure in unlabeled data.'
      },
      {
        id: 'ifn580-q6',
        question: 'What does PCA stand for in dimensionality reduction?',
        options: [
          { id: 'a', text: 'Partial Component Analysis', isCorrect: false },
          { id: 'b', text: 'Principal Component Analysis', isCorrect: true },
          { id: 'c', text: 'Primary Correlation Assessment', isCorrect: false },
          { id: 'd', text: 'Predictive Classification Algorithm', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'PCA stands for Principal Component Analysis, a technique for dimensionality reduction.'
      },
      {
        id: 'ifn580-q7',
        question: 'What is k-fold cross-validation used for?',
        options: [
          { id: 'a', text: 'Data cleaning', isCorrect: false },
          { id: 'b', text: 'Robust model evaluation and reducing variance', isCorrect: true },
          { id: 'c', text: 'Feature extraction', isCorrect: false },
          { id: 'd', text: 'Data collection', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'k-fold cross-validation provides robust model evaluation by training and testing on different data splits.'
      },
      {
        id: 'ifn580-q8',
        question: 'Which curve is used to evaluate binary classification performance?',
        options: [
          { id: 'a', text: 'Scatter plot', isCorrect: false },
          { id: 'b', text: 'ROC curve', isCorrect: true },
          { id: 'c', text: 'Histogram', isCorrect: false },
          { id: 'd', text: 'Box plot', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'ROC (Receiver Operating Characteristic) curve is used to evaluate binary classification model performance.'
      },
      {
        id: 'ifn580-q9',
        question: 'What is the main purpose of Ridge and Lasso regression?',
        options: [
          { id: 'a', text: 'To increase model complexity', isCorrect: false },
          { id: 'b', text: 'To prevent overfitting through regularization', isCorrect: true },
          { id: 'c', text: 'To speed up training', isCorrect: false },
          { id: 'd', text: 'To collect more data', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Ridge and Lasso regression use regularization techniques to prevent overfitting.'
      },
      {
        id: 'ifn580-q10',
        question: 'What strategy is used to handle class imbalance in classification?',
        options: [
          { id: 'a', text: 'Ignoring minority class', isCorrect: false },
          { id: 'b', text: 'SMOTE (Synthetic Minority Over-sampling Technique)', isCorrect: true },
          { id: 'c', text: 'Using only the majority class', isCorrect: false },
          { id: 'd', text: 'Random data deletion', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'SMOTE is a popular technique for handling class imbalance by creating synthetic samples of the minority class.'
      }
    ]
  },
  'IFN581': {
    title: 'Programming Fundamentals Final Assessment',
    description: 'Test your knowledge of Python programming fundamentals',
    questions: [
      {
        id: 'ifn581-q1',
        question: 'Which Python style guide is widely used for code formatting?',
        options: [
          { id: 'a', text: 'PEP8', isCorrect: true },
          { id: 'b', text: 'PEP20', isCorrect: false },
          { id: 'c', text: 'JSLint', isCorrect: false },
          { id: 'd', text: 'ESLint', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'PEP8 is the official Python style guide for code formatting and conventions.'
      },
      {
        id: 'ifn581-q2',
        question: 'What is the correct syntax for an if-elif-else statement in Python?',
        options: [
          { id: 'a', text: 'if condition: ... else if condition: ... else:', isCorrect: false },
          { id: 'b', text: 'if condition: ... elif condition: ... else:', isCorrect: true },
          { id: 'c', text: 'if (condition) { ... } elif (condition) { ... }', isCorrect: false },
          { id: 'd', text: 'if condition then ... elseif condition then ...', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Python uses if-elif-else syntax with colons and indentation.'
      },
      {
        id: 'ifn581-q3',
        question: 'What is a docstring in Python?',
        options: [
          { id: 'a', text: 'A type of variable', isCorrect: false },
          { id: 'b', text: 'Documentation string for functions/classes', isCorrect: true },
          { id: 'c', text: 'A string that documents code errors', isCorrect: false },
          { id: 'd', text: 'A debugging tool', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'A docstring is a documentation string that describes what a function or class does.'
      },
      {
        id: 'ifn581-q4',
        question: 'Which data structure uses key-value pairs in Python?',
        options: [
          { id: 'a', text: 'List', isCorrect: false },
          { id: 'b', text: 'Tuple', isCorrect: false },
          { id: 'c', text: 'Dictionary', isCorrect: true },
          { id: 'd', text: 'Set', isCorrect: false }
        ],
        correctAnswer: 'c',
        points: 1,
        explanation: 'Dictionaries in Python store data as key-value pairs.'
      },
      {
        id: 'ifn581-q5',
        question: 'What is pytest used for in Python?',
        options: [
          { id: 'a', text: 'Web development', isCorrect: false },
          { id: 'b', text: 'Unit testing', isCorrect: true },
          { id: 'c', text: 'Data analysis', isCorrect: false },
          { id: 'd', text: 'Machine learning', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'pytest is a popular Python framework for writing and running unit tests.'
      },
      {
        id: 'ifn581-q6',
        question: 'What is the time complexity of accessing an element in a Python list by index?',
        options: [
          { id: 'a', text: 'O(n)', isCorrect: false },
          { id: 'b', text: 'O(1)', isCorrect: true },
          { id: 'c', text: 'O(log n)', isCorrect: false },
          { id: 'd', text: 'O(n²)', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Accessing a list element by index in Python is O(1) - constant time.'
      },
      {
        id: 'ifn581-q7',
        question: 'Which Python keyword is used to handle exceptions?',
        options: [
          { id: 'a', text: 'catch', isCorrect: false },
          { id: 'b', text: 'try-except', isCorrect: true },
          { id: 'c', text: 'error', isCorrect: false },
          { id: 'd', text: 'handle', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Python uses try-except blocks for exception handling.'
      },
      {
        id: 'ifn581-q8',
        question: 'What is a list comprehension in Python?',
        options: [
          { id: 'a', text: 'A way to sort lists', isCorrect: false },
          { id: 'b', text: 'A concise way to create lists', isCorrect: true },
          { id: 'c', text: 'A type of loop', isCorrect: false },
          { id: 'd', text: 'A debugging feature', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'List comprehensions provide a concise way to create lists from existing iterables.'
      },
      {
        id: 'ifn581-q9',
        question: 'What does the "return" statement do in a Python function?',
        options: [
          { id: 'a', text: 'Prints output to console', isCorrect: false },
          { id: 'b', text: 'Exits the function and returns a value', isCorrect: true },
          { id: 'c', text: 'Creates a new variable', isCorrect: false },
          { id: 'd', text: 'Imports a module', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The return statement exits a function and optionally returns a value to the caller.'
      },
      {
        id: 'ifn581-q10',
        question: 'What is the difference between a tuple and a list in Python?',
        options: [
          { id: 'a', text: 'Tuples are mutable, lists are immutable', isCorrect: false },
          { id: 'b', text: 'Tuples are immutable, lists are mutable', isCorrect: true },
          { id: 'c', text: 'Tuples can only store numbers', isCorrect: false },
          { id: 'd', text: 'There is no difference', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Tuples are immutable (cannot be changed after creation) while lists are mutable.'
      }
    ]
  },
  'IFN582': {
    title: 'Web Development with Databases Final Assessment',
    description: 'Test your understanding of web development and database concepts',
    questions: [
      {
        id: 'ifn582-q1',
        question: 'What does ER modeling stand for in database design?',
        options: [
          { id: 'a', text: 'Entity-Relationship modeling', isCorrect: true },
          { id: 'b', text: 'Error-Recovery modeling', isCorrect: false },
          { id: 'c', text: 'Extended-Relational modeling', isCorrect: false },
          { id: 'd', text: 'Efficient-Resource modeling', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'ER modeling stands for Entity-Relationship modeling, used to design database schemas.'
      },
      {
        id: 'ifn582-q2',
        question: 'Which SQL command is used to retrieve data from a database?',
        options: [
          { id: 'a', text: 'GET', isCorrect: false },
          { id: 'b', text: 'SELECT', isCorrect: true },
          { id: 'c', text: 'FETCH', isCorrect: false },
          { id: 'd', text: 'RETRIEVE', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'SELECT is the SQL command used to query and retrieve data from database tables.'
      },
      {
        id: 'ifn582-q3',
        question: 'What is normalization in database design?',
        options: [
          { id: 'a', text: 'Making all values positive', isCorrect: false },
          { id: 'b', text: 'Organizing data to reduce redundancy', isCorrect: true },
          { id: 'c', text: 'Converting data to normal distribution', isCorrect: false },
          { id: 'd', text: 'Standardizing column names', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Normalization is the process of organizing database tables to reduce redundancy and dependency.'
      },
      {
        id: 'ifn582-q4',
        question: 'What does CRUD stand for in web development?',
        options: [
          { id: 'a', text: 'Create, Read, Update, Delete', isCorrect: true },
          { id: 'b', text: 'Connect, Route, Upload, Download', isCorrect: false },
          { id: 'c', text: 'Cache, Render, Update, Deploy', isCorrect: false },
          { id: 'd', text: 'Compile, Run, Upload, Debug', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'CRUD stands for Create, Read, Update, Delete - the four basic operations for persistent storage.'
      },
      {
        id: 'ifn582-q5',
        question: 'What is JWT used for in web applications?',
        options: [
          { id: 'a', text: 'Database indexing', isCorrect: false },
          { id: 'b', text: 'Authentication and authorization', isCorrect: true },
          { id: 'c', text: 'File compression', isCorrect: false },
          { id: 'd', text: 'CSS styling', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'JWT (JSON Web Token) is used for secure authentication and authorization in web applications.'
      },
      {
        id: 'ifn582-q6',
        question: 'What is an ORM in web development?',
        options: [
          { id: 'a', text: 'Online Resource Manager', isCorrect: false },
          { id: 'b', text: 'Object-Relational Mapping', isCorrect: true },
          { id: 'c', text: 'Optimized Response Module', isCorrect: false },
          { id: 'd', text: 'Original Request Method', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'ORM stands for Object-Relational Mapping, a technique to interact with databases using object-oriented code.'
      },
      {
        id: 'ifn582-q7',
        question: 'Which SQL JOIN returns all records from both tables?',
        options: [
          { id: 'a', text: 'INNER JOIN', isCorrect: false },
          { id: 'b', text: 'LEFT JOIN', isCorrect: false },
          { id: 'c', text: 'FULL OUTER JOIN', isCorrect: true },
          { id: 'd', text: 'CROSS JOIN', isCorrect: false }
        ],
        correctAnswer: 'c',
        points: 1,
        explanation: 'FULL OUTER JOIN returns all records from both tables, with NULLs where there are no matches.'
      },
      {
        id: 'ifn582-q8',
        question: 'What is password hashing used for?',
        options: [
          { id: 'a', text: 'Compressing passwords', isCorrect: false },
          { id: 'b', text: 'Securely storing passwords', isCorrect: true },
          { id: 'c', text: 'Encrypting network traffic', isCorrect: false },
          { id: 'd', text: 'Generating random passwords', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Password hashing is used to securely store passwords by converting them to a fixed-size hash value.'
      },
      {
        id: 'ifn582-q9',
        question: 'What does OWASP stand for in web security?',
        options: [
          { id: 'a', text: 'Open Web Application Security Project', isCorrect: true },
          { id: 'b', text: 'Organized Web Access Security Protocol', isCorrect: false },
          { id: 'c', text: 'Online Web Authentication Service Platform', isCorrect: false },
          { id: 'd', text: 'Optimized Web Application Support Protocol', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'OWASP is the Open Web Application Security Project, providing resources for web application security.'
      },
      {
        id: 'ifn582-q10',
        question: 'What is a database index used for?',
        options: [
          { id: 'a', text: 'Storing backup data', isCorrect: false },
          { id: 'b', text: 'Improving query performance', isCorrect: true },
          { id: 'c', text: 'Encrypting data', isCorrect: false },
          { id: 'd', text: 'Validating input', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Database indexes are used to improve the speed of data retrieval operations.'
      }
    ]
  },
  'IFN583': {
    title: 'Computer Systems and Security Final Assessment',
    description: 'Test your knowledge of computer systems and security principles',
    questions: [
      {
        id: 'ifn583-q1',
        question: 'What does CPU stand for in computer architecture?',
        options: [
          { id: 'a', text: 'Central Processing Unit', isCorrect: true },
          { id: 'b', text: 'Computer Programming Unit', isCorrect: false },
          { id: 'c', text: 'Central Program Utility', isCorrect: false },
          { id: 'd', text: 'Core Processing Unit', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'CPU stands for Central Processing Unit, the primary component that executes instructions.'
      },
      {
        id: 'ifn583-q2',
        question: 'What does the OSI model have in total?',
        options: [
          { id: 'a', text: '5 layers', isCorrect: false },
          { id: 'b', text: '7 layers', isCorrect: true },
          { id: 'c', text: '4 layers', isCorrect: false },
          { id: 'd', text: '10 layers', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The OSI (Open Systems Interconnection) model has 7 layers for network communication.'
      },
      {
        id: 'ifn583-q3',
        question: 'What does CIA triad stand for in security?',
        options: [
          { id: 'a', text: 'Confidentiality, Integrity, Availability', isCorrect: true },
          { id: 'b', text: 'Control, Information, Access', isCorrect: false },
          { id: 'c', text: 'Cryptography, Identity, Authentication', isCorrect: false },
          { id: 'd', text: 'Central Intelligence Agency', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'CIA triad represents Confidentiality, Integrity, and Availability - core security principles.'
      },
      {
        id: 'ifn583-q4',
        question: 'What is the purpose of DNS in networking?',
        options: [
          { id: 'a', text: 'Encrypting data', isCorrect: false },
          { id: 'b', text: 'Translating domain names to IP addresses', isCorrect: true },
          { id: 'c', text: 'Routing packets', isCorrect: false },
          { id: 'd', text: 'Managing memory', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'DNS (Domain Name System) translates human-readable domain names to IP addresses.'
      },
      {
        id: 'ifn583-q5',
        question: 'What is defense-in-depth in security?',
        options: [
          { id: 'a', text: 'Using a single strong firewall', isCorrect: false },
          { id: 'b', text: 'Layered security approach with multiple controls', isCorrect: true },
          { id: 'c', text: 'Deep packet inspection only', isCorrect: false },
          { id: 'd', text: 'Physical security only', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Defense-in-depth is a layered security strategy using multiple security controls.'
      },
      {
        id: 'ifn583-q6',
        question: 'What protocol does HTTPS use for secure communication?',
        options: [
          { id: 'a', text: 'FTP', isCorrect: false },
          { id: 'b', text: 'TLS/SSL', isCorrect: true },
          { id: 'c', text: 'SMTP', isCorrect: false },
          { id: 'd', text: 'UDP', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'HTTPS uses TLS/SSL (Transport Layer Security/Secure Sockets Layer) for secure communication.'
      },
      {
        id: 'ifn583-q7',
        question: 'What is a hash function used for in security?',
        options: [
          { id: 'a', text: 'Encrypting messages', isCorrect: false },
          { id: 'b', text: 'Creating fixed-size digests of data', isCorrect: true },
          { id: 'c', text: 'Generating random numbers', isCorrect: false },
          { id: 'd', text: 'Compressing files', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Hash functions create fixed-size digests (hashes) of data for integrity verification.'
      },
      {
        id: 'ifn583-q8',
        question: 'What is the difference between symmetric and asymmetric encryption?',
        options: [
          { id: 'a', text: 'Symmetric uses one key, asymmetric uses two keys', isCorrect: true },
          { id: 'b', text: 'Symmetric is slower than asymmetric', isCorrect: false },
          { id: 'c', text: 'Symmetric is more secure than asymmetric', isCorrect: false },
          { id: 'd', text: 'There is no difference', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'Symmetric encryption uses one shared key, while asymmetric uses a public-private key pair.'
      },
      {
        id: 'ifn583-q9',
        question: 'What does NAT stand for in networking?',
        options: [
          { id: 'a', text: 'Network Access Token', isCorrect: false },
          { id: 'b', text: 'Network Address Translation', isCorrect: true },
          { id: 'c', text: 'Network Authentication Tool', isCorrect: false },
          { id: 'd', text: 'Network Automation Technology', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'NAT (Network Address Translation) translates private IP addresses to public ones.'
      },
      {
        id: 'ifn583-q10',
        question: 'What is the purpose of file system permissions?',
        options: [
          { id: 'a', text: 'To compress files', isCorrect: false },
          { id: 'b', text: 'To control access to files and directories', isCorrect: true },
          { id: 'c', text: 'To encrypt files', isCorrect: false },
          { id: 'd', text: 'To backup files', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'File system permissions control who can read, write, or execute files and directories.'
      }
    ]
  },
  'IFN584': {
    title: 'Object-Oriented Design and Development Final Assessment',
    description: 'Test your understanding of OO principles and design patterns',
    questions: [
      {
        id: 'ifn584-q1',
        question: 'What does SOLID stand for in object-oriented design?',
        options: [
          { id: 'a', text: 'Simple, Organized, Logical, Integrated, Distributed', isCorrect: false },
          { id: 'b', text: 'Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion', isCorrect: true },
          { id: 'c', text: 'Structured, Object-based, Layered, Integrated, Distributed', isCorrect: false },
          { id: 'd', text: 'Secure, Optimized, Logical, Intelligent, Dynamic', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'SOLID represents five key principles of object-oriented design for maintainable software.'
      },
      {
        id: 'ifn584-q2',
        question: 'Which design pattern ensures a class has only one instance?',
        options: [
          { id: 'a', text: 'Factory', isCorrect: false },
          { id: 'b', text: 'Singleton', isCorrect: true },
          { id: 'c', text: 'Observer', isCorrect: false },
          { id: 'd', text: 'Strategy', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The Singleton pattern ensures a class has only one instance and provides global access to it.'
      },
      {
        id: 'ifn584-q3',
        question: 'What type of diagram shows the flow of messages between objects?',
        options: [
          { id: 'a', text: 'Class diagram', isCorrect: false },
          { id: 'b', text: 'Sequence diagram', isCorrect: true },
          { id: 'c', text: 'Use case diagram', isCorrect: false },
          { id: 'd', text: 'State diagram', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Sequence diagrams show the flow of messages between objects over time.'
      },
      {
        id: 'ifn584-q4',
        question: 'What is the Factory design pattern used for?',
        options: [
          { id: 'a', text: 'Managing database connections', isCorrect: false },
          { id: 'b', text: 'Creating objects without specifying exact classes', isCorrect: true },
          { id: 'c', text: 'Observing state changes', isCorrect: false },
          { id: 'd', text: 'Adapting interfaces', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The Factory pattern creates objects without specifying the exact class to instantiate.'
      },
      {
        id: 'ifn584-q5',
        question: 'What does the Observer pattern enable?',
        options: [
          { id: 'a', text: 'Creating singleton instances', isCorrect: false },
          { id: 'b', text: 'Notifying multiple objects of state changes', isCorrect: true },
          { id: 'c', text: 'Building complex objects', isCorrect: false },
          { id: 'd', text: 'Adapting interfaces', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The Observer pattern allows objects to be notified of state changes in other objects.'
      },
      {
        id: 'ifn584-q6',
        question: 'What is encapsulation in OOP?',
        options: [
          { id: 'a', text: 'Hiding implementation details', isCorrect: true },
          { id: 'b', text: 'Creating multiple instances', isCorrect: false },
          { id: 'c', text: 'Inheriting from parent classes', isCorrect: false },
          { id: 'd', text: 'Overloading methods', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'Encapsulation is the practice of hiding implementation details and exposing only necessary interfaces.'
      },
      {
        id: 'ifn584-q7',
        question: 'What is the Adapter pattern used for?',
        options: [
          { id: 'a', text: 'Creating objects', isCorrect: false },
          { id: 'b', text: 'Converting one interface to another', isCorrect: true },
          { id: 'c', text: 'Managing state', isCorrect: false },
          { id: 'd', text: 'Iterating collections', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The Adapter pattern converts the interface of a class into another interface that clients expect.'
      },
      {
        id: 'ifn584-q8',
        question: 'What is dependency injection (DI)?',
        options: [
          { id: 'a', text: 'A security vulnerability', isCorrect: false },
          { id: 'b', text: 'Providing dependencies from outside rather than creating them', isCorrect: true },
          { id: 'c', text: 'A type of inheritance', isCorrect: false },
          { id: 'd', text: 'A database pattern', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Dependency Injection is a design pattern where dependencies are provided to an object rather than created by it.'
      },
      {
        id: 'ifn584-q9',
        question: 'What does the Strategy pattern allow you to do?',
        options: [
          { id: 'a', text: 'Switch algorithms at runtime', isCorrect: true },
          { id: 'b', text: 'Create singleton objects', isCorrect: false },
          { id: 'c', text: 'Build complex objects', isCorrect: false },
          { id: 'd', text: 'Observe changes', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'The Strategy pattern allows selecting an algorithm at runtime from a family of algorithms.'
      },
      {
        id: 'ifn584-q10',
        question: 'What is the purpose of the Facade pattern?',
        options: [
          { id: 'a', text: 'To iterate through collections', isCorrect: false },
          { id: 'b', text: 'To provide a simplified interface to a complex system', isCorrect: true },
          { id: 'c', text: 'To create object copies', isCorrect: false },
          { id: 'd', text: 'To manage commands', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The Facade pattern provides a simplified interface to a complex subsystem.'
      }
    ]
  },
  'IFN585': {
    title: 'Systems Innovation and Design Final Assessment',
    description: 'Test your knowledge of systems thinking and design',
    questions: [
      {
        id: 'ifn585-q1',
        question: 'What is stakeholder mapping used for?',
        options: [
          { id: 'a', text: 'Creating network diagrams', isCorrect: false },
          { id: 'b', text: 'Identifying and analyzing stakeholders in a system', isCorrect: true },
          { id: 'c', text: 'Mapping geographical locations', isCorrect: false },
          { id: 'd', text: 'Database design', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Stakeholder mapping identifies and analyzes the people and groups involved in or affected by a system.'
      },
      {
        id: 'ifn585-q2',
        question: 'What is a causal loop diagram used for?',
        options: [
          { id: 'a', text: 'Showing feedback loops in systems', isCorrect: true },
          { id: 'b', text: 'Creating flowcharts', isCorrect: false },
          { id: 'c', text: 'Designing databases', isCorrect: false },
          { id: 'd', text: 'Writing code', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'Causal loop diagrams visualize feedback loops and relationships in complex systems.'
      },
      {
        id: 'ifn585-q3',
        question: 'What are stocks and flows in system dynamics?',
        options: [
          { id: 'a', text: 'Financial terms only', isCorrect: false },
          { id: 'b', text: 'Accumulations and rates of change in systems', isCorrect: true },
          { id: 'c', text: 'Database structures', isCorrect: false },
          { id: 'd', text: 'Network protocols', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Stocks represent accumulations in a system, while flows represent rates of change.'
      },
      {
        id: 'ifn585-q4',
        question: 'What is the purpose of visual analytics?',
        options: [
          { id: 'a', text: 'Creating pretty charts', isCorrect: false },
          { id: 'b', text: 'Discovering insights and patterns in data through visualization', isCorrect: true },
          { id: 'c', text: 'Designing user interfaces', isCorrect: false },
          { id: 'd', text: 'Writing reports', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Visual analytics combines visualization with analytical reasoning to discover insights in data.'
      },
      {
        id: 'ifn585-q5',
        question: 'What is a leverage point in systems thinking?',
        options: [
          { id: 'a', text: 'A physical tool', isCorrect: false },
          { id: 'b', text: 'A place where small changes can produce big effects', isCorrect: true },
          { id: 'c', text: 'A database index', isCorrect: false },
          { id: 'd', text: 'A programming function', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'A leverage point is where a small intervention can produce significant system-wide changes.'
      },
      {
        id: 'ifn585-q6',
        question: 'What is the purpose of scenario exploration in systems design?',
        options: [
          { id: 'a', text: 'Writing fiction', isCorrect: false },
          { id: 'b', text: 'Exploring possible futures and their implications', isCorrect: true },
          { id: 'c', text: 'Testing software', isCorrect: false },
          { id: 'd', text: 'Debugging code', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Scenario exploration examines possible future states of a system and their implications.'
      },
      {
        id: 'ifn585-q7',
        question: 'What is a prioritization matrix used for?',
        options: [
          { id: 'a', text: 'Database normalization', isCorrect: false },
          { id: 'b', text: 'Ranking and selecting interventions or solutions', isCorrect: true },
          { id: 'c', text: 'Network routing', isCorrect: false },
          { id: 'd', text: 'Code optimization', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Prioritization matrices help rank and select interventions based on multiple criteria.'
      },
      {
        id: 'ifn585-q8',
        question: 'What are KPIs in impact communication?',
        options: [
          { id: 'a', text: 'Key Performance Indicators', isCorrect: true },
          { id: 'b', text: 'Knowledge Processing Interfaces', isCorrect: false },
          { id: 'c', text: 'Keyboard Protocol Instructions', isCorrect: false },
          { id: 'd', text: 'Known Process Implementations', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'KPIs (Key Performance Indicators) are measurable values that demonstrate system effectiveness.'
      },
      {
        id: 'ifn585-q9',
        question: 'What is sensemaking in data analysis?',
        options: [
          { id: 'a', text: 'Creating random interpretations', isCorrect: false },
          { id: 'b', text: 'The process of understanding and giving meaning to data', isCorrect: true },
          { id: 'c', text: 'Deleting irrelevant data', isCorrect: false },
          { id: 'd', text: 'Encrypting sensitive information', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Sensemaking is the collaborative process of understanding and creating meaning from data.'
      },
      {
        id: 'ifn585-q10',
        question: 'What is the goal of intervention design?',
        options: [
          { id: 'a', text: 'Creating medical treatments', isCorrect: false },
          { id: 'b', text: 'Designing actions to improve system outcomes', isCorrect: true },
          { id: 'c', text: 'Building software', isCorrect: false },
          { id: 'd', text: 'Writing documentation', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Intervention design creates targeted actions to improve system performance and outcomes.'
      }
    ]
  },
  'IFN635': {
    title: 'Cyber Security and Governance Final Assessment',
    description: 'Test your understanding of cybersecurity governance and risk management',
    questions: [
      {
        id: 'ifn635-q1',
        question: 'What does ISO 27001 provide?',
        options: [
          { id: 'a', text: 'Network protocols', isCorrect: false },
          { id: 'b', text: 'Information security management system requirements', isCorrect: true },
          { id: 'c', text: 'Programming standards', isCorrect: false },
          { id: 'd', text: 'Database design patterns', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'ISO 27001 specifies requirements for establishing, implementing, and maintaining an information security management system.'
      },
      {
        id: 'ifn635-q2',
        question: 'What is a risk register used for?',
        options: [
          { id: 'a', text: 'Storing passwords', isCorrect: false },
          { id: 'b', text: 'Documenting and tracking security risks', isCorrect: true },
          { id: 'c', text: 'Managing user accounts', isCorrect: false },
          { id: 'd', text: 'Configuring firewalls', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'A risk register documents identified risks, their assessment, and mitigation strategies.'
      },
      {
        id: 'ifn635-q3',
        question: 'What does IAM stand for in cloud security?',
        options: [
          { id: 'a', text: 'Internet Access Manager', isCorrect: false },
          { id: 'b', text: 'Identity and Access Management', isCorrect: true },
          { id: 'c', text: 'Integrated Application Module', isCorrect: false },
          { id: 'd', text: 'Internal Audit Methodology', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'IAM (Identity and Access Management) controls who can access resources in cloud environments.'
      },
      {
        id: 'ifn635-q4',
        question: 'What is an incident response playbook?',
        options: [
          { id: 'a', text: 'A game strategy', isCorrect: false },
          { id: 'b', text: 'Predefined procedures for handling security incidents', isCorrect: true },
          { id: 'c', text: 'A training manual', isCorrect: false },
          { id: 'd', text: 'A user guide', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'An incident response playbook contains predefined procedures for handling specific security incidents.'
      },
      {
        id: 'ifn635-q5',
        question: 'What is the purpose of security awareness training?',
        options: [
          { id: 'a', text: 'Teaching programming', isCorrect: false },
          { id: 'b', text: 'Educating users about security threats and best practices', isCorrect: true },
          { id: 'c', text: 'Configuring firewalls', isCorrect: false },
          { id: 'd', text: 'Installing software', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Security awareness training educates users about threats and secure practices to reduce human risk.'
      },
      {
        id: 'ifn635-q6',
        question: 'What is NIST RMF?',
        options: [
          { id: 'a', text: 'A programming framework', isCorrect: false },
          { id: 'b', text: 'Risk Management Framework', isCorrect: true },
          { id: 'c', text: 'Remote Management Feature', isCorrect: false },
          { id: 'd', text: 'Resource Monitoring Facility', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'NIST RMF (Risk Management Framework) provides a process for integrating security into system development.'
      },
      {
        id: 'ifn635-q7',
        question: 'What is a phishing simulation?',
        options: [
          { id: 'a', text: 'A fishing game', isCorrect: false },
          { id: 'b', text: 'A controlled test of user response to fake phishing attacks', isCorrect: true },
          { id: 'c', text: 'A network simulation', isCorrect: false },
          { id: 'd', text: 'A backup test', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Phishing simulations test and train users by sending controlled fake phishing emails.'
      },
      {
        id: 'ifn635-q8',
        question: 'What is the purpose of network segmentation?',
        options: [
          { id: 'a', text: 'Increasing network speed', isCorrect: false },
          { id: 'b', text: 'Limiting the spread of security breaches', isCorrect: true },
          { id: 'c', text: 'Reducing costs', isCorrect: false },
          { id: 'd', text: 'Improving aesthetics', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Network segmentation divides networks into zones to contain and limit security breaches.'
      },
      {
        id: 'ifn635-q9',
        question: 'What is a post-incident review?',
        options: [
          { id: 'a', text: 'A performance review', isCorrect: false },
          { id: 'b', text: 'Analysis of how an incident was handled to improve response', isCorrect: true },
          { id: 'c', text: 'A code review', isCorrect: false },
          { id: 'd', text: 'A financial audit', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Post-incident reviews analyze incident response to identify lessons learned and improvements.'
      },
      {
        id: 'ifn635-q10',
        question: 'What is insider risk in cybersecurity?',
        options: [
          { id: 'a', text: 'External hacker threats', isCorrect: false },
          { id: 'b', text: 'Threats from people within the organization', isCorrect: true },
          { id: 'c', text: 'Physical security threats', isCorrect: false },
          { id: 'd', text: 'Natural disasters', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Insider risk refers to security threats posed by employees, contractors, or partners with inside access.'
      }
    ]
  },
  'IFN636': {
    title: 'Software Life Cycle Management Final Assessment',
    description: 'Test your knowledge of software development lifecycle and DevOps',
    questions: [
      {
        id: 'ifn636-q1',
        question: 'What does MoSCoW prioritization stand for?',
        options: [
          { id: 'a', text: 'Must have, Should have, Could have, Won\'t have', isCorrect: true },
          { id: 'b', text: 'Most, Some, Could, Will', isCorrect: false },
          { id: 'c', text: 'Major, Standard, Common, Waste', isCorrect: false },
          { id: 'd', text: 'Mandatory, Secondary, Conditional, Waived', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'MoSCoW is a prioritization technique: Must have, Should have, Could have, Won\'t have.'
      },
      {
        id: 'ifn636-q2',
        question: 'What is CI/CD in DevOps?',
        options: [
          { id: 'a', text: 'Code Integration/Code Deployment', isCorrect: false },
          { id: 'b', text: 'Continuous Integration/Continuous Deployment', isCorrect: true },
          { id: 'c', text: 'Central Integration/Central Distribution', isCorrect: false },
          { id: 'd', text: 'Controlled Integration/Controlled Delivery', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'CI/CD stands for Continuous Integration and Continuous Deployment/Delivery.'
      },
      {
        id: 'ifn636-q3',
        question: 'What is an ADR in software architecture?',
        options: [
          { id: 'a', text: 'Automated Deployment Record', isCorrect: false },
          { id: 'b', text: 'Architecture Decision Record', isCorrect: true },
          { id: 'c', text: 'Application Design Review', isCorrect: false },
          { id: 'd', text: 'Agile Development Report', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'ADR (Architecture Decision Record) documents important architectural decisions and their context.'
      },
      {
        id: 'ifn636-q4',
        question: 'What does SLO stand for in SRE?',
        options: [
          { id: 'a', text: 'Service Level Objective', isCorrect: true },
          { id: 'b', text: 'System Load Operation', isCorrect: false },
          { id: 'c', text: 'Software Lifecycle Optimization', isCorrect: false },
          { id: 'd', text: 'Standard Logging Output', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'SLO (Service Level Objective) defines target reliability for a service.'
      },
      {
        id: 'ifn636-q5',
        question: 'What is the testing pyramid?',
        options: [
          { id: 'a', text: 'A building structure', isCorrect: false },
          { id: 'b', text: 'A strategy with more unit tests, fewer integration tests, and even fewer E2E tests', isCorrect: true },
          { id: 'c', text: 'A performance metric', isCorrect: false },
          { id: 'd', text: 'A deployment pattern', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'The testing pyramid recommends more unit tests at the base, fewer integration tests, and minimal E2E tests.'
      },
      {
        id: 'ifn636-q6',
        question: 'What are feature flags used for?',
        options: [
          { id: 'a', text: 'Marking important code', isCorrect: false },
          { id: 'b', text: 'Toggling features on/off without deploying code', isCorrect: true },
          { id: 'c', text: 'Debugging errors', isCorrect: false },
          { id: 'd', text: 'Writing documentation', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Feature flags allow enabling or disabling features without code deployment.'
      },
      {
        id: 'ifn636-q7',
        question: 'What is observability in production systems?',
        options: [
          { id: 'a', text: 'Watching servers physically', isCorrect: false },
          { id: 'b', text: 'Understanding system internal states from external outputs (logs, metrics, traces)', isCorrect: true },
          { id: 'c', text: 'User interface design', isCorrect: false },
          { id: 'd', text: 'Code commenting', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Observability uses logs, metrics, and traces to understand internal system states.'
      },
      {
        id: 'ifn636-q8',
        question: 'What is the difference between monolith and microservices architecture?',
        options: [
          { id: 'a', text: 'Monolith is one large application, microservices are multiple small services', isCorrect: true },
          { id: 'b', text: 'Monolith is faster than microservices', isCorrect: false },
          { id: 'c', text: 'Monolith uses databases, microservices don\'t', isCorrect: false },
          { id: 'd', text: 'There is no difference', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'Monoliths are single unified applications, while microservices split functionality into independent services.'
      },
      {
        id: 'ifn636-q9',
        question: 'What is an error budget in SRE?',
        options: [
          { id: 'a', text: 'Money allocated for fixing bugs', isCorrect: false },
          { id: 'b', text: 'Acceptable amount of downtime/errors before reliability work is prioritized', isCorrect: true },
          { id: 'c', text: 'Number of developers', isCorrect: false },
          { id: 'd', text: 'Testing budget', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Error budget is the acceptable level of unreliability before reliability becomes the priority.'
      },
      {
        id: 'ifn636-q10',
        question: 'What is change management in SDLC?',
        options: [
          { id: 'a', text: 'Changing project managers', isCorrect: false },
          { id: 'b', text: 'Controlled process for making changes to production systems', isCorrect: true },
          { id: 'c', text: 'Changing programming languages', isCorrect: false },
          { id: 'd', text: 'Reorganizing teams', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Change management ensures changes to production systems are made in a controlled, safe manner.'
      }
    ]
  },
  'IFN637': {
    title: 'Human-Centred Design Final Assessment',
    description: 'Test your understanding of user research and design practices',
    questions: [
      {
        id: 'ifn637-q1',
        question: 'What does JTBD stand for in user research?',
        options: [
          { id: 'a', text: 'Just-in-Time Business Development', isCorrect: false },
          { id: 'b', text: 'Jobs To Be Done', isCorrect: true },
          { id: 'c', text: 'Joint Technical Business Design', isCorrect: false },
          { id: 'd', text: 'Journey Through Business Data', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'JTBD (Jobs To Be Done) is a framework for understanding user needs and motivations.'
      },
      {
        id: 'ifn637-q2',
        question: 'What is affinity mapping used for?',
        options: [
          { id: 'a', text: 'Creating geographical maps', isCorrect: false },
          { id: 'b', text: 'Organizing research insights into themes', isCorrect: true },
          { id: 'c', text: 'Network mapping', isCorrect: false },
          { id: 'd', text: 'Database design', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Affinity mapping groups similar insights and observations to identify themes and patterns.'
      },
      {
        id: 'ifn637-q3',
        question: 'What is the difference between lo-fi and hi-fi prototypes?',
        options: [
          { id: 'a', text: 'Lo-fi is rough/sketchy, hi-fi is polished/detailed', isCorrect: true },
          { id: 'b', text: 'Lo-fi is digital, hi-fi is paper', isCorrect: false },
          { id: 'c', text: 'Lo-fi is expensive, hi-fi is cheap', isCorrect: false },
          { id: 'd', text: 'There is no difference', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'Lo-fi prototypes are rough sketches; hi-fi prototypes are detailed and polished representations.'
      },
      {
        id: 'ifn637-q4',
        question: 'What does SUS measure in usability testing?',
        options: [
          { id: 'a', text: 'System Uptime Status', isCorrect: false },
          { id: 'b', text: 'System Usability Scale', isCorrect: true },
          { id: 'c', text: 'Server Usage Statistics', isCorrect: false },
          { id: 'd', text: 'Software Update Service', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'SUS (System Usability Scale) is a standardized questionnaire to measure perceived usability.'
      },
      {
        id: 'ifn637-q5',
        question: 'Why is informed consent important in user research?',
        options: [
          { id: 'a', text: 'It\'s a legal requirement only', isCorrect: false },
          { id: 'b', text: 'It ensures ethical treatment and participants understand the research', isCorrect: true },
          { id: 'c', text: 'It makes research faster', isCorrect: false },
          { id: 'd', text: 'It\'s not important', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Informed consent ensures participants understand and agree to research participation ethically.'
      },
      {
        id: 'ifn637-q6',
        question: 'What is the purpose of user personas?',
        options: [
          { id: 'a', text: 'Creating fake users', isCorrect: false },
          { id: 'b', text: 'Representing typical users to guide design decisions', isCorrect: true },
          { id: 'c', text: 'Writing documentation', isCorrect: false },
          { id: 'd', text: 'Testing security', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Personas are fictional representations of typical users based on research to guide design.'
      },
      {
        id: 'ifn637-q7',
        question: 'What is a wireframe in design?',
        options: [
          { id: 'a', text: 'A type of cable', isCorrect: false },
          { id: 'b', text: 'A low-fidelity layout of a screen or page', isCorrect: true },
          { id: 'c', text: 'A network diagram', isCorrect: false },
          { id: 'd', text: 'A security measure', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'A wireframe is a basic visual guide showing the structure and layout of a screen or page.'
      },
      {
        id: 'ifn637-q8',
        question: 'What is time-on-task a metric of?',
        options: [
          { id: 'a', text: 'How long users take to complete a task', isCorrect: true },
          { id: 'b', text: 'Project deadlines', isCorrect: false },
          { id: 'c', text: 'Server response time', isCorrect: false },
          { id: 'd', text: 'Development time', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'Time-on-task measures how long it takes users to complete specific tasks in usability testing.'
      },
      {
        id: 'ifn637-q9',
        question: 'What are accessibility checks in design?',
        options: [
          { id: 'a', text: 'Checking if buildings have ramps', isCorrect: false },
          { id: 'b', text: 'Ensuring designs work for people with disabilities', isCorrect: true },
          { id: 'c', text: 'Testing internet access', isCorrect: false },
          { id: 'd', text: 'Security audits', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Accessibility checks ensure designs are usable by people with various disabilities.'
      },
      {
        id: 'ifn637-q10',
        question: 'What is the purpose of design specs when handing off to developers?',
        options: [
          { id: 'a', text: 'To impress stakeholders', isCorrect: false },
          { id: 'b', text: 'To clearly communicate design details for implementation', isCorrect: true },
          { id: 'c', text: 'To document bugs', isCorrect: false },
          { id: 'd', text: 'To create marketing materials', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Design specs provide detailed specifications to developers for accurate implementation.'
      }
    ]
  },
  'IFN666': {
    title: 'Web and Mobile Development Final Assessment',
    description: 'Test your knowledge of modern web and mobile development',
    questions: [
      {
        id: 'ifn666-q1',
        question: 'What is semantic HTML?',
        options: [
          { id: 'a', text: 'HTML with meaningful tags that describe content', isCorrect: true },
          { id: 'b', text: 'HTML for search engines only', isCorrect: false },
          { id: 'c', text: 'Encrypted HTML', isCorrect: false },
          { id: 'd', text: 'HTML with animations', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'Semantic HTML uses tags that clearly describe their meaning and content purpose.'
      },
      {
        id: 'ifn666-q2',
        question: 'What is responsive design?',
        options: [
          { id: 'a', text: 'Fast loading websites', isCorrect: false },
          { id: 'b', text: 'Designs that adapt to different screen sizes', isCorrect: true },
          { id: 'c', text: 'Interactive animations', isCorrect: false },
          { id: 'd', text: 'Server-side rendering', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Responsive design adapts layouts and content to work well on various screen sizes and devices.'
      },
      {
        id: 'ifn666-q3',
        question: 'What is the purpose of axios or fetch in web development?',
        options: [
          { id: 'a', text: 'Styling components', isCorrect: false },
          { id: 'b', text: 'Making HTTP requests to APIs', isCorrect: true },
          { id: 'c', text: 'Routing pages', isCorrect: false },
          { id: 'd', text: 'Managing state', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Axios and fetch are used to make HTTP requests to communicate with APIs.'
      },
      {
        id: 'ifn666-q4',
        question: 'What is OAuth used for?',
        options: [
          { id: 'a', text: 'Database queries', isCorrect: false },
          { id: 'b', text: 'Authorization and delegated access', isCorrect: true },
          { id: 'c', text: 'CSS styling', isCorrect: false },
          { id: 'd', text: 'File compression', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'OAuth is an authorization protocol for delegated access (like "Login with Google").'
      },
      {
        id: 'ifn666-q5',
        question: 'What is a CDN?',
        options: [
          { id: 'a', text: 'Content Delivery Network', isCorrect: true },
          { id: 'b', text: 'Central Database Node', isCorrect: false },
          { id: 'c', text: 'Code Development Network', isCorrect: false },
          { id: 'd', text: 'Compressed Data Node', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'CDN (Content Delivery Network) distributes content across multiple servers for faster delivery.'
      },
      {
        id: 'ifn666-q6',
        question: 'What are touch targets in mobile UX?',
        options: [
          { id: 'a', text: 'Screen protectors', isCorrect: false },
          { id: 'b', text: 'Interactive elements sized for finger/thumb interaction', isCorrect: true },
          { id: 'c', text: 'Mobile games', isCorrect: false },
          { id: 'd', text: 'App icons', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Touch targets are interactive elements designed to be easily tapped with fingers or thumbs.'
      },
      {
        id: 'ifn666-q7',
        question: 'What is a performance budget in web development?',
        options: [
          { id: 'a', text: 'Development cost limit', isCorrect: false },
          { id: 'b', text: 'Limits on page size/load time to ensure performance', isCorrect: true },
          { id: 'c', text: 'Server budget', isCorrect: false },
          { id: 'd', text: 'Salary budget', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Performance budgets set limits on metrics like page size and load time to maintain good UX.'
      },
      {
        id: 'ifn666-q8',
        question: 'What is REST in API design?',
        options: [
          { id: 'a', text: 'Representational State Transfer', isCorrect: true },
          { id: 'b', text: 'Remote Server Technology', isCorrect: false },
          { id: 'c', text: 'Rapid Execution Service Tool', isCorrect: false },
          { id: 'd', text: 'Resource Encryption Standard Transfer', isCorrect: false }
        ],
        correctAnswer: 'a',
        points: 1,
        explanation: 'REST (Representational State Transfer) is an architectural style for designing networked applications.'
      },
      {
        id: 'ifn666-q9',
        question: 'What is bundling in web development?',
        options: [
          { id: 'a', text: 'Grouping products for sale', isCorrect: false },
          { id: 'b', text: 'Combining multiple files into fewer files for optimization', isCorrect: true },
          { id: 'c', text: 'Creating backups', isCorrect: false },
          { id: 'd', text: 'Compressing images', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Bundling combines multiple JavaScript/CSS files into fewer files to improve load performance.'
      },
      {
        id: 'ifn666-q10',
        question: 'What is the purpose of error handling in API integration?',
        options: [
          { id: 'a', text: 'To hide all errors', isCorrect: false },
          { id: 'b', text: 'To gracefully handle failures and provide feedback', isCorrect: true },
          { id: 'c', text: 'To stop the application', isCorrect: false },
          { id: 'd', text: 'To log out users', isCorrect: false }
        ],
        correctAnswer: 'b',
        points: 1,
        explanation: 'Error handling manages API failures gracefully and provides appropriate user feedback.'
      }
    ]
  }
};

const seedQuizzes = async () => {
  try {
    await connectDB();

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found. Please ensure an admin user exists.');
      process.exit(1);
    }

    console.log('Using admin user:', adminUser.email);

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    // Get all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);

    let quizzesCreated = 0;

    // Create quiz for each course
    for (const course of courses) {
      // Extract course code from title (e.g., "IFN580 - Machine Learning" -> "IFN580")
      const courseCode = course.title.split(' - ')[0];

      if (!quizData[courseCode]) {
        console.log(`No quiz data found for ${courseCode}, skipping...`);
        continue;
      }

      const data = quizData[courseCode];

      const quiz = await Quiz.create({
        title: data.title,
        description: data.description,
        instructions: 'Answer all questions to the best of your ability. You have 30 minutes to complete this assessment. A score of 70% or higher is required to pass.',
        courseId: course._id,
        timeLimit: 30,
        passingScore: 70,
        showResults: true,
        showCorrectAnswers: true,
        randomizeQuestions: false,
        randomizeOptions: false,
        questions: data.questions,
        difficulty: course.difficulty === 'Beginner' ? 2 : course.difficulty === 'Intermediate' ? 3 : 4,
        estimatedDuration: 30,
        status: 'published',
        createdBy: adminUser._id
      });

      quizzesCreated++;
      console.log(`Created quiz for ${course.title}: ${quiz.title} (${quiz.questions.length} questions)`);
    }

    console.log(`\nSuccessfully created ${quizzesCreated} quizzes!`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
};

seedQuizzes();
