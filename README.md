# JIB 4109: Robson Insights

The Robson Insights app is a specialized tool designed for healthcare professionals to engage in anonymized data collection and analysis concerning the Robson classification system. This application enables users within an organization to complete quizzes based on the Robson classification group of a patient, fostering a collaborative and informed approach to patient categorization in obstetric care.

Currently, the app includes core functionalities such as secure user authentication, a quiz interface where users can input data related to a patient's Robson classification, and a simplified results page that displays aggregated data.

## Getting Started
### Prerequisites

What things you need to install the software and how to install them.

Node.js
Python 3.x

### Installing

A step by step series of examples that tell you how to get a development environment running.

#### Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```
Start the frontend application:
```npm run start```

The frontend is built using React Native and Expo with TypeScript. After running the start command, you can access the frontend app as specified by the output from the Expo CLI.
Backend

Navigate to the backend directory, set up the Python virtual environment, and install dependencies:

```
cd backend
python -m venv env
source env/bin/activate  # On Windows use `env\Scripts\activate`
pip install ... //required packages
```
Start the backend server:
```python manage.py runserver```

The backend is built using Django and Django REST Framework. It listens for requests as specified by Django's output in the console.
