FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/tests ./tests
COPY backend/samples ./samples
COPY contracts ./contracts

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
