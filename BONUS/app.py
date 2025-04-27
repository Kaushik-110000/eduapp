from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import recommend_for_user
from analyzer import analyze_video_reviews
from courseRecommender import recommend_courses_for_student
from courseBot import LLMCourseBot

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})  # Allow requests from your frontend
course_bot = LLMCourseBot()  # Initialize the course bot instance

@app.route("/")
def home():
    return "Sentiment+Recommender API is up!"

# 1) Analyze endpoint now accepts POST with JSON body
@app.route("/analyze", methods=["POST"])
def analyze_reviews():
    video_reviews = request.get_json()
    if not video_reviews or not isinstance(video_reviews, dict):
        return jsonify({"error": "No input data provided or bad format"}), 400

    result = analyze_video_reviews(video_reviews)
    return jsonify(result), 200

# 2) Recommend endpoint also POSTs the same reviews payload
@app.route("/recommend/<user_id>", methods=["POST"])
def recommend(user_id):
    video_reviews = request.get_json()
    if not video_reviews or not isinstance(video_reviews, dict):
        return jsonify({"error": "No input data provided or bad format"}), 400

    recs = recommend_for_user(user_id, video_reviews)
    return jsonify({"user_id": user_id, "recommendations": recs}), 200


#3 recommend courses

@app.route("/courseRecommend/<student_id>", methods=["POST"])
def courseRecommend(student_id):
    # Get top_n value from the request (defaults to 5)
    top_n = request.json.get('top_n', 5)

    recommended_courses = recommend_courses_for_student(student_id, top_n)
    
    if not recommended_courses:
        return jsonify({"error": "No recommendations found or invalid student ID"}), 400

    return jsonify({
        "student_id": student_id,
        "recommended_courses": recommended_courses
    }), 200

@app.route("/courseBot", methods=["POST"])
def course_bot_recommend():
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "No query provided in request body"}), 400
    
    user_query = data['query']
    result = course_bot.process_query(user_query)
    
    # Get follow-up suggestions
    suggestions = course_bot.get_suggestions(user_query)
    result['suggestions'] = suggestions
    
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)