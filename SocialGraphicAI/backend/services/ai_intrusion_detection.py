# backend/services/ai_intrusion_detection.py

import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_intrusion(log_csv_path):
    try:
        df = pd.read_csv(log_csv_path)
        model = IsolationForest(contamination=0.01)
        df['anomaly'] = model.fit_predict(df.select_dtypes(include=['number']))

        anomalies = df[df['anomaly'] == -1]
        return {"anomalies_detected": len(anomalies), "details": anomalies.to_dict(orient='records')}
    except Exception as e:
        return {"error": str(e)}
