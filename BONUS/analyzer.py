# # analyzer.py

# import nltk
# from nltk.sentiment.vader import SentimentIntensityAnalyzer

# # Download once
# nltk.download('vader_lexicon')

# # Init analyzer
# _analyzer = SentimentIntensityAnalyzer()

# def analyze_video_reviews(video_reviews: dict) -> dict:
#     results = {}
#     for vid, reviews in video_reviews.items():
#         total = 0.0
#         video_result = {}
#         for r in reviews:
#             scores = _analyzer.polarity_scores(r["review"])
#             c = scores["compound"]
#             total += c
#             label = (
#                 "Positive" if c >= 0.05 else
#                 "Negative" if c <= -0.05 else
#                 "Neutral"
#             )
#             video_result[r["user_id"]] = label

#         avg = total / len(reviews) if reviews else 0.0
#         overall = (
#             "Positive" if avg >= 0.05 else
#             "Negative" if avg <= -0.05 else
#             "Neutral"
#         )
#         video_result["overall"] = overall
#         results[vid] = video_result
#     return results


import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download once
nltk.download('vader_lexicon')

# Init analyzer
_analyzer = SentimentIntensityAnalyzer()

def analyze_video_reviews(video_reviews: dict) -> dict:
    results = {}
    for vid, reviews in video_reviews.items():
        video_result = {}
        pos_count = neg_count = neu_count = 0

        for r in reviews:
            scores = _analyzer.polarity_scores(r["review"])
            c = scores["compound"]

            label = (
                "Positive" if c >= 0.05 else
                "Negative" if c <= -0.05 else
                "Neutral"
            )

            if label == "Positive":
                pos_count += 1
            elif label == "Negative":
                neg_count += 1
            else:
                neu_count += 1

            video_result[r["user_id"]] = label

        # --- Smarter overall sentiment logic ---
        total_votes = pos_count + neg_count

        if total_votes == 0:
            overall = "Neutral"  # Only neutrals, no strong reviews
        else:
            margin = max(1, int(0.05 * total_votes))  # 5% of votes or at least 1 vote margin
            diff = abs(pos_count - neg_count)

            if pos_count == neg_count:
                overall = "Neutral"
            elif diff <= margin:
                overall = "Neutral"
            elif pos_count > neg_count:
                overall = "Positive"
            else:
                overall = "Negative"

        video_result["overall"] = overall
        results[vid] = video_result

    return results
