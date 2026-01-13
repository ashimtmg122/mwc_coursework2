# KnowledgeHub – MWC Coursework

KnowledgeHub is a Knowledge Management System built using Laravel for the backend API and React for the frontend.  
The system supports role-based access control, content approval workflows, notifications, workspace collaboration, and system health monitoring.

## Requirements

PHP 8.3 or higher  
Composer  
Node.js 18 or higher  
NPM  
SQLite or MySQL

## Setup

Clone the repository and move into the project directory.

git clone <your-repo-url>  
cd mwc_coursework

Install the backend dependencies and prepare the Laravel environment.

composer install  
cp .env.example .env  
php artisan key:generate

Set up the database. The project uses SQLite by default, which requires creating a local database file and running migrations.

php artisan migrate:fresh --seed

Install the frontend dependencies and build the assets.

npm install  
npm run build

## Running the Application

Start the Laravel backend server.

php artisan serve

In a new terminal, start the React development server.

npm run dev

For notifications and background jobs, run the queue worker in another terminal.

php artisan queue:work

Open the application in your browser at:

http://localhost:8000

## Demo Users

The database seeder creates the following users for testing.

Admin  
Email: admin@admin.com  
Password: password

Manager  
Email: manager@admin.com  
Password: password

Employee  
Email: employee@admin.com  
Password: password

## System Health

The system health dashboard is available at:

/dashboard/system-health

Only Admin and Manager roles can access this page.  
If no logs appear, make sure you have logged in or logged out at least once.

## Notifications

Notifications use Laravel queues.  
If you are not running `php artisan queue:work`, set the following in your `.env` file.

QUEUE_CONNECTION=sync

Then restart the Laravel server.

## Troubleshooting

If you see “Vite manifest not found”, run:

npm run build
