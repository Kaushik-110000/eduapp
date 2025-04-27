from pymongo import MongoClient
import google.generativeai as genai
from typing import List, Dict, Any
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB connection setup
MONGO_URI = "mongodb+srv://abhishekkumar89647:nHMLX22uhFjYx6uS@cluster0.9izcvug.mongodb.net"
client = MongoClient(MONGO_URI)
DB_NAME = 'project'
COURSE_COLLECTION = "courses"

# Google Gemini setup
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('models/gemini-1.5-pro-002')

class LLMCourseBot:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        self.collection = self.db[COURSE_COLLECTION]
        self.conversation_history = []

    def process_query(self, user_query: str) -> Dict[str, Any]:
        """Main function to process query - fetch all courses and ask LLM to pick"""
        try:
            # Step 1: Fetch all courses from the database
            all_courses = list(self.collection.find({}))
            print(f"Fetched {len(all_courses)} courses from the database.")

            # Step 2: Prepare the course information
            course_info = [
                {
                    "courseName": course.get("courseName", ""),
                    "price": course.get("coursePrice", ""),
                    "category": course.get("tags", ""),
                    "courseDescription": course.get("courseDescription", "")
                }
                for course in all_courses
            ]

            print(course_info)
            # Step 3: Build the prompt
            llm_prompt = f"""You are a course recommendation system.
Given the following course catalog and a user query, pick the top 5 best matching courses.

User Query: "{user_query}"

Course Catalog:
{json.dumps(course_info, indent=2)}

Return a JSON list like:
[
  {{"courseName": "...", "price": ..., "category": "...", "courseDescription": "..."}},
  ...
]
Keep reason short (1-2 lines) why each course fits the user query.
"""

            # Step 4: Send to Gemini LLM
            response = model.generate_content(
                llm_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    top_p=0.9,
                    top_k=40
                )
            )

            response_text = response.text.strip()
            print(f"LLM Response: {response_text}")

            # Step 5: Parse LLM response carefully
            course_list = []
            try:
                # Try to load the entire response
                course_list = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract the first JSON array if LLM adds extra text
                start = response_text.find('[')
                end = response_text.rfind(']') + 1
                if start != -1 and end != -1:
                    json_part = response_text[start:end]
                    course_list = json.loads(json_part)
                else:
                    print("❌ Could not parse valid JSON from LLM response.")

            return {
                "summary": f"Here are the top recommended courses for you based on your query '{user_query}'!",
                "courses": course_list
            }

        except Exception as e:
            print(f"Error in process_query: {str(e)}")
            return {
                "summary": f"Error while processing your query: {str(e)}",
                "courses": []
            }

    def get_suggestions(self, user_query: str) -> List[str]:
        """Generate follow-up questions"""
        if not self.conversation_history:
            return []

        suggestion_prompt = f"""Suggest 3 follow-up course-related questions based on the following:

Current Query: {user_query}

Conversation History:
{json.dumps(self.conversation_history[-3:], indent=2)}

Return exactly 3 follow-up questions, one per line.
"""

        try:
            response = model.generate_content(
                suggestion_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40
                )
            )
            suggestions = response.text.strip().split('\n')
            return [s.strip() for s in suggestions if s.strip()][:3]
        except Exception as e:
            print(f"Error generating suggestions: {str(e)}")
            return []

def main():
    bot = LLMCourseBot()
    print("🎓 Course Recommender Bot Initialized. Type 'exit' to quit.")

    while True:
        user_input = input("\n👤 Your query: ").strip()

        if user_input.lower() == 'exit':
            print("\n👋 Goodbye! Happy Learning!")
            break

        print("\n🤖 Processing your query...")
        output = bot.process_query(user_input)

        print("\n📄 Summary:")
        print(output["summary"])

        print("\n🧾 Course List:")
        print(json.dumps(output["courses"], indent=2))

        suggestions = bot.get_suggestions(user_input)
        if suggestions:
            print("\n💡 You might also want to ask:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"{i}. {suggestion}")

if __name__ == "__main__":
    main()
