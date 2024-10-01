# Robson Classification Application

The Robson Insights app is a specialized tool designed for healthcare professionals to engage in anonymized data collection and analysis concerning the Robson classification system. This application enables users within an organization to complete quizzes based on the Robson classification group of a patient, fostering a collaborative and informed approach to patient categorization in obstetric care.

## Version 0.2.0
### Features
- Group/Hospital creation added to groups tab
- Added Group/Hosital selection for users in multiple groups/hospitals
- Allow group admins to add/Remove users from groups
- Upon admin adding user to group, signup email is sent to users added to group who do not exist in Robson Insights System
- Enable group admins to toggle results viewing permisions for group members 
### Bug Fixes
- Fixed bug where groups tab would appear blank when user signs in
- Fixed bug where survey resuls would only be applied to one group when user is part of multiple groups
### Known Issues
- No easy way for admins to add users in mass to a group 
- User Interface for Groups tab  is not friendly to non-mobile users

# Release Notes
## Version 0.1.0
### Features
- Robson Classification Quiz
- User-scoped table visualization of their aggregate results
- User Authentication with manually approved accounts
- Initial group management, administrators of groups can add and remove users
### Bug Fixes
- No bug fixes addressed in Sprint 1
### Known Issues
- Users cannot yet create or join their own groups
- Group permissions of users must currently be manually set
- Visualizations need to include group data




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
