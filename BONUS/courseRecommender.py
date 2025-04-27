from pymongo import MongoClient

mongo_uri = "mongodb+srv://abhishekkumar89647:nHMLX22uhFjYx6uS@cluster0.9izcvug.mongodb.net"
client = MongoClient(mongo_uri)
db = client['project']  # replace with your database name
# db = client.get_database()  # gets the default database from URI
# print(f"Connected to database: {db.name}")
students_collection = db['students']
courses_collection = db['courses']
# (similarly for admin, payment, tutor if needed)


from collections import Counter

def recommend_courses_for_student(student_id, top_n=5):
    # 1. Get courses the student is currently subscribed to
    student = students_collection.find_one({'_id': student_id})
    # print(f"Student data for ID {student_id}: {student}")
    if not student:
        return []

    subscribed_courses = student.get('coursesSubscribed', [])
    # print(f"Subscribed courses for student {student_id}: {subscribed_courses}")
    # print(f"Subscribed courses for student {student_id}: {subscribed_courses}")
    if not subscribed_courses:
        return []

    # 2. Find all students enrolled in any of these courses
    similar_students = students_collection.find({
        'coursesSubscribed': {'$in': subscribed_courses},
        '_id': {'$ne': student_id}  # exclude the current student
    })
    # print(f"Similar student IDs found: {[student['_id'] for student in similar_students]}")

    # 3. Get their enrolled courses
    course_counter = Counter()
    for sim_student in similar_students:
        sim_courses = sim_student.get('coursesSubscribed', [])
        course_counter.update(sim_courses)

    # 4. Remove already subscribed courses
    for course in subscribed_courses:
        if course in course_counter:
            del course_counter[course]

    # 5. Sort and return top N recommended courses
    recommended_courses = course_counter.most_common(top_n)
    
    # Optional: Get full course details
    recommended_course_details = []
    for course_id, count in recommended_courses:
        course = courses_collection.find_one({'_id': course_id})
        if course:
            recommended_course_details.append({
                'course_id': course_id,
                'course_name': course.get('courseName'),
                'popularity_score': count
            })
   
    return recommended_course_details
# print(recommend_courses_for_student('b3d4d188b416d07558c597d8', 5))
# recommend_courses_for_student('95d28f006c4396da87372500', 5)