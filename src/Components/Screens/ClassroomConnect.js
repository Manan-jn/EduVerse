import React, { useEffect, useState } from 'react';

const YOUR_CLIENT_ID = '50545024716-tuchfr1dkldehq5p1d4sjbusi5rfeset.apps.googleusercontent.com';
const YOUR_REDIRECT_URI = 'http://localhost:3000/home';

const GoogleClassroomIntegration = () => {
    const upcomingCoursesList = [];

    const [courses, setCourses] = useState([]);
    const [upcomingCourses, setUpcomingCourses] = useState([]);

    useEffect(() => {
        const fragmentString = window.location.hash.substring(1);
        const params = {};

        const regex = /([^&=]+)=([^&]*)/g;
        let m;

        while ((m = regex.exec(fragmentString))) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }

        if (Object.keys(params).length > 0) {
            localStorage.setItem('oauth2-test-params', JSON.stringify(params));

            if (params['state'] && params['state'] === 'try_sample_request') {
                connectGClassroom();
            }
        }
    }, []);

    const connectGClassroom = async () => {
        const params = JSON.parse(localStorage.getItem('oauth2-test-params'));

        if (params && params['access_token']) {
            const xhr = new XMLHttpRequest();
            xhr.open(
                'GET',
                `https://classroom.googleapis.com/v1/courses?access_token=${params['access_token']}`
            );

            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const coursesResponse = JSON.parse(xhr.responseText);
                    setCourses(coursesResponse.courses);
                    getCoursesWork();
                } else if (xhr.readyState === 4 && xhr.status === 401) {
                    oauth2SignIn();
                }
            };

            xhr.send(null);
        } else {
            oauth2SignIn();
        }
    };

    const getCoursesWork = async () => {
        const upcomingCoursesList = [];
        const fetchPromises = [];

        for (const course of courses) {
            const courseId = course.id;
            const params = JSON.parse(localStorage.getItem('oauth2-test-params'));

            const xhr = new XMLHttpRequest();
            xhr.open(
                'GET',
                `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?access_token=${params['access_token']}`
            );

            const fetchPromise = new Promise((resolve, reject) => {
                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        const courseworkResponse = JSON.parse(xhr.responseText);
                        const coursework = courseworkResponse.courseWork || [];


                        coursework.forEach((work) => {
                            console.log(`  - Coursework: ${work.title}`);

                            if (!work.dueDate) {
                                console.log('    - Due Date: No due date');
                                return;
                            }

                            const dueDateObject = work.dueDate;
                            const dueDate = new Date(dueDateObject.year, dueDateObject.month - 1, dueDateObject.day);
                            console.log(`    - Due Date: ${dueDate.toLocaleDateString()}`);

                            const today = new Date();

                            if (dueDate > today) {
                                const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                                console.log(`    - Upcoming: ${daysRemaining} days remaining.`);
                                upcomingCoursesList.push({
                                    courseTitle: course.name,
                                    courseWorkTitle: work.title,
                                    daysRemaining: daysRemaining,
                                });
                            }
                        });
                        resolve();
                    } else if (xhr.readyState === 4 && xhr.status === 401) {
                        reject();
                    }
                };

                xhr.send(null);
            });

            fetchPromises.push(fetchPromise);
        }

        try {
            await Promise.all(fetchPromises);
            setUpcomingCourses(upcomingCoursesList);
        } catch (error) {
            oauth2SignIn();
        }
    };

    const oauth2SignIn = () => {
        const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

        const form = document.createElement('form');
        form.setAttribute('method', 'GET');
        form.setAttribute('action', oauth2Endpoint);

        const params = {
            client_id: YOUR_CLIENT_ID,
            redirect_uri: YOUR_REDIRECT_URI,
            scope: [

                // 'https://www.googleapis.com/auth/classroom.courses.readonly',
                // 'https://www.googleapis.com/auth/classroom.coursework.me',
                'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly',
            ],
            state: 'try_sample_request',
            include_granted_scopes: 'true',
            response_type: 'token',
        };

        for (const p in params) {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', p);
            input.setAttribute('value', params[p]);
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    };

    useEffect(() => {
    }, []);

    return (
        <div>
            <div>
                <h2>Upcoming Assignments</h2>
                <ul>
                    {upcomingCourses.map((upcomingCourse, index) => (
                        <li key={index}>
                            <strong>{upcomingCourse.courseTitle}</strong>: {upcomingCourse.courseWorkTitle} - Due in {upcomingCourse.daysRemaining} days
                        </li>
                    ))}
                </ul>
                <button onClick={connectGClassroom}>Connect with Google Classroom</button>
            </div>
        </div>
    );
};

export default GoogleClassroomIntegration;
