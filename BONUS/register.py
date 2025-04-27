import os
import time
import random
import requests
from faker import Faker
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# -------- CONFIGURATION --------
BASE_URL = "http://localhost:5173/register"
NUM_STUDENTS = 50
IMAGE_DIR = "images"
# Courses for interests
courseNames = [
    "Full Stack Web Development","Frontend Development","Backend Development","DevOps Engineering",
    "Artificial Intelligence","Machine Learning","Deep Learning","Data Structures & Algorithms",
    "Cloud Computing","Cyber Security","Android App Development","iOS App Development",
    "Database Management","Blockchain Development","Augmented Reality","Virtual Reality",
    "Software Testing","Game Development","Computer Vision","Natural Language Processing",
]

# Make sure image directory exists
os.makedirs(IMAGE_DIR, exist_ok=True)

# Initialize Faker and WebDriver
fake = Faker("en_IN")
driver = webdriver.Chrome()  # or webdriver.Firefox()

wait = WebDriverWait(driver, 10)

for i in range(1, NUM_STUDENTS + 1):
    sid       = f"Stu{i}"
    name      = fake.name()
    email     = f"stu{i}@gmail.com"
    password  = str(i)
    interests = ", ".join(random.sample(courseNames, k=3))

    # 1) Download a random 500×500 image
    img_path = os.path.join(IMAGE_DIR, f"stu{i}.jpg")
    resp = requests.get("https://picsum.photos/500/500")
    with open(img_path, "wb") as f:
        f.write(resp.content)

    # 2) Open registration page
    driver.get(BASE_URL)

    # 3) Select "student" radio
    student_radio = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'input[type="radio"][value="student"]')))
    student_radio.click()

    # 4) Fill in ID, name, email
    driver.find_element(By.NAME, "id").send_keys(sid)
    driver.find_element(By.NAME, "name").send_keys(name)
    driver.find_element(By.NAME, "email").send_keys(email)

    # 5) Fill in password & confirm
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.NAME, "confirmPassword").send_keys(password)

    # 6) Fill in interests
    driver.find_element(By.NAME, "interests").send_keys(interests)

    # 7) Upload profile image
    driver.find_element(By.CSS_SELECTOR, 'input[type="file"]').send_keys(os.path.abspath(img_path))

    # 8) Submit form
    driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

    # 9) Wait a bit for the registration to process (adjust as needed)
    time.sleep(1)

# Cleanup
driver.quit()
print("Done registering 50 students!")
