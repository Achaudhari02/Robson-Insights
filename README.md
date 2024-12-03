# Robson Classification Application

The Robson Insights app is a specialized tool designed for healthcare professionals to engage in anonymized data collection and analysis concerning the Robson classification system. This application enables users within an organization to complete quizzes based on the Robson classification group of a patient, fostering a collaborative and informed approach to patient categorization in obstetric care.

# Release Notes

## Version 1.0
### Features
- Implemented Robson Classification Quiz 
- User and group-scoped Pie and Bar chart visualizations of Robson Classification results
- User Authentication with manually approved accounts and email based sign-ups
- Group management implementation, administrators of groups can add, remove, and change view permisions of users
- Create quarterly/yearly reports based on date-ranges passed in by user in Results section
- Filtering/configuration of results viewing page
- Added ability mass invite users to group via CSV import

- ### Bug Fixes
- Fixed issue where exit button for Detailed Pie Chart screen would not appear
- Fixed issue where CSV import would not parse correctly
- Fixed problem with CSV data export where data would be seperated by semicolon
- Fixed issue where exit button for Detailed Pie Chart screen would not appear
- Fixed issue where CSV import would not parse correctly
- Fixed problem with CSV data export where data would be seperated by semicolon
- Improved User Interface of Groups tab for non-mobile users
- Fixed issue where existing users invited to group would not receive invite
- Fixed bug where groups tab would appear blank when user signs in
- Fixed bug where survey resuls would only be applied to one group when user is part of multiple groups
  
### Known Issues
- Group member added notification sometimes pops up on clicking to results page

## Installation Guide
### Prerequisites

What things you need to run Robson Insights and how to install them.

Git - **[Installation](https://github.com/git-guides/install-git)**

Node.js - **[Installation](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)**

Python 3.x - **[Installation](https://pythongeeks.org/python-3-installation-and-setup-guide/)**

### Installing

Step by step instructions that tell you how to get a development environment running.

#### Initial Setup

Open your respective Windows/MacOS/Linux terminal application and create a new directory for the application to live.

```bash
mkdir robson_insights
cd robson_insights
```

Clone the repository and navigate into the directory:

```bash
git clone https://github.com/drewmlawton/JIB-4109.git
cd JIB-4109
```

#### Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```
Start the frontend application:
```npm run start```

The frontend is built using React Native and Expo with TypeScript. After running the start command, you can access the frontend app as specified by the output from the Expo CLI.

#### Backend

Navigate to the backend directory, set up the Python virtual environment, and install dependencies:

```
cd backend
python -m venv env
source env/bin/activate  # On Windows use `env\Scripts\activate`
pip install -r requirements.txt //required packages
```
Start the backend server:
```
cd robson_insight
python manage.py runserver

The backend is built using Django and Django REST Framework. It listens for requests as specified by Django's output in the console.
