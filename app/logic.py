# app/logic.py

def predict_risk(age, smoking_history, pollution_level, genetic_risk):
    if genetic_risk == "positive" and (age > 50 or smoking_history == "current smoker"):
        return "High", "Schedule early diagnostic tests."
    elif pollution_level == "high" and (smoking_history == "current smoker" or age > 60):
        return "High", "Schedule early diagnostic tests."
    elif smoking_history == "former smoker" and pollution_level in ["medium", "high"]:
        return "Medium", "Recommend periodic check-ups."
    elif age > 55 and pollution_level == "medium":
        return "Medium", "Recommend periodic check-ups."
    else:
        return "Low", "Maintain healthy habits and regular checkups."
