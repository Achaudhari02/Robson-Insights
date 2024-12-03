# Robson Classification Application

The Robson Insights app is a specialized tool designed for healthcare professionals to engage in anonymized data collection and analysis concerning the Robson classification system. This application enables users within an organization to complete quizzes based on the Robson classification group of a patient, fostering a collaborative and informed approach to patient categorization in obstetric care.\

# Release Notes

## Version 0.4.0
### Features
- Added HTML styles to email invite and changed sender email to robsoninsights.gmail.com
- Added expected C-Section percentages/benchmarks per classification group for comparison
- Added ability to create reports based on date-ranges passed in by user
- Update quiz result page to allow user to discard result
- ### Bug Fixes
- Fixed issue where exit button for Detailed Pie Chart screen would not appear
- Fixed issue where CSV import would not parse correctly
- Fixed problem with CSV data export where data would be seperated by semicolon
### Known Issues
- Bar chart visualization on mobile will overflow off of screen if there are too many entries
- Groups screen UI is clunky and unintuitive

## Version 0.3.0
### Features
- Added Bar Chart Visiulization for Robson results analysis
- Added Pie Chart Visiulization for Robson results analysis
- Added export button to chart page to save visualizations
- Added description to quiz results screen for information on classification meaning
- Added ability mass invite users to group via CSV import
- Implemented filtering/configuration of results viewing page
### Bug Fixes
- Improved User Interface of Groups tab for non-mobile users
- Fixed issue where existing users invited to group would not receive invite
### Known Issues
- CSV file import for mass group invite is sometimes not properly parsed
- Charts export only exports one of two graphs when should be both 

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

####Backend

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
