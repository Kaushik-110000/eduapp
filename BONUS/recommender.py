# recommender.py

from analyzer import analyze_video_reviews
import numpy as np

def build_user_item_matrix(video_reviews: dict) -> dict:
    """
    Create a user-item matrix with:
    Positive -> +1
    Neutral  -> 0
    Negative -> -1
    """
    analyzed = analyze_video_reviews(video_reviews)
    matrix = {}

    for video_id, users in analyzed.items():
        for user_id, sentiment in users.items():
            if user_id == "overall":
                continue

            if user_id not in matrix:
                matrix[user_id] = {}
            if sentiment == "Positive":
                matrix[user_id][video_id] = 1
            elif sentiment == "Negative":
                matrix[user_id][video_id] = -1
            else:
                matrix[user_id][video_id] = 0

    return matrix

def recommend_for_user(user_id: str, video_reviews: dict, top_k=3) -> list:
    """
    Recommend videos to a user based on similar users' preferences.
    """
    matrix = build_user_item_matrix(video_reviews)

    if user_id not in matrix:
        return []  # No data for this user

    # Compute similarity: simple dot product
    target_user = matrix[user_id]
    scores = {}

    for other_user, other_ratings in matrix.items():
        if other_user == user_id:
            continue
        # calculate similarity
        common_videos = set(target_user.keys()) & set(other_ratings.keys())
        if not common_videos:
            continue

        sim = sum(target_user[v] * other_ratings[v] for v in common_videos)
        if sim > 0:
            scores[other_user] = sim

    # Collect videos liked by similar users but not seen by target_user
    video_candidates = {}

    for similar_user in sorted(scores, key=scores.get, reverse=True):
        for video_id, rating in matrix[similar_user].items():
            if video_id not in target_user:
                if rating == 1:  # only positive rated videos
                    video_candidates[video_id] = video_candidates.get(video_id, 0) + scores[similar_user]

    # Sort and pick top_k
    recommended = sorted(video_candidates, key=video_candidates.get, reverse=True)[:top_k]

    return recommended
