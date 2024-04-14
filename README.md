# Project Name

Provide a brief description of what your project does and what it is used for.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

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